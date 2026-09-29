from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.notifications.models import Notification


class NotificationsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(name='Owner', is_system=True)
        self.user = User.objects.create_user(
            email='notifowner@restaurantos.com',
            password='testpassword123',
            full_name='Notification Test Owner',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

        self.notif = Notification.objects.create(
            recipient=self.user,
            title='Order Ready Test',
            message='Order is ready at expo station.',
            is_read=False
        )

    def test_unread_count(self):
        res = self.client.get('/api/notifications/alerts/unread-count/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['unread_count'], 1)

    def test_mark_read(self):
        res = self.client.post(f'/api/notifications/alerts/{self.notif.id}/mark-read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_read'])
