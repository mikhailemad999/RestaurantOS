from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(is_deleted=False).filter(
            models_q_filter(user)
        ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        user = request.user
        count = Notification.objects.filter(
            is_deleted=False,
            is_read=False
        ).filter(models_q_filter(user)).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'success': True, 'id': notification.id, 'is_read': True})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        user = request.user
        Notification.objects.filter(
            is_deleted=False,
            is_read=False
        ).filter(models_q_filter(user)).update(is_read=True)
        return Response({'success': True, 'message': 'All notifications marked as read'})


def models_q_filter(user):
    from django.db.models import Q
    if user and user.is_authenticated:
        return Q(recipient=user) | Q(recipient__isnull=True)
    return Q(recipient__isnull=True)
