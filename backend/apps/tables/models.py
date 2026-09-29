import uuid
from django.db import models
from apps.core.models import BaseModel
from apps.restaurant.models import Branch


class Floor(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='floors')
    name = models.CharField(max_length=100) # e.g. Main Dining, Patio, VIP Lounge, Bar
    level = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'restaurant_floors'
        ordering = ['level', 'name']

    def __str__(self):
        return f"{self.branch.name} - {self.name}"


class Table(BaseModel):
    class Status(models.TextChoices):
        VACANT = 'VACANT', 'Vacant'
        OCCUPIED = 'OCCUPIED', 'Occupied'
        BILLED = 'BILLED', 'Billed'
        RESERVED = 'RESERVED', 'Reserved'
        DIRTY = 'DIRTY', 'Needs Cleaning'

    class Shape(models.TextChoices):
        ROUND = 'ROUND', 'Round'
        SQUARE = 'SQUARE', 'Square'
        RECTANGLE = 'RECTANGLE', 'Rectangle'
        BOOTH = 'BOOTH', 'Booth'

    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=20)
    capacity = models.PositiveIntegerField(default=4)
    shape = models.CharField(max_length=20, choices=Shape.choices, default=Shape.SQUARE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VACANT)
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)
    assigned_server = models.CharField(max_length=100, blank=True, default='')
    current_guest_count = models.PositiveIntegerField(default=0)
    current_order_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    seated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'restaurant_tables'
        ordering = ['table_number']

    def __str__(self):
        return f"Table {self.table_number} ({self.status})"
