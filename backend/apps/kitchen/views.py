import uuid
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.kitchen.models import KitchenStation, KitchenTicket
from apps.kitchen.serializers import KitchenStationSerializer, KitchenTicketSerializer
from apps.orders.models import Order


class KitchenStationViewSet(viewsets.ModelViewSet):
    queryset = KitchenStation.objects.filter(is_deleted=False).order_by('display_order')
    serializer_class = KitchenStationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class KitchenTicketViewSet(viewsets.ModelViewSet):
    queryset = KitchenTicket.objects.filter(is_deleted=False).select_related('order', 'station', 'order__table').order_by('created_at')
    serializer_class = KitchenTicketSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        station_id = self.request.query_params.get('station_id')
        if station_id:
            qs = qs.filter(station_id=station_id)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        else:
            # Active tickets by default
            qs = qs.filter(status__in=[KitchenTicket.Status.PENDING, KitchenTicket.Status.IN_PREP, KitchenTicket.Status.READY])
        return qs

    @action(detail=True, methods=['post'], url_path='bump')
    def bump(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = KitchenTicket.Status.BUMPED
        ticket.bump_time = timezone.now()
        ticket.save()

        # Check if all tickets for this order are completed
        order = ticket.order
        all_bumped = not order.kitchen_tickets.filter(
            is_deleted=False
        ).exclude(status=KitchenTicket.Status.BUMPED).exists()

        if all_bumped:
            order.status = Order.Status.READY
            order.save()

        return Response({'success': True, 'ticket_id': ticket.id, 'status': ticket.status})

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_ticket_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        if new_status in KitchenTicket.Status.values:
            ticket.status = new_status
            if new_status == KitchenTicket.Status.BUMPED:
                ticket.bump_time = timezone.now()
            ticket.save()
            return Response({'success': True, 'ticket': KitchenTicketSerializer(ticket).data})
        return Response({'success': False, 'message': 'Invalid status'}, status=400)
