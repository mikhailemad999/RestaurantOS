import uuid
from decimal import Decimal
from django.db import models
from apps.core.models import BaseModel
from apps.restaurant.models import Branch
from apps.tables.models import Table
from apps.menu.models import MenuItem, ItemVariant
from apps.accounts.models import User


class Order(BaseModel):
    class OrderType(models.TextChoices):
        DINE_IN = 'DINE_IN', 'Dine-In'
        TAKEOUT = 'TAKEOUT', 'Takeout'
        DELIVERY = 'DELIVERY', 'Delivery'
        QR_ORDER = 'QR_ORDER', 'QR Code Table'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SENT_TO_KITCHEN = 'SENT_TO_KITCHEN', 'Sent to Kitchen'
        PREPARING = 'PREPARING', 'Preparing'
        READY = 'READY', 'Ready to Serve'
        SERVED = 'SERVED', 'Served'
        COMPLETED = 'COMPLETED', 'Completed & Paid'
        CANCELLED = 'CANCELLED', 'Cancelled'

    order_number = models.CharField(max_length=50, unique=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    server = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='served_orders')

    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.DINE_IN)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.SENT_TO_KITCHEN)

    customer_name = models.CharField(max_length=100, blank=True, default='')
    customer_phone = models.CharField(max_length=30, blank=True, default='')
    guest_count = models.PositiveIntegerField(default=1)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    kitchen_notes = models.TextField(blank=True, default='')
    payment_status = models.CharField(max_length=20, default='UNPAID') # UNPAID, PARTIAL, PAID
    elapsed_minutes = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'restaurant_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} (${self.total_amount})"


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='order_entries')
    variant = models.ForeignKey(ItemVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    special_instructions = models.TextField(blank=True, default='')
    is_completed_in_kitchen = models.BooleanField(default=False)

    class Meta:
        db_table = 'restaurant_order_items'

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} (${self.total_price})"
