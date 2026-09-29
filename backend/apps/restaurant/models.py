"""
RestaurantOS — Restaurant Models
Restaurant profile, branches, and system settings.
"""
from django.db import models
from apps.core.models import BaseModel


class Restaurant(BaseModel):
    """
    Restaurant profile — one per system (or one per tenant in multi-tenant).
    """
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='restaurant/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    tax_number = models.CharField(max_length=50, blank=True, default='')
    currency = models.CharField(max_length=10, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    receipt_footer = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = 'Restaurant'
        verbose_name_plural = 'Restaurants'

    def __str__(self):
        return self.name


class Branch(BaseModel):
    """
    Restaurant branch/location.
    Each branch has its own staff, menu, tables, and inventory.
    """
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='branches',
    )
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'
        ordering = ['name']

    def __str__(self):
        return f'{self.restaurant.name} — {self.name}'


class SystemSetting(BaseModel):
    """
    Key-value settings scoped per branch.
    Categories: tax, receipt, ordering, business_hours, etc.
    """
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='settings',
        null=True,
        blank=True,
    )
    key = models.CharField(max_length=100, db_index=True)
    value = models.TextField(default='')
    category = models.CharField(max_length=50, default='general', db_index=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
        unique_together = ['branch', 'key']

    def __str__(self):
        return f'{self.key}: {self.value}'
