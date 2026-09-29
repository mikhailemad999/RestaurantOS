import uuid
from django.db import models
from apps.core.models import BaseModel
from apps.restaurant.models import Branch
from apps.orders.models import Order


class KitchenStation(BaseModel):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='kitchen_stations', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_color = models.CharField(max_length=20, default='#4F46E5')
    display_order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'restaurant_kitchen_stations'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class KitchenTicket(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PREP = 'IN_PREP', 'In Preparation'
        READY = 'READY', 'Ready for Pickup / Expo'
        BUMPED = 'BUMPED', 'Bumped & Cleared'

    ticket_number = models.CharField(max_length=50, unique=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='kitchen_tickets')
    station = models.ForeignKey(KitchenStation, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    bump_time = models.DateTimeField(null=True, blank=True)
    elapsed_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'restaurant_kitchen_tickets'
        ordering = ['created_at']

    def __str__(self):
        return f"Ticket #{self.ticket_number} (Order {self.order.order_number}) - {self.status}"
