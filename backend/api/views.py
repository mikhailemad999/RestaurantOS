from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, F, Q
from decimal import Decimal

from .models import (
    StaffMember, MenuCategory, MenuItem, ModifierGroup,
    FloorSection, DiningTable, Customer, CustomerAddress, CustomerNote, DeliveryZone,
    Order, OrderItem, InventoryItem, InventoryMovement, DeliveryOrder, CashShift,
    SystemSetting, OrderStatus, OrderItemStatus, TableStatus,
    DeliveryStatus, MovementType
)
from .serializers import (
    StaffMemberSerializer, MenuCategorySerializer, MenuItemSerializer,
    ModifierGroupSerializer, FloorSectionSerializer, DiningTableSerializer,
    CustomerSerializer, CustomerAddressSerializer, CustomerNoteSerializer,
    DeliveryZoneSerializer, OrderSerializer, OrderItemSerializer,
    InventoryItemSerializer, InventoryMovementSerializer,
    DeliveryOrderSerializer, CashShiftSerializer, SystemSettingSerializer
)
from .services import RestaurantService
from .phone_service import PhoneService
from .repeat_order_service import RepeatOrderService


class StaffMemberViewSet(viewsets.ModelViewSet):
    queryset = StaffMember.objects.filter(is_active=True)
    serializer_class = StaffMemberSerializer

    @action(detail=False, methods=['post'], url_path='pin-login')
    def pin_login(self, request):
        pin = request.data.get('pin_code')
        if not pin:
            return Response({'error': 'PIN code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        staff = RestaurantService.authenticate_by_pin(pin)
        if staff:
            return Response({
                'success': True,
                'staff': StaffMemberSerializer(staff).data
            })
        return Response({'success': False, 'error': 'Invalid PIN code'}, status=status.HTTP_401_UNAUTHORIZED)

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

    @action(detail=True, methods=['post'], url_path='clear')
    def clear_table(self, request, pk=None):
        table = self.get_object()
        table.status = TableStatus.AVAILABLE
        table.current_order_id = None
        table.seated_at = None
        table.guest_count = 0
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
    ExpenseRecord, AIRecommendation, OrderStatus, OrderItemStatus,
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
    ExpenseRecordSerializer, AIRecommendationSerializer
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

