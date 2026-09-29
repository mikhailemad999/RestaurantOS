from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.orders.models import Order
from apps.payments.models import CashDrawerShift, Payment


class PaymentsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='testowner@restaurantos.com',
            password='testpassword123',
            full_name='Test Owner',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        self.order = Order.objects.create(
            order_number='ORD-TEST-001',
            total_amount=Decimal('50.00'),
            subtotal=Decimal('45.00'),
            tax_amount=Decimal('5.00')
        )

    def test_open_and_close_shift(self):
        # Open shift
        open_res = self.client.post('/api/payments/shifts/open/', {
            'opening_float': '250.00',
            'notes': 'Test morning shift'
        })
        self.assertEqual(open_res.status_code, status.HTTP_201_CREATED)
        shift_id = open_res.data['data']['id']

        # Get current shift
        curr_res = self.client.get('/api/payments/shifts/current/')
        self.assertEqual(curr_res.status_code, status.HTTP_200_OK)
        self.assertTrue(curr_res.data['has_open_shift'])

        # Close shift
        close_res = self.client.post(f'/api/payments/shifts/{shift_id}/close/', {
            'actual_cash': '250.00',
            'notes': 'Closed perfectly'
        })
        self.assertEqual(close_res.status_code, status.HTTP_200_OK)
        self.assertEqual(close_res.data['data']['status'], 'CLOSED')

    def test_process_payment_and_receipt(self):
        pay_res = self.client.post('/api/payments/transactions/process/', {
            'order_id': str(self.order.id),
            'payment_method': 'CREDIT_CARD',
            'amount': '50.00',
            'tip_amount': '5.00',
            'card_last_four': '4242',
            'notes': 'Paid in full'
        })
        self.assertEqual(pay_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(pay_res.data['order_payment_status'], 'PAID')

        # Check receipt
        receipt_res = self.client.get(f'/api/payments/transactions/receipt/?order_id={self.order.id}')
        self.assertEqual(receipt_res.status_code, status.HTTP_200_OK)
        self.assertEqual(receipt_res.data['order_number'], 'ORD-TEST-001')
