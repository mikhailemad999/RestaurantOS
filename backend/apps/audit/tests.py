from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.audit.models import AuditLog


class AuditModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='testaudit@restaurantos.com',
            password='testpassword123',
            full_name='Test Audit User',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        AuditLog.objects.create(
            user=self.user,
            action=AuditLog.ActionType.LOGIN,
            module='ACCOUNTS',
            description='Test user login recorded'
        )

    def test_list_audit_logs(self):
        res = self.client.get('/api/audit-logs/logs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['action'], 'LOGIN')

    def test_audit_stats(self):
        res = self.client.get('/api/audit-logs/logs/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_logs'], 1)
        self.assertIn('LOGIN', res.data['actions'])
