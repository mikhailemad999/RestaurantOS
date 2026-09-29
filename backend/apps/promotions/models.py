from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.restaurant.models import Branch


class Promotion(BaseModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'
        FIXED_AMOUNT = 'FIXED_AMOUNT', 'Fixed Dollar Amount'
        BOGO = 'BOGO', 'Buy One Get One (50% Off)'

    class OrderTypeTarget(models.TextChoices):
        ALL = 'ALL', 'All Order Types'
        DINE_IN = 'DINE_IN', 'Dine-In Only'
        TAKEOUT = 'TAKEOUT', 'Takeout Only'
        DELIVERY = 'DELIVERY', 'Delivery Only'

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, default='')
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text='Percentage e.g. 15.00 for 15% or cash amount e.g. 10.00')
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    
    usage_limit = models.PositiveIntegerField(default=100)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    applicable_order_types = models.CharField(max_length=20, choices=OrderTypeTarget.choices, default=OrderTypeTarget.ALL)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='promotions', null=True, blank=True)

    class Meta:
        db_table = 'restaurant_promotions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.discount_value}"

    def calculate_discount(self, order_amount: Decimal) -> Decimal:
        """Calculate discount amount based on order subtotal."""
        if order_amount < self.min_order_amount:
            return Decimal('0.00')

        if self.discount_type == self.DiscountType.PERCENTAGE:
            disc = (order_amount * self.discount_value) / Decimal('100.00')
        elif self.discount_type == self.DiscountType.FIXED_AMOUNT:
            disc = min(order_amount, self.discount_value)
        elif self.discount_type == self.DiscountType.BOGO:
            # 50% discount capped as BOGO representation
            disc = (order_amount * Decimal('0.50'))
        else:
            disc = Decimal('0.00')

        if self.max_discount_amount and disc > self.max_discount_amount:
            disc = self.max_discount_amount

        return round(disc, 2)
