from django.db import models
from apps.core.models import BaseModel
from apps.accounts.models import User


class AuditLog(BaseModel):
    class ActionType(models.TextChoices):
        LOGIN = 'LOGIN', 'User Login'
        LOGOUT = 'LOGOUT', 'User Logout'
        ORDER_CREATE = 'ORDER_CREATE', 'Create Order'
        ORDER_STATUS = 'ORDER_STATUS', 'Update Order Status'
        ORDER_CANCEL = 'ORDER_CANCEL', 'Cancel Order'
        PAYMENT_PROCESSED = 'PAYMENT_PROCESSED', 'Process Payment'
        PAYMENT_REFUND = 'PAYMENT_REFUND', 'Refund Payment'
        SHIFT_OPEN = 'SHIFT_OPEN', 'Open Shift Drawer'
        SHIFT_CLOSE = 'SHIFT_CLOSE', 'Close Shift Drawer'
        PRICE_OVERRIDE = 'PRICE_OVERRIDE', 'Manager Price Override'
        DISCOUNT_APPLIED = 'DISCOUNT_APPLIED', 'Discount Applied'
        ROLE_MODIFIED = 'ROLE_MODIFIED', 'User Role Modified'
        SYSTEM_CONFIG = 'SYSTEM_CONFIG', 'System Setting Changed'

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=40, choices=ActionType.choices)
    module = models.CharField(max_length=50, default='SYSTEM')
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'restaurant_audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        user_label = self.user.full_name if self.user else 'System'
        return f"[{self.action}] by {user_label} - {self.description[:40]}"
