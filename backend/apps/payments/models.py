import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.restaurant.models import Branch
from apps.accounts.models import User
from apps.orders.models import Order


class CashDrawerShift(BaseModel):
    class ShiftStatus(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'

    shift_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shifts')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='shifts', null=True, blank=True)
    
    opening_float = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('200.00'))
    closing_float = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    expected_cash = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    actual_cash = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cash_difference = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    total_card_sales = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_wallet_sales = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_cash_sales = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_tips = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    status = models.CharField(max_length=20, choices=ShiftStatus.choices, default=ShiftStatus.OPEN)
    opened_at = models.DateTimeField(default=timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'restaurant_shifts'
        ordering = ['-opened_at']

    def __str__(self):
        return f"Shift #{self.shift_number} ({self.user.full_name or self.user.email}) - {self.status}"


class Payment(BaseModel):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        CREDIT_CARD = 'CREDIT_CARD', 'Credit Card'
        DEBIT_CARD = 'DEBIT_CARD', 'Debit Card'
        DIGITAL_WALLET = 'DIGITAL_WALLET', 'Digital Wallet'
        CUSTOMER_BALANCE = 'CUSTOMER_BALANCE', 'Customer Balance'

    class Status(models.TextChoices):
        COMPLETED = 'COMPLETED', 'Completed'
        REFUNDED = 'REFUNDED', 'Refunded'
        FAILED = 'FAILED', 'Failed'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    shift = models.ForeignKey(CashDrawerShift, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payment_method = models.CharField(max_length=30, choices=Method.choices, default=Method.CREDIT_CARD)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    transaction_id = models.CharField(max_length=64, unique=True)
    receipt_number = models.CharField(max_length=64, blank=True, default='')
    card_last_four = models.CharField(max_length=4, blank=True, default='')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'restaurant_payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.transaction_id} for Order #{self.order.order_number}: ${self.amount}"
