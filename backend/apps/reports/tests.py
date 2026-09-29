from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.orders.models import Order


class ReportsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='testreports@restaurantos.com',
            password='testpassword123',
            full_name='Test Reports Admin',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        Order.objects.create(
            order_number='ORD-REP-1',
            total_amount=Decimal('120.00'),
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            service_charge=Decimal('10.00'),
            status=Order.Status.COMPLETED
        )

    def test_sales_summary(self):
        res = self.client.get('/api/reports/analytics/sales-summary/?period=all')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_orders'], 1)
        self.assertEqual(res.data['total_revenue'], '120.00')

    def test_hourly_sales(self):
        res = self.client.get('/api/reports/analytics/hourly-sales/?period=all')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)
