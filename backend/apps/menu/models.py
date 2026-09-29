import uuid
from decimal import Decimal
from django.db import models
from django.utils.text import slugify
from apps.core.models import BaseModel
from apps.restaurant.models import Restaurant


class Category(BaseModel):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, blank=True)
    description = models.TextField(blank=True, default='')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'menu_categories'
        ordering = ['sort_order', 'name']
        verbose_name = 'Menu Category'
        verbose_name_plural = 'Menu Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MenuItem(BaseModel):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='menu_items',
        null=True,
        blank=True,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='items',
    )
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, blank=True)
    description = models.TextField(blank=True, default='')
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    sku = models.CharField(max_length=50, blank=True, default='')
    is_available = models.BooleanField(default=True)
    prep_time_minutes = models.PositiveIntegerField(default=15)

    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)

    class Meta:
        db_table = 'menu_items'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['name']),
        ]
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (${self.base_price})"


class ItemVariant(BaseModel):
    item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    name = models.CharField(max_length=80)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sku = models.CharField(max_length=50, blank=True, default='')
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'menu_item_variants'
        ordering = ['price']
        verbose_name = 'Item Variant'
        verbose_name_plural = 'Item Variants'

    def __str__(self):
        return f"{self.item.name} - {self.name} (${self.price})"


class ModifierGroup(BaseModel):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='modifier_groups',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    min_selection = models.PositiveIntegerField(default=0)
    max_selection = models.PositiveIntegerField(default=1)
    is_required = models.BooleanField(default=False)

    class Meta:
        db_table = 'menu_modifier_groups'
        ordering = ['name']
        verbose_name = 'Modifier Group'
        verbose_name_plural = 'Modifier Groups'

    def __str__(self):
        return self.name


class ModifierOption(BaseModel):
    modifier_group = models.ForeignKey(
        ModifierGroup,
        on_delete=models.CASCADE,
        related_name='options',
    )
    name = models.CharField(max_length=100)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'menu_modifier_options'
        ordering = ['price', 'name']
        verbose_name = 'Modifier Option'
        verbose_name_plural = 'Modifier Options'

    def __str__(self):
        return f"{self.name} (+${self.price})"


class MenuItemModifier(BaseModel):
    item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='item_modifiers',
    )
    modifier_group = models.ForeignKey(
        ModifierGroup,
        on_delete=models.CASCADE,
        related_name='assigned_items',
    )

    class Meta:
        db_table = 'menu_item_modifier_junction'
        unique_together = ('item', 'modifier_group')

    def __str__(self):
        return f"{self.item.name} -> {self.modifier_group.name}"
