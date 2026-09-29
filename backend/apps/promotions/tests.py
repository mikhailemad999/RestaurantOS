from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.promotions.models import Promotion


class PromotionsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='testpromo@restaurantos.com',
            password='testpassword123',
            full_name='Test Promo Admin',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        self.promo = Promotion.objects.create(
            name='Test 20 Percent',
            code='SAVE20',
            discount_type=Promotion.DiscountType.PERCENTAGE,
            discount_value=Decimal('20.00'),
            min_order_amount=Decimal('50.00'),
            is_active=True
        )

    def test_validate_valid_coupon(self):
        res = self.client.post('/api/promotions/coupons/validate/', {
            'code': 'SAVE20',
            'order_amount': '100.00'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['valid'])
        self.assertEqual(res.data['discount_amount'], '20.00')
        self.assertEqual(res.data['final_amount'], '80.00')

    def test_validate_below_minimum(self):
        res = self.client.post('/api/promotions/coupons/validate/', {
            'code': 'SAVE20',
            'order_amount': '30.00'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data['valid'])
