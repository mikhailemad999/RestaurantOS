import uuid
from decimal import Decimal
from django.db import models
from apps.core.models import BaseModel


class Customer(BaseModel):
    class Tier(models.TextChoices):
        BRONZE = 'BRONZE', 'Bronze Member'
        SILVER = 'SILVER', 'Silver VIP'
        GOLD = 'GOLD', 'Gold VIP'
        PLATINUM = 'PLATINUM', 'Platinum Elite'

    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=30, unique=True)
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.BRONZE)
    loyalty_points = models.PositiveIntegerField(default=100)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_visits = models.PositiveIntegerField(default=1)
    favorite_dish = models.CharField(max_length=100, blank=True, default='Margherita D.O.P.')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'restaurant_customers'
        ordering = ['-total_spent', 'name']

    def __str__(self):
        return f"{self.name} ({self.tier} - {self.loyalty_points} pts)"
