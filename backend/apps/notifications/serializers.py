from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'notification_type', 'title',
            'message', 'is_read', 'link_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
