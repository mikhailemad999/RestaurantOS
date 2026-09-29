from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User, Role, Permission
from apps.restaurant.models import Restaurant, Branch


class AuthAndRBACTests(APITestCase):
    def setUp(self):
        # Create permissions
        self.perm_users_view = Permission.objects.create(
            codename='users.view', name='View Users', module='users'
        )
        self.perm_orders_view = Permission.objects.create(
            codename='orders.view', name='View Orders', module='orders'
        )

        # Create roles
        self.owner_role = Role.objects.create(name='Owner', is_system=True)
        self.cashier_role = Role.objects.create(name='Cashier', is_system=True)
        self.cashier_role.permissions.add(self.perm_orders_view)

        # Create Restaurant and Branch
        self.restaurant = Restaurant.objects.create(name='Test Resto', currency='USD')
        self.branch = Branch.objects.create(restaurant=self.restaurant, name='Main')

        # Create users
        self.owner = User.objects.create_user(
            email='owner@test.com',
            password='password123',
            full_name='Owner User',
            role=self.owner_role,
            branch=self.branch,
        )
        self.cashier = User.objects.create_user(
            email='cashier@test.com',
            password='password123',
            full_name='Cashier User',
            role=self.cashier_role,
            pin_code='9999',
            branch=self.branch,
        )

    def test_email_login_success(self):
        url = reverse('auth-login')
        response = self.client.post(url, {
            'email': 'owner@test.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'owner@test.com')

    def test_email_login_failure(self):
        url = reverse('auth-login')
        response = self.client.post(url, {
            'email': 'owner@test.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pin_login_success(self):
        url = reverse('auth-pin-login')
        response = self.client.post(url, {'pin_code': '9999'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])

    def test_pin_login_failure(self):
        url = reverse('auth-pin-login')
        response = self.client.post(url, {'pin_code': '0000'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_endpoint(self):
        self.client.force_authenticate(user=self.cashier)
        url = reverse('auth-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], 'cashier@test.com')
        self.assertIn('orders.view', response.data['data']['permissions'])

    def test_health_check(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], 'healthy')
