import uuid
from decimal import Decimal
from django.db import models
from apps.core.models import BaseModel
from apps.orders.models import Order


class Driver(BaseModel):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    vehicle_type = models.CharField(max_length=50, default='Motorcycle') # Scooter, Bike, Car, Van
    license_plate = models.CharField(max_length=30, blank=True, default='')
    is_active = models.BooleanField(default=True)
    current_status = models.CharField(max_length=30, default='AVAILABLE') # AVAILABLE, ON_TRIP, OFFLINE

    class Meta:
        db_table = 'delivery_drivers'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.vehicle_type})"


class DeliveryOrder(BaseModel):
    class Stage(models.TextChoices):
        RECEIVED = 'RECEIVED', 'Received'
        PREPARING = 'PREPARING', 'In Kitchen'
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', 'Ready for Driver'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Failed Delivery'

    class Channel(models.TextChoices):
        DIRECT = 'DIRECT', 'Direct Online'
        DOORDASH = 'DOORDASH', 'DoorDash'
        UBEREATS = 'UBEREATS', 'UberEats'
        DELIVEROO = 'DELIVEROO', 'Deliveroo'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_info')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_deliveries')
    channel = models.CharField(max_length=30, choices=Channel.choices, default=Channel.DIRECT)
    stage = models.CharField(max_length=30, choices=Stage.choices, default=Stage.RECEIVED)

    delivery_address = models.TextField()
    customer_notes = models.TextField(blank=True, default='')
    estimated_arrival_minutes = models.PositiveIntegerField(default=35)
    tracking_url = models.URLField(blank=True, default='')

    class Meta:
        db_table = 'delivery_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Delivery for {self.order.order_number} via {self.channel}"
