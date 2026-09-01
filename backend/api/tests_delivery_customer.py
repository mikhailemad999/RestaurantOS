from django.test import TestCase
from django.utils import timezone
from decimal import Decimal
from rest_framework.test import APIClient
from api.models import (
    Customer, CustomerAddress, CustomerNote, DeliveryZone,
    Order, OrderItem, MenuItem, MenuCategory, StaffMember,
    StaffRole, OrderType, OrderStatus, DeliveryOrder, DeliveryStatus
)
from api.phone_service import PhoneService
from api.repeat_order_service import RepeatOrderService

class DeliveryCustomerSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.staff = StaffMember.objects.create(
            name='Elena Manager', role=StaffRole.MANAGER, pin_code='1234'
        )

        self.category = MenuCategory.objects.create(name='Main Entrees')
        self.item1 = MenuItem.objects.create(
            category=self.category, name='Chicken Ranch Pizza', price=Decimal('22.00'), cost_price=Decimal('6.00'), is_available=True
        )
        self.item2 = MenuItem.objects.create(
            category=self.category, name='Crispy Fries', price=Decimal('8.00'), cost_price=Decimal('2.00'), is_available=True
        )

        self.zone = DeliveryZone.objects.create(
            name='New Cairo', city='Cairo', delivery_fee=Decimal('30.00'), estimated_minutes=35
        )

        self.customer = Customer.objects.create(
            name='Ahmed Mohamed',
            first_name='Ahmed',
            last_name='Mohamed',
            phone='01012345678',
            normalized_phone='+201012345678',
            email='ahmed@test.com'
        )

        self.address = CustomerAddress.objects.create(
            customer=self.customer,
            label='HOME',
            city='Cairo',
            area='New Cairo',
            street='Street 90',
            building='15',
            apartment='6',
            landmark='Near Pharmacy',
            is_default=True
        )

    def test_phone_normalization_egypt(self):
        norm1 = PhoneService.normalize_phone('01012345678')
        self.assertEqual(norm1, '+201012345678')

        norm2 = PhoneService.normalize_phone('+201012345678')
        self.assertEqual(norm2, '+201012345678')

        norm3 = PhoneService.normalize_phone('010-1234-5678')
        self.assertEqual(norm3, '+201012345678')

    def test_duplicate_detection(self):
        dup = PhoneService.check_duplicate_customer('01012345678')
        self.assertTrue(dup['is_duplicate'])
        self.assertEqual(dup['match_type'], 'EXACT_PHONE')

        no_dup = PhoneService.check_duplicate_customer('01099999999')
        self.assertFalse(no_dup['is_duplicate'])

    def test_customer_search_prioritized(self):
        res = self.client.get('/api/customers/search/?q=01012345678')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.data) > 0)
        self.assertEqual(res.data[0]['name'], 'Ahmed Mohamed')

        res_name = self.client.get('/api/customers/search/?q=Ahmed')
        self.assertEqual(res_name.status_code, 200)
        self.assertTrue(len(res_name.data) > 0)
        self.assertEqual(res_name.data[0]['phone'], '01012345678')

    def test_address_management_and_default(self):
        addr2 = CustomerAddress.objects.create(
            customer=self.customer,
            label='WORK',
            city='Cairo',
            area='Nasr City',
            street='Abbas El Akkad',
            is_default=False
        )

        res = self.client.post(f'/api/customer-addresses/{addr2.id}/set-default/')
        self.assertEqual(res.status_code, 200)
        self.address.refresh_from_db()
        addr2.refresh_from_db()
        self.assertFalse(self.address.is_default)
        self.assertTrue(addr2.is_default)

    def test_repeat_last_order_service(self):
        order = Order.objects.create(
            order_number='DEL-9999',
            order_type=OrderType.DELIVERY,
            status=OrderStatus.COMPLETED,
            customer=self.customer,
            server=self.staff,
            subtotal=Decimal('30.00'),
            total_amount=Decimal('60.00'),
            payment_status='PAID'
        )
        OrderItem.objects.create(order=order, menu_item=self.item1, quantity=1, unit_price=Decimal('22.00'), total_price=Decimal('22.00'))
        OrderItem.objects.create(order=order, menu_item=self.item2, quantity=1, unit_price=Decimal('8.00'), total_price=Decimal('8.00'))

        last_ord_data = RepeatOrderService.get_last_order(self.customer.id)
        self.assertIsNotNone(last_ord_data)
        self.assertEqual(last_ord_data['order_number'], 'DEL-9999')
        self.assertEqual(len(last_ord_data['items']), 2)
        self.assertEqual(last_ord_data['recalculated_subtotal'], 30.0)

    def test_favorite_items_calculation(self):
        order = Order.objects.create(
            order_number='DEL-9998',
            order_type=OrderType.DELIVERY,
            status=OrderStatus.COMPLETED,
            customer=self.customer,
            server=self.staff,
            total_amount=Decimal('44.00')
        )
        OrderItem.objects.create(order=order, menu_item=self.item1, quantity=2, unit_price=Decimal('22.00'), total_price=Decimal('44.00'))

        favs = RepeatOrderService.get_favorite_items(self.customer.id)
        self.assertTrue(len(favs) > 0)
        self.assertEqual(favs[0]['name'], 'Chicken Ranch Pizza')
