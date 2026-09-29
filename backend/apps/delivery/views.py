from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.delivery.models import Driver, DeliveryOrder
from apps.orders.serializers import OrderSerializer


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'


class DeliveryOrderSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.name', read_only=True, allow_null=True)
    driver_phone = serializers.CharField(source='driver.phone', read_only=True, allow_null=True)
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = '__all__'


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.filter(is_deleted=False)
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.filter(is_deleted=False).select_related('driver', 'order')
    serializer_class = DeliveryOrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @action(detail=True, methods=['post'], url_path='assign-driver')
    def assign_driver(self, request, pk=None):
        delivery = self.get_object()
        driver_id = request.data.get('driver_id')
        driver = Driver.objects.filter(id=driver_id).first()
        if driver:
            delivery.driver = driver
            delivery.stage = DeliveryOrder.Stage.OUT_FOR_DELIVERY
            delivery.save()
            return Response({'success': True, 'data': DeliveryOrderSerializer(delivery).data})
        return Response({'success': False, 'message': 'Driver not found'}, status=404)

    @action(detail=True, methods=['post'], url_path='update-stage')
    def update_stage(self, request, pk=None):
        delivery = self.get_object()
        stage = request.data.get('stage')
        if stage in DeliveryOrder.Stage.values:
            delivery.stage = stage
            delivery.save()
            return Response({'success': True, 'data': DeliveryOrderSerializer(delivery).data})
        return Response({'success': False, 'message': 'Invalid stage'}, status=400)
