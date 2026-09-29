from django.db import models
from apps.core.models import BaseModel
from apps.accounts.models import User


class Notification(BaseModel):
    class NotificationType(models.TextChoices):
        ORDER_CREATED = 'ORDER_CREATED', 'New Order Placed'
        ORDER_READY = 'ORDER_READY', 'Kitchen Order Ready'
        PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', 'Payment Settled'
        SHIFT_ALERT = 'SHIFT_ALERT', 'Shift & Drawer Alert'
        LOW_STOCK = 'LOW_STOCK', 'Low Stock Warning'
        SYSTEM_NOTICE = 'SYSTEM_NOTICE', 'System Notice'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.SYSTEM_NOTICE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link_url = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'restaurant_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
