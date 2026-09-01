from decimal import Decimal
from django.db.models import Count, Sum, Avg
from .models import Customer, Order, OrderItem, MenuItem, CustomerAddress

class RepeatOrderService:
    @staticmethod
    def get_last_order(customer_id: int):
        """
        Fetches the customer's most recent completed or preparing order,
        revalidates every item's live current menu price and availability.
        Never blindly copies historical prices.
        """
        last_order = Order.objects.filter(customer_id=customer_id).order_by('-created_at').first()
        if not last_order:
            return None

        revalidated_items = []
        price_changed = False
        has_unavailable_items = False

        for oi in last_order.items.all():
            current_menu_item = MenuItem.objects.filter(id=oi.menu_item_id).first()
            is_available = current_menu_item.is_available if current_menu_item else False
            current_price = Decimal(str(current_menu_item.price)) if current_menu_item else oi.unit_price
            
            if current_price != oi.unit_price:
                price_changed = True
            if not is_available:
                has_unavailable_items = True

            revalidated_items.append({
                'menu_item_id': oi.menu_item_id,
                'name': oi.menu_item.name if oi.menu_item else 'Unavailable Item',
                'quantity': oi.quantity,
                'historical_unit_price': float(oi.unit_price),
                'current_unit_price': float(current_price),
                'current_total_price': float(current_price * oi.quantity),
                'is_available': is_available,
                'selected_modifiers': oi.selected_modifiers,
                'notes': oi.notes,
                'station': oi.station
            })

        return {
            'order_id': last_order.id,
            'order_number': last_order.order_number,
            'order_date': last_order.created_at,
            'historical_total': float(last_order.total_amount),
            'recalculated_subtotal': sum(item['current_total_price'] for item in revalidated_items),
            'items': revalidated_items,
            'price_changed': price_changed,
            'has_unavailable_items': has_unavailable_items,
            'delivery_address': last_order.delivery_info.delivery_address if hasattr(last_order, 'delivery_info') else None,
            'delivery_note': last_order.delivery_info.delivery_note if hasattr(last_order, 'delivery_info') else ''
        }

    @staticmethod
    def get_favorite_items(customer_id: int, limit: int = 5):
        """
        Calculates the most frequently ordered items for this customer.
        Returns live prices and availability for 1-click addition to cart.
        """
        favorites = (
            OrderItem.objects.filter(order__customer_id=customer_id)
            .values('menu_item_id', 'menu_item__name', 'menu_item__price', 'menu_item__is_available', 'menu_item__image_url', 'menu_item__category__name')
            .annotate(order_count=Sum('quantity'), total_spent=Sum('total_price'))
            .order_by('-order_count')[:limit]
        )

        result = []
        for f in favorites:
            result.append({
                'menu_item_id': f['menu_item_id'],
                'name': f['menu_item__name'],
                'price': float(f['menu_item__price']) if f['menu_item__price'] else 0.0,
                'is_available': f['menu_item__is_available'],
                'image_url': f['menu_item__image_url'],
                'category': f['menu_item__category__name'],
                'times_ordered': f['order_count'],
                'total_spent': float(f['total_spent']) if f['total_spent'] else 0.0
            })
        return result

    @staticmethod
    def calculate_customer_profile_stats(customer_id: int):
        """
        Calculates lifetime statistics across delivery and all order types.
        """
        orders = Order.objects.filter(customer_id=customer_id)
        total_orders = orders.count()
        completed_orders = orders.filter(status='COMPLETED').count()
        cancelled_orders = orders.filter(status='CANCELLED').count()
        total_spent = orders.filter(payment_status='PAID').aggregate(s=Sum('total_amount'))['s'] or Decimal('0.00')
        avg_ticket = (total_spent / completed_orders) if completed_orders > 0 else Decimal('0.00')

        delivery_orders_count = orders.filter(order_type='DELIVERY').count()
        dine_in_count = orders.filter(order_type='DINE_IN').count()
        takeout_count = orders.filter(order_type='TAKEOUT').count()

        # Favorite category
        fav_cat = (
            OrderItem.objects.filter(order__customer_id=customer_id)
            .values('menu_item__category__name')
            .annotate(cnt=Count('id'))
            .order_by('-cnt')
            .first()
        )

        return {
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_spent': float(total_spent),
            'average_order_value': float(avg_ticket),
            'delivery_orders_count': delivery_orders_count,
            'dine_in_count': dine_in_count,
            'takeout_count': takeout_count,
            'favorite_category': fav_cat['menu_item__category__name'] if fav_cat else 'N/A'
        }
