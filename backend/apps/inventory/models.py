import uuid
from decimal import Decimal
from django.db import models
from apps.core.models import BaseModel
from apps.restaurant.models import Branch


class Supplier(BaseModel):
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    category = models.CharField(max_length=80, default='Produce & Meats')

    class Meta:
        db_table = 'inventory_suppliers'
        ordering = ['name']

    def __str__(self):
        return self.name


class InventoryItem(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='inventory', null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, blank=True, default='')
    category = models.CharField(max_length=80, default='General')
    unit = models.CharField(max_length=30, default='kg') # kg, lbs, liters, units, boxes
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    par_level = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('10.00')) # Minimum safe stock
    reorder_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('20.00'))
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    last_restocked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'inventory_items'
        ordering = ['name']

    @property
    def is_low_stock(self):
        return self.current_stock <= self.par_level

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"
