from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.orders.models import Order
from apps.kitchen.models import KitchenStation, KitchenTicket


class KitchenModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='kitchenowner@restaurantos.com',
            password='testpassword123',
            full_name='Kitchen Test Owner',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        self.order = Order.objects.create(
            order_number='ORD-KITCHEN-01',
            status=Order.Status.SENT_TO_KITCHEN
        )
        self.station = KitchenStation.objects.create(
            name='Grill Station',
            display_order=1
        )
        self.ticket = KitchenTicket.objects.create(
            ticket_number='TKT-001',
            order=self.order,
            station=self.station,
            status=KitchenTicket.Status.IN_PREP
        )

    def test_list_stations(self):
        res = self.client.get('/api/kitchen/stations/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_bump_ticket(self):
        res = self.client.post(f'/api/kitchen/tickets/{self.ticket.id}/bump/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'BUMPED')
