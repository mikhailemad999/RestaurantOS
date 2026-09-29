from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.tables.models import Floor, Table


class TableSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source='floor.name', read_only=True)

    class Meta:
        model = Table
        fields = [
            'id', 'floor', 'floor_name', 'table_number',
            'capacity', 'shape', 'status', 'position_x', 'position_y',
            'assigned_server', 'current_guest_count', 'current_order_total',
            'seated_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FloorSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = Floor
        fields = ['id', 'branch', 'name', 'level', 'is_active', 'tables']
        read_only_fields = ['id']


class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.filter(is_deleted=False).prefetch_related('tables')
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.filter(is_deleted=False).select_related('floor')
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        table = self.get_object()
        new_status = request.data.get('status')
        if new_status in Table.Status.values:
            table.status = new_status
            if new_status == Table.Status.VACANT:
                table.current_order_total = 0
                table.current_guest_count = 0
                table.assigned_server = ''
            table.save()
            return Response({'success': True, 'data': TableSerializer(table).data})
        return Response({'success': False, 'message': 'Invalid status'}, status=400)
