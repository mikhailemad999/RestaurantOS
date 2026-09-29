from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.customers.models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_deleted=False)
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @action(detail=True, methods=['post'], url_path='add-points')
    def add_points(self, request, pk=None):
        customer = self.get_object()
        points = int(request.data.get('points', 0))
        customer.loyalty_points += points
        customer.save()
        return Response({'success': True, 'loyalty_points': customer.loyalty_points})
