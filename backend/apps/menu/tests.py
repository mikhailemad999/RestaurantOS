import io
from decimal import Decimal
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User, Role
from apps.restaurant.models import Restaurant
from apps.menu.models import Category, MenuItem, ItemVariant


class MenuEngineTests(APITestCase):
    def setUp(self):
        self.owner_role = Role.objects.create(name='Owner', is_system=True)
        self.restaurant = Restaurant.objects.create(name='Test Cucina', currency='USD')
        self.owner = User.objects.create_user(
            email='owner@test.com',
            password='password123',
            full_name='Owner User',
            role=self.owner_role,
        )
        self.client.force_authenticate(user=self.owner)

        self.cat_pizzas = Category.objects.create(name='Pizzas', description='Wood fired')
        self.item_margherita = MenuItem.objects.create(
            category=self.cat_pizzas,
            name='Margherita D.O.P.',
            base_price=Decimal('14.50'),
            is_available=True,
        )
        ItemVariant.objects.create(item=self.item_margherita, name='Small 10"', price=Decimal('11.50'))
        ItemVariant.objects.create(item=self.item_margherita, name='Large 16"', price=Decimal('18.50'))

    def test_category_list(self):
        url = reverse('menu-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_menu_item_list_with_variants(self):
        url = reverse('menu-item-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data
        self.assertGreaterEqual(len(items), 1)
        first_item = items[0]
        self.assertEqual(len(first_item['variants']), 2)

    def test_toggle_item_availability(self):
        url = reverse('menu-item-toggle-availability', kwargs={'pk': self.item_margherita.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['data']['is_available'])

    def test_csv_import_file(self):
        csv_content = (
            "Category,Name,Description,BasePrice,Sizes,PrepTime,Dietary\n"
            "Pasta,Fettuccine Alfredo,Creamy parmesan sauce,16.50,Regular:16.50|Large:21.00,12,Vegetarian\n"
            "Beverages,Fresh Lemonade,Cold pressed mint lemonade,5.00,,3,Vegan\n"
        )
        csv_file = io.BytesIO(csv_content.encode('utf-8'))
        csv_file.name = 'menu_upload.csv'

        url = reverse('menu-item-import-file')
        response = self.client.post(url, {'file': csv_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['imported_count'], 2)

        # Verify items in database
        self.assertTrue(MenuItem.objects.filter(name='Fettuccine Alfredo').exists())
        self.assertTrue(MenuItem.objects.filter(name='Fresh Lemonade').exists())
