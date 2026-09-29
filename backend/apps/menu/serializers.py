from rest_framework import serializers
from apps.menu.models import (
    Category, MenuItem, ItemVariant,
    ModifierGroup, ModifierOption, MenuItemModifier
)


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'sort_order', 'is_active', 'items_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.filter(is_deleted=False).count()


class ItemVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemVariant
        fields = ['id', 'item', 'name', 'price', 'sku', 'is_default']
        read_only_fields = ['id']


class ModifierOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifierOption
        fields = ['id', 'modifier_group', 'name', 'price', 'is_available']
        read_only_fields = ['id']


class ModifierGroupSerializer(serializers.ModelSerializer):
    options = ModifierOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ModifierGroup
        fields = [
            'id', 'name', 'min_selection', 'max_selection',
            'is_required', 'options', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    variants = ItemVariantSerializer(many=True, required=False)
    modifier_groups = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'slug',
            'description', 'base_price', 'image', 'sku',
            'is_available', 'prep_time_minutes',
            'is_vegetarian', 'is_vegan', 'is_gluten_free', 'is_spicy',
            'variants', 'modifier_groups', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_modifier_groups(self, obj):
        groups = [junction.modifier_group for junction in obj.item_modifiers.all() if not junction.is_deleted]
        return ModifierGroupSerializer(groups, many=True).data

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        item = MenuItem.objects.create(**validated_data)

        for variant_data in variants_data:
            ItemVariant.objects.create(item=item, **variant_data)

        return item

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if variants_data is not None:
            # Recreate variants
            instance.variants.all().delete()
            for variant_data in variants_data:
                ItemVariant.objects.create(item=instance, **variant_data)

        return instance
