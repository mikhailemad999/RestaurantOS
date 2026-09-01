import datetime
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count, Avg, F
from decimal import Decimal
import random

from .models import (
    StaffMember, MenuCategory, MenuItem, DiningTable, Customer,
    Order, OrderItem, InventoryItem, InventoryMovement, RecipeIngredient,
    DeliveryOrder, CashShift, SystemSetting, OrderStatus, OrderItemStatus,
    TableStatus, DeliveryStatus, MovementType
)

class RestaurantService:
    @staticmethod
    def authenticate_by_pin(pin_code):
        return StaffMember.objects.filter(pin_code=pin_code, is_active=True).first()

    @staticmethod
    @transaction.atomic
    def create_pos_order(data):
        """
        data = {
            'order_type': 'DINE_IN',
            'table_id': 1,
            'customer_id': 2,
            'server_id': 3,
            'guest_count': 2,
            'discount_amount': 0.00,
            'tip_amount': 5.00,
            'payment_method': 'CARD',
            'payment_status': 'PAID',
            'special_instructions': 'Extra crispy fries',
            'items': [
                {
                    'menu_item_id': 1,
                    'quantity': 2,
                    'selected_modifiers': [{'name': 'Medium Rare', 'price_extra': 0}],
                    'notes': 'No salt'
                }
            ],
            'delivery_address': '...',
            'delivery_phone': '...',
            'customer_name': '...'
        }
        """
        # Generate unique order number
        prefix = "ORD"
        timestamp_str = timezone.now().strftime("%y%m%d")
        rand_num = random.randint(1000, 9999)
        order_number = f"{prefix}-{timestamp_str}-{rand_num}"

        table = None
        if data.get('table_id'):
            try:
                table = DiningTable.objects.get(id=data['table_id'])
            except DiningTable.DoesNotExist:
                pass

        customer = None
        if data.get('customer_id'):
            try:
                customer = Customer.objects.get(id=data['customer_id'])
            except Customer.DoesNotExist:
                pass

        server = None
        if data.get('server_id'):
            try:
                server = StaffMember.objects.get(id=data['server_id'])
            except StaffMember.DoesNotExist:
                pass

        order_type = data.get('order_type', 'DINE_IN')
        payment_status = data.get('payment_status', 'PAID' if data.get('payment_method') != 'PENDING' else 'UNPAID')

        order = Order.objects.create(
            order_number=order_number,
            order_type=order_type,
            status=OrderStatus.PREPARING,
            table=table,
            customer=customer,
            server=server,
            guest_count=data.get('guest_count', 1),
            special_instructions=data.get('special_instructions', ''),
            payment_method=data.get('payment_method', 'CARD'),
            payment_status=payment_status,
            tip_amount=Decimal(str(data.get('tip_amount', 0.00))),
            discount_amount=Decimal(str(data.get('discount_amount', 0.00))),
        )

        subtotal = Decimal('0.00')

        # Create line items
        for item_data in data.get('items', []):
            try:
                menu_item = MenuItem.objects.get(id=item_data['menu_item_id'])
            except MenuItem.DoesNotExist:
                continue

            quantity = int(item_data.get('quantity', 1))
            unit_price = menu_item.price
            
            # Calculate modifier add-ons
            mod_extra = Decimal('0.00')
            modifiers = item_data.get('selected_modifiers', [])
            for mod in modifiers:
                mod_extra += Decimal(str(mod.get('price_extra', 0)))

            item_total = (unit_price + mod_extra) * quantity
            subtotal += item_total

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                unit_price=unit_price + mod_extra,
                total_price=item_total,
                status=OrderItemStatus.COOKING,
                station=menu_item.station,
                selected_modifiers=modifiers,
                notes=item_data.get('notes', '')
            )

            # Deduct inventory for recipe ingredients
            for recipe in menu_item.recipe_ingredients.all():
                needed = recipe.quantity_required * quantity
                inv = recipe.inventory_item
                inv.current_stock = max(Decimal('0.00'), inv.current_stock - needed)
                inv.save()
                InventoryMovement.objects.create(
                    item=inv,
                    movement_type=MovementType.USAGE,
                    quantity=needed,
                    reason=f"Order #{order_number} ({menu_item.name})"
                )

        # Tax calculation (e.g. 8.25%)
        tax_rate = Decimal('0.0825')
        tax_amount = (subtotal - order.discount_amount) * tax_rate
        if tax_amount < Decimal('0.00'):
            tax_amount = Decimal('0.00')

        total_amount = subtotal - order.discount_amount + tax_amount + order.tip_amount

        order.subtotal = subtotal
        order.tax_amount = round(tax_amount, 2)
        order.total_amount = round(total_amount, 2)
        order.save()

        # If table is assigned, mark occupied
        if table:
            table.status = TableStatus.OCCUPIED
            table.current_order_id = order.id
            table.seated_at = timezone.now()
            table.guest_count = order.guest_count
            table.save()

        # If customer exists, update spending and loyalty points (1 point per dollar)
        if customer:
            customer.total_spent += order.total_amount
            customer.loyalty_points += int(order.total_amount)
            customer.visit_count += 1
            customer.last_visit = timezone.now()
            # Tier upgrade logic
            if customer.total_spent >= Decimal('2000.00'):
                customer.vip_tier = 'PLATINUM'
            elif customer.total_spent >= Decimal('1000.00'):
                customer.vip_tier = 'GOLD'
            elif customer.total_spent >= Decimal('400.00'):
                customer.vip_tier = 'SILVER'
            customer.save()

        # If delivery order, create DeliveryOrder record
        if order_type == 'DELIVERY':
            DeliveryOrder.objects.create(
                order=order,
                delivery_address=data.get('delivery_address', '124 Market St, Suite 400'),
                customer_phone=data.get('delivery_phone', customer.phone if customer else '555-0199'),
                customer_name=data.get('customer_name', customer.name if customer else 'Valued Guest'),
                delivery_status=DeliveryStatus.UNASSIGNED,
                estimated_minutes=35
            )

        return order

    @staticmethod
    def get_bi_metrics():
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Today's sales
        today_orders = Order.objects.filter(created_at__gte=today_start, payment_status='PAID')
        today_revenue = today_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        today_order_count = today_orders.count()
        today_avg_ticket = today_revenue / today_order_count if today_order_count > 0 else Decimal('0.00')

        # Table turnover
        total_tables = DiningTable.objects.count()
        occupied_tables = DiningTable.objects.filter(status=TableStatus.OCCUPIED).count()
        occupancy_rate = (occupied_tables / total_tables * 100) if total_tables > 0 else 0

        # Kitchen speed
        active_kds_tickets = Order.objects.filter(status__in=[OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]).count()

        # Top selling items
        top_items = OrderItem.objects.values('menu_item__name').annotate(
            qty=Sum('quantity'),
            rev=Sum('total_price')
        ).order_by('-qty')[:5]

        # Low stock alerts count
        low_stock_count = InventoryItem.objects.filter(current_stock__lte=F('minimum_stock')).count()

        return {
            'today_revenue': float(today_revenue),
            'today_order_count': today_order_count,
            'today_avg_ticket': round(float(today_avg_ticket), 2),
            'total_tables': total_tables,
            'occupied_tables': occupied_tables,
            'occupancy_rate': round(occupancy_rate, 1),
            'active_kds_tickets': active_kds_tickets,
            'top_items': list(top_items),
            'low_stock_count': low_stock_count
        }
