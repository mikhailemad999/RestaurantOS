import uuid
from decimal import Decimal
from django.utils import timezone
from django.core.management.base import BaseCommand
from apps.restaurant.models import Restaurant, Branch
from apps.accounts.models import User
from apps.tables.models import Floor, Table
from apps.menu.models import MenuItem, ItemVariant
from apps.orders.models import Order, OrderItem
from apps.inventory.models import Supplier, InventoryItem
from apps.delivery.models import Driver, DeliveryOrder
from apps.customers.models import Customer


class Command(BaseCommand):
    help = 'Seeds all live data for the Elite Restaurant OS (Tables, Orders, KDS, Inventory, Delivery, Customers)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Elite Restaurant OS full operational data...')
        restaurant = Restaurant.objects.first()
        branch = Branch.objects.first()
        server = User.objects.filter(email='owner@restaurantos.com').first()

        # 1. Floors & Tables
        floor_main, _ = Floor.objects.get_or_create(branch=branch, name='Main Dining Hall', defaults={'level': 1})
        floor_patio, _ = Floor.objects.get_or_create(branch=branch, name='Outdoor Garden Patio', defaults={'level': 1})
        floor_vip, _ = Floor.objects.get_or_create(branch=branch, name='VIP Mezzanine Lounge', defaults={'level': 2})
        floor_bar, _ = Floor.objects.get_or_create(branch=branch, name='Cocktail Bar & High-Tops', defaults={'level': 1})

        tables_data = [
            (floor_main, 'T-01', 2, Table.Shape.SQUARE, Table.Status.OCCUPIED, 2, Decimal('68.50'), 'Alex V.'),
            (floor_main, 'T-02', 4, Table.Shape.RECTANGLE, Table.Status.OCCUPIED, 3, Decimal('142.90'), 'Elena R.'),
            (floor_main, 'T-03', 4, Table.Shape.RECTANGLE, Table.Status.VACANT, 0, Decimal('0.00'), ''),
            (floor_main, 'T-04', 6, Table.Shape.ROUND, Table.Status.BILLED, 5, Decimal('235.00'), 'Alex V.'),
            (floor_main, 'T-05', 4, Table.Shape.BOOTH, Table.Status.VACANT, 0, Decimal('0.00'), ''),
            (floor_main, 'T-06', 4, Table.Shape.BOOTH, Table.Status.RESERVED, 0, Decimal('0.00'), ''),
            (floor_patio, 'P-01', 2, Table.Shape.ROUND, Table.Status.OCCUPIED, 2, Decimal('54.00'), 'Sam M.'),
            (floor_patio, 'P-02', 4, Table.Shape.SQUARE, Table.Status.VACANT, 0, Decimal('0.00'), ''),
            (floor_patio, 'P-03', 4, Table.Shape.SQUARE, Table.Status.DIRTY, 0, Decimal('0.00'), ''),
            (floor_vip, 'VIP-1', 8, Table.Shape.BOOTH, Table.Status.OCCUPIED, 6, Decimal('420.00'), 'Marcus K.'),
            (floor_vip, 'VIP-2', 6, Table.Shape.ROUND, Table.Status.RESERVED, 0, Decimal('0.00'), ''),
            (floor_bar, 'B-01', 2, Table.Shape.ROUND, Table.Status.OCCUPIED, 2, Decimal('36.00'), 'Sam M.'),
            (floor_bar, 'B-02', 2, Table.Shape.ROUND, Table.Status.VACANT, 0, Decimal('0.00'), ''),
        ]

        created_tables = {}
        for floor, num, cap, shape, status, guests, total, sname in tables_data:
            tbl, _ = Table.objects.get_or_create(
                floor=floor,
                table_number=num,
                defaults={
                    'capacity': cap,
                    'shape': shape,
                    'status': status,
                    'current_guest_count': guests,
                    'current_order_total': total,
                    'assigned_server': sname,
                }
            )
            created_tables[num] = tbl

        # 2. Live Orders & KDS Tickets
        pizza_margherita = MenuItem.objects.filter(name__icontains='Margherita').first()
        pizza_diavola = MenuItem.objects.filter(name__icontains='Diavola').first()
        burger_truffle = MenuItem.objects.filter(name__icontains='Truffle Angus').first()
        pasta_tagliatelle = MenuItem.objects.filter(name__icontains='Tagliatelle').first()
        drink_spritz = MenuItem.objects.filter(name__icontains='Passionfruit').first()
        tiramisu = MenuItem.objects.filter(name__icontains='Tiramisu').first()

        kds_orders_data = [
            {
                'num': 'ORD-101',
                'table': created_tables.get('T-01'),
                'type': Order.OrderType.DINE_IN,
                'status': Order.Status.PREPARING,
                'elapsed': 8,
                'notes': 'Gluten-free crust for pizza, light ice on spritz',
                'items': [
                    (pizza_margherita, 1, Decimal('14.50'), 'Gluten-free crust'),
                    (drink_spritz, 2, Decimal('13.00'), 'Light ice')
                ]
            },
            {
                'num': 'ORD-102',
                'table': created_tables.get('T-02'),
                'type': Order.OrderType.DINE_IN,
                'status': Order.Status.SENT_TO_KITCHEN,
                'elapsed': 4,
                'notes': 'Burgers medium rare, truffle fries extra crispy',
                'items': [
                    (burger_truffle, 2, Decimal('33.00'), 'Medium rare'),
                    (pasta_tagliatelle, 1, Decimal('18.90'), 'Extra parmigiano')
                ]
            },
            {
                'num': 'ORD-103',
                'table': None,
                'type': Order.OrderType.DELIVERY,
                'status': Order.Status.PREPARING,
                'elapsed': 16,
                'notes': 'DoorDash courier waiting in lobby. Pack hot bags.',
                'items': [
                    (pizza_diavola, 2, Decimal('33.80'), 'Extra spicy hot honey'),
                    (tiramisu, 2, Decimal('17.00'), '')
                ]
            },
            {
                'num': 'ORD-104',
                'table': created_tables.get('VIP-1'),
                'type': Order.OrderType.DINE_IN,
                'status': Order.Status.READY,
                'elapsed': 22,
                'notes': 'VIP Table. Chef special presentation.',
                'items': [
                    (pasta_tagliatelle, 3, Decimal('56.70'), 'Shaved black truffle'),
                    (burger_truffle, 3, Decimal('49.50'), 'Triple patty')
                ]
            },
        ]

        for odata in kds_orders_data:
            order, _ = Order.objects.get_or_create(
                order_number=odata['num'],
                defaults={
                    'branch': branch,
                    'table': odata['table'],
                    'server': server,
                    'order_type': odata['type'],
                    'status': odata['status'],
                    'elapsed_minutes': odata['elapsed'],
                    'kitchen_notes': odata['notes'],
                    'subtotal': Decimal('60.00'),
                    'tax_amount': Decimal('5.10'),
                    'total_amount': Decimal('65.10'),
                }
            )
            for mitem, qty, price, instr in odata['items']:
                if mitem:
                    OrderItem.objects.get_or_create(
                        order=order,
                        menu_item=mitem,
                        defaults={
                            'quantity': qty,
                            'unit_price': price / qty,
                            'total_price': price,
                            'special_instructions': instr,
                        }
                    )

        # 3. Suppliers & Inventory Items
        sup_dairy, _ = Supplier.objects.get_or_create(name='Milano Artisan Dairy Co.', defaults={'contact_person': 'Gianni Rossi', 'phone': '+1 (555) 234-8900', 'category': 'Dairy & Cheese'})
        sup_meat, _ = Supplier.objects.get_or_create(name='Prime Angus Meats Ltd.', defaults={'contact_person': 'David Clark', 'phone': '+1 (555) 876-1200', 'category': 'Fresh Meats'})
        sup_produce, _ = Supplier.objects.get_or_create(name='Valley Organic Farms', defaults={'contact_person': 'Maria Santos', 'phone': '+1 (555) 432-6700', 'category': 'Organic Produce'})

        inventory_data = [
            (sup_dairy, 'Buffalo Mozzarella D.O.P.', 'kg', Decimal('4.50'), Decimal('12.00'), Decimal('20.00'), Decimal('14.50')),
            (sup_dairy, 'Parmigiano Reggiano 24-Mo', 'kg', Decimal('8.00'), Decimal('10.00'), Decimal('15.00'), Decimal('24.00')),
            (sup_meat, 'Prime Angus Beef Patties', 'boxes (50ct)', Decimal('3.00'), Decimal('6.00'), Decimal('10.00'), Decimal('85.00')),
            (sup_meat, 'Artisan Spicy Beef Pepperoni', 'kg', Decimal('14.00'), Decimal('10.00'), Decimal('20.00'), Decimal('18.00')),
            (sup_produce, 'San Marzano Tomato Cans', 'cases (12ct)', Decimal('18.00'), Decimal('15.00'), Decimal('25.00'), Decimal('32.00')),
            (sup_produce, 'Black Winter Truffle Oil', 'liters', Decimal('1.20'), Decimal('3.00'), Decimal('5.00'), Decimal('64.00')),
            (sup_produce, 'Italian Tipo 00 Pizza Flour', 'sacks (25kg)', Decimal('22.00'), Decimal('10.00'), Decimal('30.00'), Decimal('28.50')),
            (sup_dairy, 'Mascarpone Italian Cream', 'kg', Decimal('2.00'), Decimal('5.00'), Decimal('10.00'), Decimal('12.00')),
        ]

        for sup, iname, unit, stock, par, reorder, cost in inventory_data:
            InventoryItem.objects.get_or_create(
                name=iname,
                defaults={
                    'branch': branch,
                    'supplier': sup,
                    'unit': unit,
                    'current_stock': stock,
                    'par_level': par,
                    'reorder_quantity': reorder,
                    'cost_per_unit': cost,
                }
            )

        # 4. Drivers & Delivery Orders
        driver_1, _ = Driver.objects.get_or_create(name='Michael Chang', phone='+1 (555) 789-0123', defaults={'vehicle_type': 'Honda PCX Scooter', 'license_plate': '7XYZ89', 'current_status': 'ON_TRIP'})
        driver_2, _ = Driver.objects.get_or_create(name='Carlos Rodriguez', phone='+1 (555) 654-3210', defaults={'vehicle_type': 'Yamaha E-Bike', 'license_plate': 'EB-442', 'current_status': 'AVAILABLE'})
        driver_3, _ = Driver.objects.get_or_create(name='Sarah Jenkins', phone='+1 (555) 321-9876', defaults={'vehicle_type': 'Toyota Prius', 'license_plate': '6LMN22', 'current_status': 'AVAILABLE'})

        del_order = Order.objects.filter(order_number='ORD-103').first()
        if del_order:
            DeliveryOrder.objects.get_or_create(
                order=del_order,
                defaults={
                    'driver': driver_1,
                    'channel': DeliveryOrder.Channel.DOORDASH,
                    'stage': DeliveryOrder.Stage.PREPARING,
                    'delivery_address': '450 North Broad Ave, Apt 14B, Metro City',
                    'customer_notes': 'Ring buzzer 14B, leave on door table if contactless.',
                    'estimated_arrival_minutes': 25,
                }
            )

        # 5. Customers & Loyalty CRM
        customers_data = [
            ('Victoria Sterling', 'victoria.s@luxuryestates.com', '+1 (555) 901-2345', Customer.Tier.PLATINUM, 1420, Decimal('3850.00'), 28, 'Truffle Angus Smash Burger', 'Prefers Table T-04 or VIP booth. Loves extra truffle aioli.'),
            ('Arthur Pendelton', 'arthur.p@capitalventures.io', '+1 (555) 890-1234', Customer.Tier.GOLD, 840, Decimal('2180.00'), 16, 'Margherita D.O.P.', 'Wine connoisseur. Allergic to peanuts.'),
            ('Sophia Lorenza', 'sophia.l@designatelier.com', '+1 (555) 789-0123', Customer.Tier.GOLD, 720, Decimal('1920.00'), 14, 'Handmade Truffle Tagliatelle', 'Always orders sparkling water with lemon.'),
            ('Lucas Vance', 'lucas.v@techfoundry.net', '+1 (555) 678-9012', Customer.Tier.SILVER, 390, Decimal('940.00'), 8, 'Spicy Diavola Pepperoni', 'Loyal Friday dinner regular.'),
            ('Emma Watson', 'emma.w@globalmedia.org', '+1 (555) 567-8901', Customer.Tier.BRONZE, 150, Decimal('320.00'), 3, 'Passionfruit Mint Spritz', 'New customer, enrolled in loyalty program.'),
        ]

        for cname, cemail, cphone, ctier, cpts, cspent, cvisits, fav, cnotes in customers_data:
            Customer.objects.get_or_create(
                phone=cphone,
                defaults={
                    'name': cname,
                    'email': cemail,
                    'tier': ctier,
                    'loyalty_points': cpts,
                    'total_spent': cspent,
                    'total_visits': cvisits,
                    'favorite_dish': fav,
                    'notes': cnotes,
                }
            )

        self.stdout.write(self.style.SUCCESS('[OK] Elite Restaurant OS operational data seeded successfully!'))
