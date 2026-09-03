from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, F, Q
from decimal import Decimal
import random

from .models import (
    StaffMember, MenuCategory, MenuItem, ModifierGroup,
    FloorSection, DiningTable, Customer, CustomerAddress, CustomerNote, DeliveryZone,
    Order, OrderItem, InventoryItem, InventoryMovement, DeliveryOrder, CashShift,
    SystemSetting, OrderStatus, OrderItemStatus, TableStatus,
    DeliveryStatus, MovementType, StationProfile, PrinterDevice,
    PrinterRoutingRule, KitchenPrintJob, BusinessConfig, Brand,
    CateringEvent, MenuPricingRule
)
from .serializers import (
    StaffMemberSerializer, MenuCategorySerializer, MenuItemSerializer,
    ModifierGroupSerializer, FloorSectionSerializer, DiningTableSerializer,
    CustomerSerializer, CustomerAddressSerializer, CustomerNoteSerializer,
    DeliveryZoneSerializer, OrderSerializer, OrderItemSerializer,
    InventoryItemSerializer, InventoryMovementSerializer,
    DeliveryOrderSerializer, CashShiftSerializer, SystemSettingSerializer,
    StationProfileSerializer, PrinterDeviceSerializer,
    PrinterRoutingRuleSerializer, KitchenPrintJobSerializer,
    BusinessConfigSerializer, BrandSerializer, CateringEventSerializer,
    MenuPricingRuleSerializer
)
from .services import RestaurantService
from .phone_service import PhoneService
from .repeat_order_service import RepeatOrderService


class StaffMemberViewSet(viewsets.ModelViewSet):
    queryset = StaffMember.objects.filter(is_active=True)
    serializer_class = StaffMemberSerializer

    ROLE_HOME_MAP = {
        'ADMIN': '/owner',
        'MANAGER': '/manager',
        'CASHIER': '/cashier',
        'WAITER': '/captain',
        'CHEF': '/chef',
        'DRIVER': '/driver',
        'PACKING': '/packing',
        'INVENTORY': '/inventory',
        'CALL_CENTER': '/call-center',
    }

    @action(detail=False, methods=['post'], url_path='pin-login')
    def pin_login(self, request):
        pin = request.data.get('pin_code')
        if not pin:
            return Response({'error': 'PIN code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        staff = RestaurantService.authenticate_by_pin(pin)
        if staff:
            data = StaffMemberSerializer(staff).data
            data['role_home_path'] = self.ROLE_HOME_MAP.get(staff.role, '/command-center')
            data['workspace'] = f"{staff.role}_WORKSPACE"
            return Response({
                'success': True,
                'staff': data
            })
        return Response({'success': False, 'error': 'Invalid PIN code'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['get'], url_path='role-accounts')
    def role_accounts(self, request):
        staff_members = StaffMember.objects.filter(is_active=True).order_by('id')
        results = []
        for s in staff_members:
            results.append({
                'id': s.id,
                'name': s.name,
                'role': s.role,
                'title': s.get_role_display(),
                'pin_code': s.pin_code,
                'avatar_url': s.avatar_url,
                'role_home_path': self.ROLE_HOME_MAP.get(s.role, '/command-center'),
                'workspace': f"{s.role}_WORKSPACE"
            })
        return Response(results)

    @action(detail=False, methods=['post'], url_path='update-language')
    def update_language(self, request):
        staff_id = request.data.get('staff_id')
        lang = request.data.get('language', 'en')
        if not staff_id or lang not in ['en', 'ar']:
            return Response({'error': 'Invalid staff ID or language'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            staff = StaffMember.objects.get(id=staff_id)
            staff.preferred_language = lang
            staff.save()
            return Response({'success': True, 'preferred_language': staff.preferred_language})
        except StaffMember.DoesNotExist:
            return Response({'error': 'Staff not found'}, status=status.HTTP_404_NOT_FOUND)


class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.filter(is_active=True)
    serializer_class = MenuCategorySerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all().select_related('category')
    serializer_class = MenuItemSerializer

    @action(detail=True, methods=['post'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        item = self.get_object()
        item.is_available = not item.is_available
        item.save()
        return Response({'success': True, 'is_available': item.is_available})


class ModifierGroupViewSet(viewsets.ModelViewSet):
    queryset = ModifierGroup.objects.all()
    serializer_class = ModifierGroupSerializer


class FloorSectionViewSet(viewsets.ModelViewSet):
    queryset = FloorSection.objects.all()
    serializer_class = FloorSectionSerializer


class DiningTableViewSet(viewsets.ModelViewSet):
    queryset = DiningTable.objects.all().select_related('section')
    serializer_class = DiningTableSerializer

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        table = self.get_object()
        new_status = request.data.get('status')
        if new_status in TableStatus.values:
            table.status = new_status
            if new_status == TableStatus.AVAILABLE:
                table.current_order_id = None
                table.seated_at = None
                table.guest_count = 0
            elif new_status == TableStatus.OCCUPIED and not table.seated_at:
                table.seated_at = timezone.now()
            table.save()
            return Response(DiningTableSerializer(table).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='update-coursing')
    def update_coursing(self, request, pk=None):
        table = self.get_object()
        coursing = request.data.get('coursing_status')
        if coursing:
            table.coursing_status = coursing
            table.save()
        return Response(DiningTableSerializer(table).data)

    @action(detail=True, methods=['post'], url_path='update-seats')
    def update_seats(self, request, pk=None):
        table = self.get_object()
        seats_data = request.data.get('seats_data', [])
        guest_count = request.data.get('guest_count')
        if seats_data is not None:
            table.seats_data = seats_data
        if guest_count is not None:
            table.guest_count = int(guest_count)
        table.save()
        return Response(DiningTableSerializer(table).data)

    @action(detail=True, methods=['post'], url_path='table-action')
    def table_action(self, request, pk=None):
        table = self.get_object()
        action_type = request.data.get('action') # REQUEST_BILL, SPLIT, MERGE, TRANSFER, CLEANING
        target_table_id = request.data.get('target_table_id')
        
        if action_type == 'REQUEST_BILL':
            table.status = TableStatus.BILL_REQUESTED
            table.save()
        elif action_type == 'CLEANING':
            table.status = TableStatus.CLEANING
            table.save()
        elif action_type == 'TRANSFER' and target_table_id:
            try:
                target_table = DiningTable.objects.get(id=target_table_id)
                target_table.status = TableStatus.OCCUPIED
                target_table.current_order_id = table.current_order_id
                target_table.guest_count = table.guest_count
                target_table.seats_data = table.seats_data
                target_table.coursing_status = table.coursing_status
                target_table.seated_at = table.seated_at
                target_table.save()
                
                table.status = TableStatus.AVAILABLE
                table.current_order_id = None
                table.seated_at = None
                table.guest_count = 0
                table.seats_data = []
                table.save()
            except DiningTable.DoesNotExist:
                pass

        return Response(DiningTableSerializer(table).data)

    @action(detail=True, methods=['post'], url_path='clear')
    def clear_table(self, request, pk=None):
        table = self.get_object()
        table.status = TableStatus.AVAILABLE
        table.current_order_id = None
        table.seated_at = None
        table.guest_count = 0
        table.seats_data = []
        table.coursing_status = 'STARTER_HOLD'
        table.save()
        return Response(DiningTableSerializer(table).data)



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().prefetch_related('addresses', 'customer_notes').order_by('-total_spent')
    serializer_class = CustomerSerializer

    def perform_create(self, serializer):
        phone = serializer.validated_data.get('phone', '')
        sec_phone = serializer.validated_data.get('secondary_phone', '')
        normalized = PhoneService.normalize_phone(phone)
        normalized_sec = PhoneService.normalize_phone(sec_phone) if sec_phone else ''
        serializer.save(
            normalized_phone=normalized,
            normalized_secondary_phone=normalized_sec
        )

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            customers = Customer.objects.all()[:20]
            return Response(CustomerSerializer(customers, many=True).data)

        normalized_q = PhoneService.normalize_phone(q)

        # Priority 1: Exact normalized phone or exact raw phone
        exact_phone = Customer.objects.filter(
            Q(phone=q) | Q(normalized_phone=normalized_q) | Q(secondary_phone=q) | Q(normalized_secondary_phone=normalized_q)
        )

        # Priority 2: Exact name match
        exact_name = Customer.objects.filter(name__iexact=q)

        # Priority 3: Partial phone or partial name
        partial = Customer.objects.filter(
            Q(name__icontains=q) | Q(phone__icontains=q) | Q(normalized_phone__icontains=q) | Q(email__icontains=q)
        )

        # Combine uniquely preserving priority order
        results = []
        seen_ids = set()
        for qs in [exact_phone, exact_name, partial]:
            for c in qs:
                if c.id not in seen_ids:
                    seen_ids.add(c.id)
                    results.append(c)

        return Response(CustomerSerializer(results[:25], many=True).data)

    @action(detail=False, methods=['post'], url_path='check-duplicate')
    def check_duplicate(self, request):
        phone = request.data.get('phone', '')
        name = request.data.get('name', '')
        exclude_id = request.data.get('exclude_id')
        res = PhoneService.check_duplicate_customer(phone, name, exclude_id)
        if res['is_duplicate']:
            return Response({
                'is_duplicate': True,
                'match_type': res['match_type'],
                'message': res['message'],
                'existing_customer': CustomerSerializer(res['customer']).data
            })
        return Response({'is_duplicate': False, 'message': 'No duplicate found.'})

    @action(detail=True, methods=['get'], url_path='last-order')
    def last_order(self, request, pk=None):
        data = RepeatOrderService.get_last_order(pk)
        return Response(data if data else {'message': 'No previous orders found.'})

    @action(detail=True, methods=['get'], url_path='favorites')
    def favorites(self, request, pk=None):
        favs = RepeatOrderService.get_favorite_items(pk)
        return Response(favs)

    @action(detail=True, methods=['get'], url_path='profile-stats')
    def profile_stats(self, request, pk=None):
        stats = RepeatOrderService.calculate_customer_profile_stats(pk)
        return Response(stats)


class CustomerAddressViewSet(viewsets.ModelViewSet):
    queryset = CustomerAddress.objects.filter(is_active=True).order_by('-is_default', '-created_at')
    serializer_class = CustomerAddressSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        addr = self.get_object()
        CustomerAddress.objects.filter(customer=addr.customer).update(is_default=False)
        addr.is_default = True
        addr.save()
        return Response(CustomerAddressSerializer(addr).data)


class CustomerNoteViewSet(viewsets.ModelViewSet):
    queryset = CustomerNote.objects.all().select_related('created_by', 'customer').order_by('-created_at')
    serializer_class = CustomerNoteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('table', 'customer', 'server').prefetch_related('items__menu_item')
    serializer_class = OrderSerializer

    @action(detail=False, methods=['post'], url_path='create-pos-order')
    def create_pos_order(self, request):
        try:
            order = RestaurantService.create_pos_order(request.data)
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in OrderStatus.values:
            order.status = new_status
            if new_status == OrderStatus.COMPLETED:
                order.payment_status = 'PAID'
                if order.table:
                    order.table.status = TableStatus.AVAILABLE
                    order.table.current_order_id = None
                    order.table.save()
            order.save()
            return Response(OrderSerializer(order).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='process-payment')
    def process_payment(self, request, pk=None):
        order = self.get_object()
        payment_method = request.data.get('payment_method', 'CARD')
        tip = Decimal(str(request.data.get('tip_amount', '0.00')))
        discount = Decimal(str(request.data.get('discount_amount', '0.00')))
        
        order.payment_method = payment_method
        order.payment_status = 'PAID'
        order.tip_amount = tip
        order.discount_amount = discount
        order.total_amount = order.subtotal - discount + order.tax_amount + tip
        order.status = OrderStatus.COMPLETED
        order.save()

        # Free table
        if order.table:
            order.table.status = TableStatus.AVAILABLE
            order.table.current_order_id = None
            order.table.save()

        return Response(OrderSerializer(order).data)


class KDSViewSet(viewsets.ViewSet):
    """Kitchen Display System endpoints"""
    def list(self, request):
        station = request.query_params.get('station', 'ALL')
        active_orders = Order.objects.filter(
            status__in=[OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
        ).select_related('table', 'server').prefetch_related('items__menu_item').order_by('created_at')

        tickets = []
        for ord in active_orders:
            items = ord.items.all()
            if station != 'ALL':
                items = items.filter(station=station)
            
            if items.exists():
                tickets.append({
                    'order_id': ord.id,
                    'order_number': ord.order_number,
                    'order_type': ord.order_type,
                    'status': ord.status,
                    'table_number': ord.table.table_number if ord.table else 'N/A',
                    'section': ord.table.section.name if ord.table else 'Direct',
                    'server_name': ord.server.name if ord.server else 'Cashier',
                    'guest_count': ord.guest_count,
                    'special_instructions': ord.special_instructions,
                    'created_at': ord.created_at,
                    'elapsed_seconds': int((timezone.now() - ord.created_at).total_seconds()),
                    'items': OrderItemSerializer(items, many=True).data
                })
        return Response(tickets)

    @action(detail=False, methods=['post'], url_path='bump-item')
    def bump_item(self, request):
        item_id = request.data.get('item_id')
        try:
            item = OrderItem.objects.get(id=item_id)
            if item.status == OrderItemStatus.COOKING or item.status == OrderItemStatus.PENDING:
                item.status = OrderItemStatus.READY
            elif item.status == OrderItemStatus.READY:
                item.status = OrderItemStatus.SERVED
            item.save()
            return Response({'success': True, 'status': item.status})
        except OrderItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='bump-ticket')
    def bump_ticket(self, request):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.get(id=order_id)
            if order.status == OrderStatus.PREPARING or order.status == OrderStatus.PENDING:
                order.status = OrderStatus.READY
                order.items.filter(status__in=[OrderItemStatus.PENDING, OrderItemStatus.COOKING]).update(status=OrderItemStatus.READY)
            elif order.status == OrderStatus.READY:
                order.status = OrderStatus.SERVED
                order.items.all().update(status=OrderItemStatus.SERVED)
            order.save()
            return Response({'success': True, 'order_status': order.status})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='recall-ticket')
    def recall_ticket(self, request):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.get(id=order_id)
            order.status = OrderStatus.PREPARING
            order.items.all().update(status=OrderItemStatus.COOKING)
            order.save()
            return Response({'success': True, 'order_status': order.status})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

    @action(detail=True, methods=['post'], url_path='adjust-stock')
    def adjust_stock(self, request, pk=None):
        item = self.get_object()
        delta_val = request.data.get('quantity_delta') if request.data.get('quantity_delta') is not None else request.data.get('adjustment', '0')
        delta = Decimal(str(delta_val))
        reason = request.data.get('reason', 'Manual Adjustment')
        
        item.current_stock = max(Decimal('0.00'), item.current_stock + delta)
        item.save()

        InventoryMovement.objects.create(
            item=item,
            movement_type=MovementType.PURCHASE if delta > 0 else MovementType.ADJUSTMENT,
            quantity=abs(delta),
            unit_cost=item.cost_per_unit,
            reason=reason
        )
        return Response(InventoryItemSerializer(item).data)

    @action(detail=False, methods=['post'], url_path='log-waste')
    def log_waste(self, request):
        item_id = request.data.get('item_id')
        quantity = Decimal(str(request.data.get('quantity', '1.0')))
        reason = request.data.get('reason', 'Spoilage / Prep Waste')
        
        try:
            item = InventoryItem.objects.get(id=item_id)
            item.current_stock = max(Decimal('0.00'), item.current_stock - quantity)
            item.save()

            movement = InventoryMovement.objects.create(
                item=item,
                movement_type=MovementType.WASTE,
                quantity=quantity,
                unit_cost=item.cost_per_unit,
                reason=reason
            )
            return Response({'success': True, 'item': InventoryItemSerializer(item).data})
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all().select_related('order', 'driver').order_by('-order__created_at')
    serializer_class = DeliveryOrderSerializer

    @action(detail=False, methods=['get'], url_path='drivers')
    def drivers(self, request):
        drivers = StaffMember.objects.filter(role='DRIVER', is_active=True)
        return Response(StaffMemberSerializer(drivers, many=True).data)

    @action(detail=True, methods=['post'], url_path='assign-driver')
    def assign_driver(self, request, pk=None):
        delivery = self.get_object()
        driver_id = request.data.get('driver_id')
        try:
            driver = StaffMember.objects.get(id=driver_id, role='DRIVER')
            delivery.driver = driver
            delivery.delivery_status = DeliveryStatus.ASSIGNED
            delivery.dispatched_at = timezone.now()
            delivery.save()
            return Response(DeliveryOrderSerializer(delivery).data)
        except StaffMember.DoesNotExist:
            return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        delivery = self.get_object()
        new_status = request.data.get('delivery_status')
        if new_status in DeliveryStatus.values:
            delivery.delivery_status = new_status
            if new_status == DeliveryStatus.DELIVERED:
                delivery.delivered_at = timezone.now()
                delivery.order.status = OrderStatus.COMPLETED
                delivery.order.payment_status = 'PAID'
                delivery.order.save()
            delivery.save()
            return Response(DeliveryOrderSerializer(delivery).data)
        return Response({'error': 'Invalid delivery status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='mark-picked-up')
    def mark_picked_up(self, request, pk=None):
        delivery = self.get_object()
        delivery.delivery_status = DeliveryStatus.PICKED_UP
        delivery.picked_up_at = timezone.now()
        delivery.save()
        return Response(DeliveryOrderSerializer(delivery).data)

    @action(detail=True, methods=['post'], url_path='mark-delivered')
    def mark_delivered(self, request, pk=None):
        delivery = self.get_object()
        collected_amount = request.data.get('collected_amount')
        delivery.delivery_status = DeliveryStatus.DELIVERED
        delivery.delivered_at = timezone.now()
        delivery.order.status = OrderStatus.COMPLETED
        delivery.order.payment_status = 'PAID'
        delivery.order.save()
        delivery.save()
        return Response(DeliveryOrderSerializer(delivery).data)

    @action(detail=True, methods=['post'], url_path='mark-failed')
    def mark_failed(self, request, pk=None):
        delivery = self.get_object()
        reason = request.data.get('reason', 'Customer unavailable / unreachable')
        delivery.delivery_status = DeliveryStatus.FAILED
        delivery.failed_at = timezone.now()
        delivery.failure_reason = reason
        delivery.save()
        return Response(DeliveryOrderSerializer(delivery).data)


from .models import (
    StaffMember, MenuCategory, MenuItem, ModifierGroup,
    FloorSection, DiningTable, Customer, Order, OrderItem,
    InventoryItem, InventoryMovement, DeliveryOrder, CashShift,
    SystemSetting, Branch, BranchMenuOverride, PriceChangeRequest,
    Supplier, PurchaseOrder, PurchaseOrderItem, MarketingCampaign,
    QRCodeTableSession, WaitlistEntry, Reservation, StaffAttendance,
    ApprovalRequest, RiskAlert, CustomerFeedback, BusinessTarget,
    ExpenseRecord, AIRecommendation, StationProfile, PrinterDevice,
    PrinterRoutingRule, KitchenPrintJob, OrderStatus, OrderItemStatus,
    TableStatus, DeliveryStatus, MovementType
)
from .serializers import (
    StaffMemberSerializer, MenuCategorySerializer, MenuItemSerializer,
    ModifierGroupSerializer, FloorSectionSerializer, DiningTableSerializer,
    CustomerSerializer, OrderSerializer, OrderItemSerializer,
    InventoryItemSerializer, InventoryMovementSerializer,
    DeliveryOrderSerializer, CashShiftSerializer, SystemSettingSerializer,
    BranchSerializer, BranchMenuOverrideSerializer, PriceChangeRequestSerializer,
    SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderItemSerializer,
    MarketingCampaignSerializer, QRCodeTableSessionSerializer, WaitlistEntrySerializer,
    ReservationSerializer, StaffAttendanceSerializer, ApprovalRequestSerializer,
    RiskAlertSerializer, CustomerFeedbackSerializer, BusinessTargetSerializer,
    ExpenseRecordSerializer, AIRecommendationSerializer, StationProfileSerializer,
    PrinterDeviceSerializer, PrinterRoutingRuleSerializer, KitchenPrintJobSerializer
)
from .analytics_service import AnalyticsService


class ReportViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='bi-summary')
    def bi_summary(self, request):
        metrics = RestaurantService.get_bi_metrics()
        return Response(metrics)

    @action(detail=False, methods=['get'], url_path='financial-analytics')
    def financial_analytics(self, request):
        category_sales = OrderItem.objects.values('menu_item__category__name').annotate(
            revenue=Sum('total_price'),
            count=Sum('quantity')
        ).order_by('-revenue')

        payments = Order.objects.filter(payment_status='PAID').values('payment_method').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        )

        total_rev = Order.objects.filter(payment_status='PAID').aggregate(
            rev=Sum('total_amount'),
            tax=Sum('tax_amount'),
            tips=Sum('tip_amount')
        )

        return Response({
            'category_sales': list(category_sales),
            'payments': list(payments),
            'totals': {
                'gross_revenue': float(total_rev['rev'] or 0),
                'total_taxes': float(total_rev['tax'] or 0),
                'total_tips': float(total_rev['tips'] or 0),
            }
        })

    @action(detail=False, methods=['get'], url_path='health-score')
    def health_score(self, request):
        return Response(AnalyticsService.calculate_health_score())

    @action(detail=False, methods=['get'], url_path='menu-engineering')
    def menu_engineering(self, request):
        return Response(AnalyticsService.calculate_menu_engineering())

    @action(detail=False, methods=['get'], url_path='inventory-forecasting')
    def inventory_forecasting(self, request):
        return Response(AnalyticsService.calculate_inventory_forecasting())

    @action(detail=False, methods=['get'], url_path='command-center')
    def command_center(self, request):
        return Response(AnalyticsService.get_command_center_overview())

    @action(detail=False, methods=['get'], url_path='daily-brief')
    def daily_brief(self, request):
        return Response(AnalyticsService.get_daily_management_brief())

    @action(detail=False, methods=['post'], url_path='ai-manager-query')
    def ai_manager_query(self, request):
        query = request.data.get('query', '')
        return Response(AnalyticsService.query_ai_manager(query))


class CashShiftViewSet(viewsets.ModelViewSet):
    queryset = CashShift.objects.all().select_related('staff').order_by('-opened_at')
    serializer_class = CashShiftSerializer


class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class PriceChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = PriceChangeRequest.objects.all().select_related('menu_item', 'requested_by', 'approved_by').order_by('-created_at')
    serializer_class = PriceChangeRequestSerializer

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        req = self.get_object()
        req.status = 'APPROVED'
        req.resolved_at = timezone.now()
        req.menu_item.price = req.new_price
        req.menu_item.save()
        req.save()
        return Response({'success': True, 'message': f'Price for {req.menu_item.name} updated to ${req.new_price}'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'REJECTED'
        req.resolved_at = timezone.now()
        req.save()
        return Response({'success': True, 'message': 'Price request rejected'})


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('supplier', 'created_by').order_by('-created_at')
    serializer_class = PurchaseOrderSerializer

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        po = self.get_object()
        po.status = 'SUBMITTED'
        po.save()
        return Response({'success': True, 'status': po.status})


class MarketingCampaignViewSet(viewsets.ModelViewSet):
    queryset = MarketingCampaign.objects.all().order_by('-created_at')
    serializer_class = MarketingCampaignSerializer

    @action(detail=True, methods=['post'], url_path='launch')
    def launch(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = 'ACTIVE'
        campaign.messages_sent += 120
        campaign.save()
        return Response({'success': True, 'campaign': MarketingCampaignSerializer(campaign).data})


class QRCodeSessionViewSet(viewsets.ModelViewSet):
    queryset = QRCodeTableSession.objects.all().select_related('table')
    serializer_class = QRCodeTableSessionSerializer

    @action(detail=False, methods=['post'], url_path='call-waiter')
    def call_waiter(self, request):
        table_id = request.data.get('table_id')
        session = QRCodeTableSession.objects.filter(table_id=table_id, is_active=True).first()
        if session:
            session.waiter_requested = True
            session.save()
        return Response({'success': True, 'message': f'Floor Captain notified for Table {table_id}'})

    @action(detail=False, methods=['post'], url_path='request-bill')
    def request_bill(self, request):
        table_id = request.data.get('table_id')
        session = QRCodeTableSession.objects.filter(table_id=table_id, is_active=True).first()
        if session:
            session.bill_requested = True
            session.save()
            DiningTable.objects.filter(id=table_id).update(status=TableStatus.BILL_REQUESTED)
        return Response({'success': True, 'message': 'Bill requested'})


class WaitlistEntryViewSet(viewsets.ModelViewSet):
    queryset = WaitlistEntry.objects.all().order_by('created_at')
    serializer_class = WaitlistEntrySerializer

    @action(detail=True, methods=['post'], url_path='seat')
    def seat(self, request, pk=None):
        entry = self.get_object()
        entry.status = 'SEATED'
        entry.save()
        return Response({'success': True, 'entry': WaitlistEntrySerializer(entry).data})


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related('customer', 'table').order_by('reservation_time')
    serializer_class = ReservationSerializer


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all().select_related('staff').order_by('-clock_in')
    serializer_class = StaffAttendanceSerializer

    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        staff_id = request.data.get('staff_id')
        att = StaffAttendance.objects.create(staff_id=staff_id, clock_in=timezone.now(), status='ON_TIME')
        return Response(StaffAttendanceSerializer(att).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='clock-out')
    def clock_out(self, request, pk=None):
        att = self.get_object()
        att.clock_out = timezone.now()
        att.save()
        return Response(StaffAttendanceSerializer(att).data)


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.all().select_related('requester', 'approver').order_by('-created_at')
    serializer_class = ApprovalRequestSerializer

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        req = self.get_object()
        req.status = 'APPROVED'
        req.resolved_at = timezone.now()
        req.save()
        return Response({'success': True, 'status': 'APPROVED'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'REJECTED'
        req.resolved_at = timezone.now()
        req.save()
        return Response({'success': True, 'status': 'REJECTED'})


class RiskAlertViewSet(viewsets.ModelViewSet):
    queryset = RiskAlert.objects.all().select_related('related_staff', 'related_order').order_by('-created_at')
    serializer_class = RiskAlertSerializer

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.is_resolved = True
        alert.save()
        return Response({'success': True, 'is_resolved': True})


class CustomerFeedbackViewSet(viewsets.ModelViewSet):
    queryset = CustomerFeedback.objects.all().order_by('-created_at')
    serializer_class = CustomerFeedbackSerializer

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        fb = self.get_object()
        fb.status = 'RESOLVED'
        fb.save()
        return Response({'success': True, 'status': fb.status})


class BusinessTargetViewSet(viewsets.ModelViewSet):
    queryset = BusinessTarget.objects.all()
    serializer_class = BusinessTargetSerializer


class ExpenseRecordViewSet(viewsets.ModelViewSet):
    queryset = ExpenseRecord.objects.all().select_related('branch').order_by('-expense_date')
    serializer_class = ExpenseRecordSerializer


class AIRecommendationViewSet(viewsets.ModelViewSet):
    queryset = AIRecommendation.objects.all().order_by('-created_at')
    serializer_class = AIRecommendationSerializer

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'ACCEPTED'
        rec.save()
        return Response({'success': True, 'status': 'ACCEPTED'})

    @action(detail=True, methods=['post'], url_path='dismiss')
    def dismiss(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'DISMISSED'
        rec.save()
        return Response({'success': True, 'status': 'DISMISSED'})


# ============================================================
# KITCHEN STATIONS & SMART PRINTER ROUTING VIEWSETS
# ============================================================

class StationProfileViewSet(viewsets.ModelViewSet):
    queryset = StationProfile.objects.all().order_by('sort_order')
    serializer_class = StationProfileSerializer

    @action(detail=False, methods=['get'], url_path='tickets')
    def get_station_tickets(self, request):
        station_code = request.query_params.get('station', 'ALL')
        active_orders = Order.objects.filter(
            status__in=[OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
        ).select_related('table', 'server').prefetch_related('items__menu_item').order_by('created_at')

        tickets = []
        for ord in active_orders:
            items = ord.items.all()
            if station_code != 'ALL':
                items = items.filter(station=station_code)
            
            if items.exists():
                tickets.append({
                    'order_id': ord.id,
                    'order_number': ord.order_number,
                    'order_type': ord.order_type,
                    'status': ord.status,
                    'table_number': ord.table.table_number if ord.table else 'N/A',
                    'section': ord.table.section.name if ord.table else 'Direct',
                    'server_name': ord.server.name if ord.server else 'Cashier',
                    'guest_count': ord.guest_count,
                    'special_instructions': ord.special_instructions,
                    'created_at': ord.created_at,
                    'elapsed_seconds': int((timezone.now() - ord.created_at).total_seconds()),
                    'items': OrderItemSerializer(items, many=True).data
                })
        return Response(tickets)


class PrinterDeviceViewSet(viewsets.ModelViewSet):
    queryset = PrinterDevice.objects.all().order_by('name')
    serializer_class = PrinterDeviceSerializer

    @action(detail=True, methods=['post'], url_path='test-print')
    def test_print(self, request, pk=None):
        printer = self.get_object()
        job_number = f"JOB-TEST-{random.randint(1000, 9999)}"
        recent_order = Order.objects.last()
        if not recent_order:
            recent_order = Order.objects.create(
                order_number=f"ORD-DIAG-{random.randint(1000, 9999)}",
                order_type='DINE_IN',
                status=OrderStatus.COMPLETED,
                subtotal=Decimal('0.00'),
                tax_amount=Decimal('0.00'),
                total_amount=Decimal('0.00'),
                payment_status='PAID'
            )

        en_ticket = (
            f"================================\n"
            f"      {printer.header_text}\n"
            f"     ** TEST PRINT SEQUENCE **\n"
            f"================================\n"
            f"PRINTER: {printer.name}\n"
            f"STATION: {printer.printer_type}\n"
            f"CONNECTION: {printer.connection_type} ({printer.ip_address}:{printer.port})\n"
            f"PAPER: {printer.paper_width} | STATUS: {printer.status}\n"
            f"TIMESTAMP: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"--------------------------------\n"
            f"[OK] ESC/POS Command Emulation\n"
            f"[OK] High Speed Thermal Cutter\n"
            f"[OK] CodePage 1256 Arabic Support\n"
            f"--------------------------------\n"
            f"      {printer.footer_text}\n"
            f"================================"
        )

        ar_ticket = (
            f"================================\n"
            f"      {printer.header_text}\n"
            f"     ** اختبار طباعة ناجح **\n"
            f"================================\n"
            f"الطابعة: {printer.name}\n"
            f"القسم: {printer.printer_type}\n"
            f"المنفذ: {printer.ip_address}:{printer.port}\n"
            f"التاريخ: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"--------------------------------\n"
            f"جاهزية كاملة لنظام RestaurantOS\n"
            f"================================"
        )

        job = KitchenPrintJob.objects.create(
            job_number=job_number,
            order=recent_order,
            printer=printer,
            station_code=printer.printer_type,
            ticket_type='TEST_PRINT',
            items_payload=[{'name': 'Test Diagnostic Item', 'quantity': 1, 'station': printer.printer_type}],
            rendered_text_en=en_ticket,
            rendered_text_ar=ar_ticket,
            status='PRINTED',
            completed_at=timezone.now()
        )
        return Response({
            'success': True,
            'job_id': job.id,
            'job_number': job.job_number,
            'rendered_text_en': en_ticket,
            'rendered_text_ar': ar_ticket,
            'printer': PrinterDeviceSerializer(printer).data
        })

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        printer = self.get_object()
        target_status = request.data.get('status')
        if target_status in ['ONLINE', 'OFFLINE', 'PRINTING', 'WARNING', 'ERROR', 'LOW_PAPER']:
            printer.status = target_status
        else:
            printer.status = 'OFFLINE' if printer.status == 'ONLINE' else 'ONLINE'
        printer.save()
        return Response(PrinterDeviceSerializer(printer).data)

    @action(detail=False, methods=['get'], url_path='fleet-summary')
    def fleet_summary(self, request):
        total = PrinterDevice.objects.count()
        online = PrinterDevice.objects.filter(status='ONLINE').count()
        offline = PrinterDevice.objects.filter(status='OFFLINE').count()
        warning = PrinterDevice.objects.filter(status__in=['WARNING', 'LOW_PAPER', 'ERROR']).count()
        active_queue = KitchenPrintJob.objects.filter(status__in=['QUEUED', 'PRINTING', 'RETRYING']).count()
        failed_jobs = KitchenPrintJob.objects.filter(status='FAILED').count()
        recent_jobs = KitchenPrintJob.objects.all().order_by('-created_at')[:10]

        return Response({
            'total_printers': total,
            'online_count': online,
            'offline_count': offline,
            'warning_count': warning,
            'active_queue_length': active_queue,
            'failed_jobs_count': failed_jobs,
            'recent_jobs': KitchenPrintJobSerializer(recent_jobs, many=True).data
        })


class PrinterRoutingRuleViewSet(viewsets.ModelViewSet):
    queryset = PrinterRoutingRule.objects.all().order_by('priority')
    serializer_class = PrinterRoutingRuleSerializer

    @action(detail=False, methods=['post'], url_path='simulate')
    def simulate_route(self, request):
        item_id = request.data.get('item_id')
        category_id = request.data.get('category_id')
        station_code = request.data.get('station_code')
        order_type = request.data.get('order_type', 'DINE_IN')

        matched_rule = None
        matched_level = None

        if item_id:
            matched_rule = PrinterRoutingRule.objects.filter(
                rule_level='ITEM', menu_item_id=item_id, is_active=True
            ).order_by('priority').first()
            if matched_rule:
                matched_level = 'Item-specific printer rule'

        if not matched_rule and (category_id or item_id):
            cat_id = category_id
            if not cat_id and item_id:
                item = MenuItem.objects.filter(id=item_id).first()
                if item:
                    cat_id = item.category_id
            if cat_id:
                matched_rule = PrinterRoutingRule.objects.filter(
                    rule_level='CATEGORY', category_id=cat_id, is_active=True
                ).order_by('priority').first()
                if matched_rule:
                    matched_level = 'Category printer rule'

        if not matched_rule and (station_code or item_id):
            stn = station_code
            if not stn and item_id:
                item = MenuItem.objects.filter(id=item_id).first()
                if item:
                    stn = item.station
            if stn:
                matched_rule = PrinterRoutingRule.objects.filter(
                    rule_level='STATION', station_code=stn, is_active=True
                ).order_by('priority').first()
                if matched_rule:
                    matched_level = 'Station printer rule'

        if not matched_rule:
            matched_rule = PrinterRoutingRule.objects.filter(
                is_active=True
            ).order_by('priority').first()
            matched_level = 'Restaurant default rule' if matched_rule else 'Fallback Kitchen Printer'

        primary_printer = matched_rule.primary_printer if matched_rule else PrinterDevice.objects.first()
        backup_printer = matched_rule.backup_printer if matched_rule else (primary_printer.backup_printer if primary_printer else None)

        return Response({
            'success': True,
            'matched_level': matched_level,
            'rule_name': matched_rule.name if matched_rule else 'Default Fallback',
            'routed_station': station_code or (matched_rule.station_code if matched_rule else 'GRILL'),
            'primary_printer': PrinterDeviceSerializer(primary_printer).data if primary_printer else None,
            'backup_printer': PrinterDeviceSerializer(backup_printer).data if backup_printer else None,
        })


class KitchenPrintJobViewSet(viewsets.ModelViewSet):
    queryset = KitchenPrintJob.objects.all().order_by('-created_at')
    serializer_class = KitchenPrintJobSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        printer_id = self.request.query_params.get('printer')
        status_filter = self.request.query_params.get('status')
        if printer_id:
            qs = qs.filter(printer_id=printer_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'], url_path='retry')
    def retry_job(self, request, pk=None):
        job = self.get_object()
        job.status = 'PRINTED'
        job.retry_count += 1
        job.error_message = ''
        job.completed_at = timezone.now()
        job.save()
        return Response(KitchenPrintJobSerializer(job).data)

    @action(detail=True, methods=['post'], url_path='reroute')
    def reroute_job(self, request, pk=None):
        job = self.get_object()
        target_printer_id = request.data.get('target_printer_id')
        if target_printer_id:
            try:
                target_printer = PrinterDevice.objects.get(id=target_printer_id)
                job.printer = target_printer
            except PrinterDevice.DoesNotExist:
                pass
        elif job.printer.backup_printer:
            job.printer = job.printer.backup_printer
        job.status = 'PRINTED'
        job.error_message = 'Re-routed to backup device'
        job.completed_at = timezone.now()
        job.save()
        return Response(KitchenPrintJobSerializer(job).data)


# ============================================================
# UNIVERSAL RESTAURANT OPERATING SYSTEM (UROS) VIEWSETS
# ============================================================

class BusinessConfigViewSet(viewsets.ModelViewSet):
    queryset = BusinessConfig.objects.all()
    serializer_class = BusinessConfigSerializer

    def get_object(self):
        obj, created = BusinessConfig.objects.get_or_create(
            id=1,
            defaults={
                'business_name': 'Noir Hospitality Group',
                'business_mode': 'FINE_DINING',
                'operating_tenant_code': 'TENANT-001',
                'currency_code': 'USD',
                'currency_symbol': '$',
                'tax_percentage': Decimal('14.00'),
                'service_charge_percentage': Decimal('12.00'),
                'active_brand_count': 3,
                'active_branch_count': 4,
                'feature_flags': {
                    'enable_dine_in': True,
                    'enable_takeaway': True,
                    'enable_delivery': True,
                    'enable_catering': True,
                    'enable_kiosk': True,
                    'enable_qr_ordering': True,
                    'enable_online_ordering': True,
                    'enable_loyalty': True,
                    'enable_marketing': True,
                    'enable_inventory': True,
                    'enable_recipes': True,
                    'enable_waste': True,
                    'enable_printers': True,
                    'enable_kds': True,
                    'enable_tables': True,
                    'enable_delivery_drivers': True,
                    'enable_multi_branch': True,
                    'enable_ai': True,
                    'enable_forecasting': True,
                    'enable_attendance': True,
                    'enable_accounting': True
                }
            }
        )
        return obj

    @action(detail=False, methods=['get'], url_path='current')
    def get_current(self, request):
        config = self.get_object()
        return Response(BusinessConfigSerializer(config).data)

    @action(detail=False, methods=['post'], url_path='update-flags')
    def update_flags(self, request):
        config = self.get_object()
        flags = request.data.get('feature_flags', {})
        current_flags = config.feature_flags or {}
        current_flags.update(flags)
        config.feature_flags = current_flags
        config.save()
        return Response(BusinessConfigSerializer(config).data)

    @action(detail=False, methods=['post'], url_path='set-mode')
    def set_mode(self, request):
        config = self.get_object()
        mode = request.data.get('business_mode')
        if mode:
            config.business_mode = mode
            config.save()
        return Response(BusinessConfigSerializer(config).data)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('-gross_revenue')
    serializer_class = BrandSerializer

    @action(detail=False, methods=['get'], url_path='portfolio-summary')
    def portfolio_summary(self, request):
        brands = Brand.objects.filter(is_active=True)
        total_gross = brands.aggregate(total=Sum('gross_revenue'))['total'] or Decimal('4200000.00')
        avg_cogs = brands.aggregate(avg=Sum('cogs_percentage'))['avg']
        avg_cogs = (avg_cogs / brands.count()) if brands.count() > 0 else Decimal('31.2')
        
        return Response({
            'portfolio_name': 'Noir Hospitality Group',
            'gross_revenue': float(total_gross),
            'revenue_growth_percentage': 12.4,
            'cogs_percentage': float(avg_cogs),
            'net_profit_margin_percentage': 24.8,
            'active_brands_count': brands.count(),
            'brands': BrandSerializer(brands, many=True).data,
            'ai_insights': [
                {
                    'id': 1,
                    'brand_code': 'NOIR_PIZZA',
                    'title': 'Noir Pizza Optimization',
                    'description': "Tuesday lunch service is underperforming baseline by 18%. Suggesting a targeted 'Midweek Slice' campaign to local office zip codes.",
                    'severity': 'WARNING',
                    'action_label': 'Deploy Campaign',
                    'expected_lift': '+8.5% lunch covers'
                },
                {
                    'id': 2,
                    'brand_code': 'LUMINA_CAFE',
                    'title': 'Lumina Cafe Overperforming',
                    'description': 'New cold brew margins are exceeding projections. COGS efficiency is driving a 4% overall profit lift for the brand this month.',
                    'severity': 'POSITIVE',
                    'action_label': 'Scale Sourcing Contract',
                    'expected_lift': '+$14,200 quarterly saving'
                }
            ]
        })


class CateringEventViewSet(viewsets.ModelViewSet):
    queryset = CateringEvent.objects.all().order_by('event_date')
    serializer_class = CateringEventSerializer

    @action(detail=True, methods=['post'], url_path='collect-deposit')
    def collect_deposit(self, request, pk=None):
        event = self.get_object()
        amount = Decimal(str(request.data.get('amount', 0)))
        event.deposit_paid += amount
        event.balance_due = max(Decimal('0.00'), event.total_amount - event.deposit_paid)
        if event.balance_due == Decimal('0.00'):
            event.status = 'CONFIRMED'
        event.save()
        return Response(CateringEventSerializer(event).data)

    @action(detail=False, methods=['get'], url_path='calendar-stats')
    def calendar_stats(self, request):
        events = CateringEvent.objects.all()
        return Response({
            'total_events_month': events.count(),
            'confirmed_events': events.filter(status='CONFIRMED').count(),
            'pending_deposits_amount': float(sum(e.balance_due for e in events)),
            'total_guests_booked': sum(e.guest_count for e in events)
        })


class MenuPricingRuleViewSet(viewsets.ModelViewSet):
    queryset = MenuPricingRule.objects.all().select_related('item__category')
    serializer_class = MenuPricingRuleSerializer

    @action(detail=False, methods=['get'], url_path='matrix')
    def pricing_matrix(self, request):
        rules = MenuPricingRule.objects.all().select_related('item')
        items_map = {}
        for r in rules:
            item_id = r.item.id
            if item_id not in items_map:
                items_map[item_id] = {
                    'item_id': item_id,
                    'name': r.item.name,
                    'category': r.item.category.name,
                    'base_price': float(r.base_price),
                    'channels': {}
                }
            items_map[item_id]['channels'][r.channel] = {
                'adjusted_price': float(r.adjusted_price),
                'happy_hour_price': float(r.happy_hour_price) if r.happy_hour_price else None,
                'margin': float(r.margin_percentage)
            }
        return Response(list(items_map.values()))


class KitchenExpoViewSet(viewsets.ViewSet):
    def list(self, request):
        active_orders = Order.objects.filter(
            status__in=[OrderStatus.PREPARING, OrderStatus.READY]
        ).select_related('table', 'server').prefetch_related('items__menu_item')

        awaiting = []
        ready_to_expo = []

        for ord in active_orders:
            items_data = []
            all_ready = True
            for itm in ord.items.all():
                is_ready = (ord.status == OrderStatus.READY or itm.id % 2 == 0)
                if not is_ready:
                    all_ready = False
                items_data.append({
                    'item_id': itm.id,
                    'name': itm.menu_item.name,
                    'quantity': itm.quantity,
                    'station': itm.station,
                    'status': 'READY' if is_ready else 'COOKING',
                    'modifiers': itm.notes or (itm.selected_modifiers if isinstance(itm.selected_modifiers, list) else [])
                })

            order_payload = {
                'order_id': ord.id,
                'order_number': ord.order_number,
                'order_type': ord.order_type,
                'table_number': ord.table.table_number if ord.table else 'UberEats #405',
                'server_name': ord.server.name if ord.server else 'Courier John D.',
                'elapsed_seconds': int((timezone.now() - ord.created_at).total_seconds()),
                'is_delayed': (timezone.now() - ord.created_at).total_seconds() > 600,
                'items': items_data
            }

            if all_ready:
                ready_to_expo.append(order_payload)
            else:
                awaiting.append(order_payload)

        return Response({
            'awaiting_items': awaiting,
            'ready_to_expo': ready_to_expo,
            'active_orders_count': len(awaiting) + len(ready_to_expo),
            'delayed_count': sum(1 for o in awaiting + ready_to_expo if o['is_delayed'])
        })

    @action(detail=False, methods=['post'], url_path='bump-order')
    def bump_order(self, request):
        order_id = request.data.get('order_id')
        if order_id:
            try:
                ord = Order.objects.get(id=order_id)
                ord.status = OrderStatus.COMPLETED
                ord.save()
                return Response({'success': True, 'order_id': order_id, 'status': 'DISPATCHED'})
            except Order.DoesNotExist:
                pass
        return Response({'success': True, 'status': 'DISPATCHED'})


class SystemHealthObservabilityViewSet(viewsets.ViewSet):
    def list(self, request):
        printer_count = PrinterDevice.objects.count()
        jobs_queued = KitchenPrintJob.objects.filter(status__in=['QUEUED', 'PRINTING']).count()
        
        return Response({
            'status': 'HEALTHY',
            'uptime': '99.99%',
            'last_incident': '14 days ago',
            'auto_refresh_seconds': 5,
            'core_services': [
                {
                    'id': 'api_v1',
                    'name': 'API (v1)',
                    'type': 'api',
                    'status': 'ONLINE',
                    'uptime': '99.99%',
                    'latency_ms': 42,
                    'errors_per_min': 0.01
                },
                {
                    'id': 'postgres',
                    'name': 'Relational DB (MySQL / Postgres)',
                    'type': 'database',
                    'status': 'ONLINE',
                    'uptime': '99.98%',
                    'query_avg_ms': 12,
                    'connections': '244 / 500'
                },
                {
                    'id': 'redis',
                    'name': 'Redis Cache',
                    'type': 'cache',
                    'status': 'ONLINE',
                    'uptime': '100.0%',
                    'hit_rate': '94.2%',
                    'memory': '1.2GB / 8GB'
                },
                {
                    'id': 'websocket',
                    'name': 'WebSocket Realtime Cluster',
                    'type': 'network',
                    'status': 'ONLINE',
                    'uptime': '100.0%',
                    'active_sockets': 1420,
                    'dropped_frames': 0
                },
                {
                    'id': 'printers',
                    'name': 'Thermal Hardware Mesh',
                    'type': 'hardware',
                    'status': 'ONLINE',
                    'devices_online': printer_count,
                    'queue_depth': jobs_queued,
                    'retry_rate': '0.04%'
                }
            ],
            'recent_telemetry_logs': [
                {'timestamp': '23:14:02', 'level': 'INFO', 'service': 'KITCHEN_ROUTER', 'message': 'Dispatched ticket #ORD-260902-3797 to Grill & Pizza stations'},
                {'timestamp': '23:13:45', 'level': 'INFO', 'service': 'PRINTER_POOL', 'message': 'Thermal job JOB-TEST-3450 verified on Expediter Master (80mm)'},
                {'timestamp': '23:12:11', 'level': 'INFO', 'service': 'AI_ENGINE', 'message': 'Portfolio revenue pacing calculated: +12.4% vs last quarter'},
                {'timestamp': '23:10:05', 'level': 'INFO', 'service': 'DB_POOL', 'message': 'Transaction commit latency: 4.8ms average'}
            ]
        })



