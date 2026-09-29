from decimal import Decimal
from rest_framework import serializers
from apps.payments.models import CashDrawerShift, Payment
from apps.orders.models import Order


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    table_number = serializers.CharField(source='order.table.table_number', read_only=True, allow_null=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'table_number', 'customer_name',
            'shift', 'payment_method', 'amount', 'tip_amount',
            'status', 'transaction_id', 'receipt_number', 'card_last_four',
            'processed_by', 'processed_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'receipt_number', 'created_at']


class CashDrawerShiftSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, allow_null=True)
    payments_count = serializers.IntegerField(source='payments.count', read_only=True)

    class Meta:
        model = CashDrawerShift
        fields = [
            'id', 'shift_number', 'user', 'user_name', 'branch', 'branch_name',
            'opening_float', 'closing_float', 'expected_cash', 'actual_cash',
            'cash_difference', 'total_card_sales', 'total_wallet_sales',
            'total_cash_sales', 'total_tips', 'status', 'opened_at', 'closed_at',
            'notes', 'payments_count', 'created_at'
        ]
        read_only_fields = ['id', 'shift_number', 'opened_at', 'created_at']


class ProcessPaymentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField(required=True)
    payment_method = serializers.ChoiceField(choices=Payment.Method.choices)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    tip_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), min_value=Decimal('0.00'))
    card_last_four = serializers.CharField(max_length=4, required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class OpenShiftSerializer(serializers.Serializer):
    opening_float = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('200.00'), min_value=Decimal('0.00'))
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    branch_id = serializers.UUIDField(required=False, allow_null=True)


class CloseShiftSerializer(serializers.Serializer):
    actual_cash = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    notes = serializers.CharField(required=False, allow_blank=True, default='')
