import uuid
from rest_framework import serializers
from apps.orders.models import Order, OrderItem


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
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order
