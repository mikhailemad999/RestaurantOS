import uuid
from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.orders.models import Order, OrderItem
from apps.menu.models import MenuItem, ItemVariant


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, allow_null=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_name', 'variant', 'variant_name',
            'quantity', 'unit_price', 'total_price',
            'special_instructions', 'is_completed_in_kitchen'
        ]
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    table_number = serializers.CharField(source='table.table_number', read_only=True, allow_null=True)
    server_name = serializers.CharField(source='server.full_name', read_only=True, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'branch', 'table', 'table_number',
            'server', 'server_name', 'order_type', 'status',
            'customer_name', 'customer_phone', 'guest_count',
            'subtotal', 'tax_amount', 'discount_amount', 'service_charge', 'total_amount',
            'kitchen_notes', 'payment_status', 'elapsed_minutes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        if not validated_data.get('order_number'):
            validated_data['order_number'] = f"ORD-{timezone.now().strftime('%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(is_deleted=False).prefetch_related('items__menu_item', 'items__variant').select_related('table', 'server')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in Order.Status.values:
            order.status = new_status
            order.save()
            return Response({'success': True, 'data': OrderSerializer(order).data})
        return Response({'success': False, 'message': 'Invalid order status'}, status=400)

    @action(detail=True, methods=['post'], url_path='toggle-item')
    def toggle_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data.get('item_id')
        item = order.items.filter(id=item_id).first()
        if item:
            item.is_completed_in_kitchen = not item.is_completed_in_kitchen
            item.save()
            return Response({'success': True, 'is_completed': item.is_completed_in_kitchen})
        return Response({'success': False, 'message': 'Item not found'}, status=404)

    @action(detail=False, methods=['get'], url_path='kitchen-kds')
    def kitchen_kds(self, request):
        """
        Active orders for KDS bump screen (sent to kitchen, preparing, ready)
        """
        active_orders = self.get_queryset().filter(
            status__in=[Order.Status.SENT_TO_KITCHEN, Order.Status.PREPARING, Order.Status.READY]
        ).order_by('created_at')
        return Response(OrderSerializer(active_orders, many=True).data)
