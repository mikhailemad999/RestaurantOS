"""
RestaurantOS — Restaurant Serializers
"""
from rest_framework import serializers
from .models import Restaurant, Branch, SystemSetting


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'logo', 'phone', 'email', 'address',
            'tax_number', 'currency', 'timezone', 'language',
            'receipt_footer', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BranchSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = Branch
        fields = [
            'id', 'restaurant', 'restaurant_name', 'name', 'address',
            'phone', 'email', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'branch', 'key', 'value', 'category', 'description']
        read_only_fields = ['id']


class SystemSettingBulkUpdateSerializer(serializers.Serializer):
    """Bulk update multiple settings at once."""
    settings = serializers.ListField(
        child=serializers.DictField(),
    )
