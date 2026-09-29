from decimal import Decimal
from rest_framework import serializers
from apps.promotions.models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True, allow_null=True)
    is_valid_now = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id', 'name', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'start_date', 'end_date',
            'usage_limit', 'times_used', 'is_active', 'applicable_order_types',
            'branch', 'branch_name', 'is_valid_now', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'times_used', 'created_at', 'updated_at']

    def get_is_valid_now(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if not obj.is_active:
            return False
        if obj.start_date and obj.start_date > now:
            return False
        if obj.end_date and obj.end_date < now:
            return False
        if obj.times_used >= obj.usage_limit:
            return False
        return True


class ValidatePromoSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    order_type = serializers.CharField(required=False, default='ALL')
