from rest_framework import serializers
from apps.kitchen.models import KitchenStation, KitchenTicket
from apps.orders.serializers import OrderSerializer


class KitchenStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitchenStation
        fields = ['id', 'name', 'branch', 'is_active', 'display_color', 'display_order', 'created_at']


class KitchenTicketSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True, allow_null=True)
    table_number = serializers.CharField(source='order.table.table_number', read_only=True, allow_null=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = KitchenTicket
        fields = [
            'id', 'ticket_number', 'order', 'order_number', 'order_details',
            'table_number', 'station', 'station_name', 'status',
            'bump_time', 'elapsed_minutes', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
