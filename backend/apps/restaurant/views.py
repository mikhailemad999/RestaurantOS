"""
RestaurantOS — Restaurant Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsManagerOrOwner
from .models import Restaurant, Branch, SystemSetting
from .serializers import (
    RestaurantSerializer,
    BranchSerializer,
    SystemSettingSerializer,
    SystemSettingBulkUpdateSerializer,
)


class RestaurantViewSet(viewsets.ModelViewSet):
    """Restaurant profile management."""
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsManagerOrOwner]

    def get_queryset(self):
        return Restaurant.objects.filter(is_deleted=False)

    def list(self, request, *args, **kwargs):
        """Return the first (and usually only) restaurant."""
        restaurant = self.get_queryset().first()
        if restaurant:
            serializer = self.get_serializer(restaurant)
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': True, 'data': None})


class BranchViewSet(viewsets.ModelViewSet):
    """Branch management."""
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated, IsManagerOrOwner]
    search_fields = ['name', 'address']

    def get_queryset(self):
        return Branch.objects.filter(is_deleted=False).select_related('restaurant')


class SystemSettingViewSet(viewsets.ModelViewSet):
    """System settings management."""
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated, IsManagerOrOwner]
    filterset_fields = ['branch', 'category']

    def get_queryset(self):
        return SystemSetting.objects.filter(is_deleted=False)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple settings at once."""
        serializer = SystemSettingBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = []
        for item in serializer.validated_data['settings']:
            setting, _ = SystemSetting.objects.update_or_create(
                branch_id=item.get('branch'),
                key=item['key'],
                defaults={
                    'value': item['value'],
                    'category': item.get('category', 'general'),
                },
            )
            updated.append(SystemSettingSerializer(setting).data)

        return Response({
            'success': True,
            'message': f'{len(updated)} settings updated',
            'data': updated,
        })
