from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from api.models import (
    StaffMember, MenuCategory, MenuItem, ModifierGroup, ModifierItem,
    FloorSection, DiningTable, Customer, Order, OrderItem,
    InventoryItem, RecipeIngredient, DeliveryOrder, CashShift,
    KitchenStation, OrderStatus, TableStatus, DeliveryStatus, CustomerTier
)
from api.services import RestaurantService


class RestaurantOSTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Staff Members
        self.admin = StaffMember.objects.create(
            name="Admin Marcus",
            role="ADMIN",
            pin_code="1234",
            email="admin@restaurantos.io",
            hourly_rate=Decimal("25.00")
        )
        self.cashier = StaffMember.objects.create(
            name="Cashier David",
            role="CASHIER",
            pin_code="1111",
            hourly_rate=Decimal("15.00")
        )
        self.chef = StaffMember.objects.create(
            name="Chef Antoine",
            role="CHEF",
            pin_code="3333",
            hourly_rate=Decimal("22.00")
        )
        self.driver = StaffMember.objects.create(
            name="Courier Jack",
            role="DRIVER",
            pin_code="4444",
            hourly_rate=Decimal("16.00")
        )

        # 2. Categories & Items
        self.cat_steaks = MenuCategory.objects.create(name="Steaks", slug="steaks", sort_order=1)
        self.item_wagyu = MenuItem.objects.create(
            category=self.cat_steaks,
            name="A5 Wagyu Striploin",
            sku="STK-01",
            price=Decimal("98.00"),
            cost_price=Decimal("28.00"),
            station=KitchenStation.GRILL,
            is_available=True
        )

        # 3. Inventory & Recipe Ingredients
        self.ing_beef = InventoryItem.objects.create(
            name="A5 Wagyu Beef",
            sku="ING-01",
            unit="g",
            current_stock=Decimal("5000.00"),
            minimum_stock=Decimal("1000.00"),
            cost_per_unit=Decimal("0.12")
        )
        RecipeIngredient.objects.create(
            menu_item=self.item_wagyu,
            inventory_item=self.ing_beef,
            quantity_required=Decimal("250.00")
        )

        # 4. Floor & Tables
        self.section = FloorSection.objects.create(name="Main Dining", slug="main-dining")
        self.table_1 = DiningTable.objects.create(
            section=self.section,
            table_number="T1",
            capacity=4,
            status=TableStatus.AVAILABLE
        )

        # 5. Customer Profile
        self.customer = Customer.objects.create(
            name="Julian Sterling",
            phone="+1 555-900-1122",
            email="julian@example.com",
            vip_tier=CustomerTier.GOLD,
            loyalty_points=120,
            total_spent=Decimal("450.00")
        )

    # TEST 1: PIN AUTHENTICATION
    def test_pin_authentication_success(self):
        response = self.client.post('/api/staff/pin-login/', {'pin_code': '1234'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['staff']['role'], 'ADMIN')

    def test_pin_authentication_invalid(self):
        response = self.client.post('/api/staff/pin-login/', {'pin_code': '9999'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    # TEST 2: MENU & 86 AVAILABILITY TOGGLE
    def test_menu_toggle_availability(self):
        self.assertTrue(self.item_wagyu.is_available)
        response = self.client.post(f'/api/menu/{self.item_wagyu.id}/toggle-availability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_available'])

        # Toggle back
        response = self.client.post(f'/api/menu/{self.item_wagyu.id}/toggle-availability/')
        self.assertTrue(response.data['is_available'])

    # TEST 3: FLOOR & TABLE MANAGEMENT
    def test_create_and_manage_table(self):
        # Create Table
        response = self.client.post('/api/tables/', {
            'section': self.section.id,
            'table_number': 'VIP-05',
            'capacity': 8,
            'shape': 'ROUND',
            'status': TableStatus.AVAILABLE
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_id = response.data['id']

        # Update Table Status to OCCUPIED
        response = self.client.post(f'/api/tables/{new_id}/update-status/', {'status': 'OCCUPIED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'OCCUPIED')

        # Clear Table
        response = self.client.post(f'/api/tables/{new_id}/clear/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'AVAILABLE')
        self.assertEqual(response.data['guest_count'], 0)

    # TEST 4: POS ORDER CREATION & RECIPE INVENTORY AUTO-DEDUCTION
    def test_pos_order_lifecycle(self):
        initial_stock = self.ing_beef.current_stock
        payload = {
            'order_type': 'DINE_IN',
            'table_id': self.table_1.id,
            'customer_id': self.customer.id,
            'guest_count': 2,
            'payment_method': 'CARD',
            'payment_status': 'PAID',
            'items': [
                {
                    'menu_item_id': self.item_wagyu.id,
                    'quantity': 2,
                    'selected_modifiers': []
                }
            ]
        }
        response = self.client.post('/api/orders/create-pos-order/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_id = response.data['id']

        # Verify Table becomes OCCUPIED
        self.table_1.refresh_from_db()
        self.assertEqual(self.table_1.status, TableStatus.OCCUPIED)

        # Verify Inventory Auto-Deduction (2 orders * 250g = 500g deducted)
        self.ing_beef.refresh_from_db()
        expected_stock = initial_stock - Decimal('500.00')
        self.assertEqual(self.ing_beef.current_stock, expected_stock)

        # Verify Customer Loyalty Points Accrual ($196 + tax -> points added)
        self.customer.refresh_from_db()
        self.assertGreater(self.customer.loyalty_points, 120)

    # TEST 5: KDS BUMPING AND TICKET LIFECYCLE
    def test_kds_ticket_bump(self):
        # Create an active order
        order = Order.objects.create(
            order_number="ORD-TEST-01",
            order_type="DINE_IN",
            table=self.table_1,
            status=OrderStatus.PREPARING
        )
        item = OrderItem.objects.create(
            order=order,
            menu_item=self.item_wagyu,
            quantity=1,
            unit_price=Decimal("98.00"),
            total_price=Decimal("98.00"),
            station=KitchenStation.GRILL,
            status="PENDING"
        )

        # Check KDS list
        response = self.client.get('/api/kds/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Bump Item Status
        response = self.client.post('/api/kds/bump-item/', {'item_id': item.id, 'status': 'READY'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.status, 'READY')

        # Bump Full Ticket
        response = self.client.post('/api/kds/bump-ticket/', {'order_id': order.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, OrderStatus.READY)

    # TEST 6: INVENTORY ADJUSTMENT AND WASTE LOGGING
    def test_inventory_adjust_and_waste(self):
        # Stock Adjustment
        response = self.client.post(f'/api/inventory/{self.ing_beef.id}/adjust-stock/', {
            'adjustment': 500.0,
            'reason': 'Supplier Shipment Received'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ing_beef.refresh_from_db()
        self.assertEqual(self.ing_beef.current_stock, Decimal('5500.00'))

        # Waste Logging
        response = self.client.post('/api/inventory/log-waste/', {
            'item_id': self.ing_beef.id,
            'quantity': 200.0,
            'reason': 'Expired / Prep Trim Waste'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ing_beef.refresh_from_db()
        self.assertEqual(self.ing_beef.current_stock, Decimal('5300.00'))

    # TEST 7: DELIVERY DISPATCHING
    def test_delivery_dispatch_workflow(self):
        order = Order.objects.create(
            order_number="ORD-DEL-01",
            order_type="DELIVERY",
            status=OrderStatus.PREPARING
        )
        delivery = DeliveryOrder.objects.create(
            order=order,
            delivery_address="742 Evergreen Terrace",
            customer_name="Homer Simpson",
            customer_phone="+1 555-4321",
            delivery_status=DeliveryStatus.UNASSIGNED
        )

        # Assign Driver
        response = self.client.post(f'/api/delivery/{delivery.id}/assign-driver/', {
            'driver_id': self.driver.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        delivery.refresh_from_db()
        self.assertEqual(delivery.driver.id, self.driver.id)
        self.assertEqual(delivery.delivery_status, DeliveryStatus.ASSIGNED)

    # TEST 8: BI & FINANCIAL REPORTS
    def test_reports_endpoints(self):
        bi_resp = self.client.get('/api/reports/bi-summary/')
        self.assertEqual(bi_resp.status_code, status.HTTP_200_OK)
        self.assertIn('today_revenue', bi_resp.data)
        self.assertIn('occupancy_rate', bi_resp.data)

        fin_resp = self.client.get('/api/reports/financial-analytics/')
        self.assertEqual(fin_resp.status_code, status.HTTP_200_OK)
        self.assertIn('category_sales', fin_resp.data)
        self.assertIn('totals', fin_resp.data)
