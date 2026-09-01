import os
import django
from decimal import Decimal
from django.utils import timezone
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurantos_backend.settings')
django.setup()

from api.models import (
    StaffMember, StaffRole, MenuCategory, MenuItem, ModifierGroup,
    ModifierItem, MenuItemModifierGroup, FloorSection, DiningTable,
    Customer, CustomerTier, CustomerAddress, CustomerNote, DeliveryZone,
    Order, OrderItem, InventoryItem,
    InventoryMovement, RecipeIngredient, DeliveryOrder, CashShift,
    SystemSetting, KitchenStation, TableStatus, OrderType, OrderStatus,
    OrderItemStatus, PaymentMethod, PaymentStatus, DeliveryStatus, MovementType,
    Branch, BranchMenuOverride, PriceChangeRequest, Supplier, PurchaseOrder,
    PurchaseOrderItem, MarketingCampaign, QRCodeTableSession, WaitlistEntry,
    Reservation, StaffAttendance, ApprovalRequest, RiskAlert, CustomerFeedback,
    BusinessTarget, ExpenseRecord, AIRecommendation
)

def seed():
    print("[+] Seeding RestaurantOS database on MySQL...")

    # 1. Staff Members
    staff_data = [
        {'name': 'Marcus Vance', 'role': StaffRole.ADMIN, 'pin_code': '1234', 'email': 'marcus@restaurantos.io', 'phone': '+1 (555) 010-9921', 'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'},
        {'name': 'Elena Rostova', 'role': StaffRole.MANAGER, 'pin_code': '1234', 'email': 'elena@restaurantos.io', 'phone': '+1 (555) 012-3841', 'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'},
        {'name': 'David Chen', 'role': StaffRole.CASHIER, 'pin_code': '1111', 'email': 'david@restaurantos.io', 'phone': '+1 (555) 014-9982', 'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'},
        {'name': 'Sophie Laurent', 'role': StaffRole.WAITER, 'pin_code': '2222', 'email': 'sophie@restaurantos.io', 'phone': '+1 (555) 018-7712', 'avatar_url': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'},
        {'name': 'Chef Antoine Moreau', 'role': StaffRole.CHEF, 'pin_code': '3333', 'email': 'antoine@restaurantos.io', 'phone': '+1 (555) 019-3321', 'avatar_url': 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'},
        {'name': 'Jack Miller', 'role': StaffRole.DRIVER, 'pin_code': '4444', 'email': 'jack@restaurantos.io', 'phone': '+1 (555) 021-4490', 'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'},
    ]

    staff_objs = {}
    for item in staff_data:
        s, _ = StaffMember.objects.update_or_create(
            name=item['name'],
            defaults=item
        )
        staff_objs[item['role']] = s
    print(f"  * Seeded {len(staff_data)} staff members with PIN logins")

    # 2. System Settings
    settings_data = [
        ('restaurant_profile', {'name': "L'Étoile Culinary OS", 'tagline': 'Modern Haute Cuisine & Mixology', 'currency': '$', 'tax_rate': 0.0825, 'service_charge': 0.10, 'phone': '+1 (800) 555-FOOD', 'address': '742 Evergreen Terrace, Metropolis'}),
        ('kds_settings', {'ticket_alert_yellow': 10, 'ticket_alert_red': 18, 'auto_bump_beverages': False, 'sound_alerts': True}),
        ('pos_settings', {'require_pin_for_discount': True, 'enable_tipping': True, 'default_tax_inclusive': False, 'auto_print_kitchen': True})
    ]
    for key, val in settings_data:
        SystemSetting.objects.update_or_create(key=key, defaults={'value_json': val, 'description': key})
    print(f"  * Seeded System Settings")

    # 3. Inventory Items
    inv_data = [
        ('Wagyu A5 Striploin', 'INV-BEEF-01', 'Meats', 'KG', Decimal('14.50'), Decimal('5.00'), Decimal('68.00'), 'Tokyo Wagyu Direct'),
        ('Dry-Aged Ribeye', 'INV-BEEF-02', 'Meats', 'KG', Decimal('22.00'), Decimal('8.00'), Decimal('32.00'), 'Artisan Farms Butcher'),
        ('Norwegian Salmon', 'INV-FISH-01', 'Seafood', 'KG', Decimal('18.00'), Decimal('6.00'), Decimal('24.00'), 'Nordic Seafoods Co'),
        ('Black Winter Truffle', 'INV-TRUF-01', 'Gourmet Produce', 'G', Decimal('350.00'), Decimal('500.00'), Decimal('1.80'), 'Piedmont Imports'), # Low stock
        ('Organic Russet Potatoes', 'INV-VEG-01', 'Produce', 'KG', Decimal('85.00'), Decimal('20.00'), Decimal('1.20'), 'Green Valley Farms'),
        ('Madagascar Vanilla Beans', 'INV-SPICE-01', 'Baking', 'PCS', Decimal('45.00'), Decimal('15.00'), Decimal('3.50'), 'Spice Traders Ltd'),
        ('Brioche Buns', 'INV-BAKE-01', 'Bakery', 'PCS', Decimal('120.00'), Decimal('30.00'), Decimal('0.85'), 'Golden Crust Bakery'),
        ('Cabernet Sauvignon 2018', 'INV-WINE-01', 'Beverages', 'BOTTLE', Decimal('38.00'), Decimal('12.00'), Decimal('18.00'), 'Napa Cellars Distribution'),
        ('Aged Parmesan Reggiano', 'INV-DAIRY-01', 'Dairy', 'KG', Decimal('3.20'), Decimal('5.00'), Decimal('28.00'), 'Formaggi Italia'), # Low stock
        ('Duck Confit', 'INV-POULTRY-01', 'Meats', 'KG', Decimal('12.00'), Decimal('4.00'), Decimal('19.50'), 'French Specialty Meats'),
    ]

    inv_objs = {}
    for name, sku, cat, unit, cur, mini, cost, supp in inv_data:
        inv, _ = InventoryItem.objects.update_or_create(
            sku=sku,
            defaults={
                'name': name, 'category': cat, 'unit': unit,
                'current_stock': cur, 'minimum_stock': mini,
                'cost_per_unit': cost, 'supplier_name': supp
            }
        )
        inv_objs[sku] = inv
    print(f"  * Seeded {len(inv_data)} inventory ingredients & stock levels")

    # 4. Menu Categories
    cats_data = [
        ('Starters & Small Plates', 'starters', 'utensils', 1),
        ('Signature Steaks & Cuts', 'steaks', 'flame', 2),
        ('Artisan Mains & Pasta', 'mains', 'chef-hat', 3),
        ('Gourmet Sides', 'sides', 'bowl-food', 4),
        ('Handcrafted Mixology', 'beverages', 'wine', 5),
        ('Artisanal Desserts', 'desserts', 'cake', 6),
    ]

    cat_objs = {}
    for name, slug, icon, order in cats_data:
        c, _ = MenuCategory.objects.update_or_create(
            slug=slug,
            defaults={'name': name, 'icon': icon, 'sort_order': order}
        )
        cat_objs[slug] = c
    print(f"  * Seeded {len(cats_data)} menu categories")

    # 5. Modifier Groups
    mod_steak_temp, _ = ModifierGroup.objects.update_or_create(
        name='Steak Temperature',
        defaults={'min_selection': 1, 'max_selection': 1, 'is_required': True}
    )
    for name, extra, is_def in [('Rare', 0, False), ('Medium Rare (Chef Rec.)', 0, True), ('Medium', 0, False), ('Medium Well', 0, False), ('Well Done', 0, False)]:
        ModifierItem.objects.update_or_create(group=mod_steak_temp, name=name, defaults={'price_extra': extra, 'is_default': is_def})

    mod_sauces, _ = ModifierGroup.objects.update_or_create(
        name='Artisan Sauces',
        defaults={'min_selection': 0, 'max_selection': 2, 'is_required': False}
    )
    for name, extra, is_def in [('Truffle Bearnaise', 4.00, False), ('Cognac Peppercorn', 3.50, False), ('Chimichurri Verde', 3.00, False), ('Smoked Bone Marrow Butter', 5.00, False)]:
        ModifierItem.objects.update_or_create(group=mod_sauces, name=name, defaults={'price_extra': extra, 'is_default': is_def})

    mod_cocktail_prep, _ = ModifierGroup.objects.update_or_create(
        name='Spirit Modification',
        defaults={'min_selection': 0, 'max_selection': 1, 'is_required': False}
    )
    for name, extra, is_def in [('Double Shot (+45ml)', 8.00, False), ('Smoked Rosemary Infusion', 3.00, False), ('Hand-carved Ice Sphere', 2.00, True)]:
        ModifierItem.objects.update_or_create(group=mod_cocktail_prep, name=name, defaults={'price_extra': extra, 'is_default': is_def})

    print("  * Seeded Modifier Groups & Items")

    # 6. Menu Items
    menu_items_data = [
        # Steaks
        ('A5 Miyazaki Wagyu Striploin (8oz)', 'steaks', 'Ultra-marbled Grade A5 Wagyu with smoked Maldon salt and charred cipollini onions.', Decimal('98.00'), Decimal('34.00'), 'STK-01', 16, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', True, True, 780, 'Dairy'),
        ('45-Day Dry Aged Prime Bone-In Ribeye (16oz)', 'steaks', 'USDA Prime bone-in ribeye aged in Himalayan salt lockers. Intense umami crust.', Decimal('68.00'), Decimal('22.00'), 'STK-02', 18, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500', True, True, 920, ''),
        ('Charred Filet Mignon & Foie Gras (8oz)', 'steaks', 'Center cut tenderloin topped with seared Hudson Valley foie gras and port wine reduction.', Decimal('76.00'), Decimal('26.00'), 'STK-03', 14, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500', True, False, 810, 'Dairy'),
        
        # Starters
        ('Black Truffle Wagyu Carpaccio', 'starters', 'Paper-thin Wagyu, shaved black winter truffle, caper berries, 36-month aged Parmigiano.', Decimal('24.00'), Decimal('6.50'), 'APP-01', 8, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500', True, True, 340, 'Dairy'),
        ('Crispy Calamari Fritti & Yuzu Aioli', 'starters', 'Wild Monterey calamari, togarashi dust, blistered shishito peppers, citrus yuzu emulsion.', Decimal('18.50'), Decimal('4.20'), 'APP-02', 7, KitchenStation.FRYER, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500', True, False, 420, 'Shellfish, Egg'),
        ('Roasted Bone Marrow & Sourdough Toast', 'starters', 'Split beef bone marrow, caramelized shallot marmalade, grilled herb brioche.', Decimal('22.00'), Decimal('5.00'), 'APP-03', 10, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', True, False, 510, 'Gluten'),

        # Mains
        ('Pan-Seared Crispy Skin Norwegian Salmon', 'mains', 'King salmon, saffron cauliflower purée, roasted Romanesco, lemon dill beurre blanc.', Decimal('38.00'), Decimal('11.00'), 'MAIN-01', 15, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500', True, True, 620, 'Fish, Dairy'),
        ('Handmade Tagliolini al Tartufo', 'mains', 'Fresh egg pasta tossed in Normandy butter, organic egg yolk, and generous shaved black truffle.', Decimal('34.00'), Decimal('8.00'), 'MAIN-02', 12, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=500', True, True, 680, 'Gluten, Dairy, Egg'),
        ('Duck Confit & Wild Forest Mushroom Risotto', 'mains', 'Slow-cooked Moulard duck leg, Arborio rice, chanterelle mushrooms, aged pecorino.', Decimal('36.00'), Decimal('9.50'), 'MAIN-03', 16, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', True, False, 750, 'Dairy'),

        # Sides
        ('Triple-Cooked Duck Fat Truffle Fries', 'sides', 'Hand-cut Kennebec potatoes fried in duck fat, white truffle oil, shaved parmesan, chives.', Decimal('14.00'), Decimal('2.50'), 'SIDE-01', 6, KitchenStation.FRYER, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', True, True, 480, 'Dairy'),
        ('Charred Broccolini & Garlic Confit', 'sides', 'Fire-roasted broccolini, chili flakes, preserved lemon, crispy garlic chips.', Decimal('12.00'), Decimal('2.10'), 'SIDE-02', 8, KitchenStation.GRILL, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', True, False, 190, ''),
        ('Smoked Gouda & Lobster Mac n Cheese', 'sides', 'Cavatappi pasta, 4-cheese fondue, butter-poached Maine lobster claw, brioche crumble.', Decimal('21.00'), Decimal('6.00'), 'SIDE-03', 10, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500', True, True, 620, 'Shellfish, Dairy, Gluten'),

        # Beverages
        ('Smoked Old Fashioned in Cloche', 'beverages', 'High-rye bourbon, Demerara syrup, Angostura bitters, table-side smoked applewood cloche.', Decimal('19.00'), Decimal('3.50'), 'BEV-01', 4, KitchenStation.BAR, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500', True, True, 210, ''),
        ('The Midnight Velvet Espresso Martini', 'beverages', 'Vanilla bean infused vodka, freshly pulled single-origin espresso, Kahlúa, dark cacao.', Decimal('18.00'), Decimal('3.00'), 'BEV-02', 4, KitchenStation.BAR, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', True, True, 230, ''),
        ('Reserve Napa Cabernet Sauvignon (Glass)', 'beverages', 'Rich blackberry, cassis, velvet tannins and French oak finish.', Decimal('22.00'), Decimal('5.00'), 'BEV-03', 2, KitchenStation.BAR, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500', True, False, 160, ''),

        # Desserts
        ('Valrhona Molten Dark Chocolate Sphere', 'desserts', '70% Guanaja chocolate dome, warm salted caramel pour-over, bourbon vanilla bean gelato.', Decimal('16.00'), Decimal('3.80'), 'DES-01', 8, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', True, True, 580, 'Dairy, Egg, Gluten'),
        ('Tahitian Vanilla Bean Crème Brûlée', 'desserts', 'Silky baked custard with torched Madagascar sugar glass and macerated wild blackberries.', Decimal('14.00'), Decimal('2.80'), 'DES-02', 6, KitchenStation.ASSEMBLY, 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=500', True, False, 410, 'Dairy, Egg'),
    ]

    menu_objs = {}
    for name, cat_slug, desc, price, cost, sku, prep, station, img, avail, kiosk, cal, aller in menu_items_data:
        m, _ = MenuItem.objects.update_or_create(
            sku=sku,
            defaults={
                'name': name,
                'category': cat_objs[cat_slug],
                'description': desc,
                'price': price,
                'cost_price': cost,
                'prep_time_minutes': prep,
                'station': station,
                'image_url': img,
                'is_available': avail,
                'is_kiosk_featured': kiosk,
                'calories': cal,
                'allergens': aller
            }
        )
        menu_objs[sku] = m

        # Link modifier groups
        if cat_slug == 'steaks':
            MenuItemModifierGroup.objects.get_or_create(menu_item=m, modifier_group=mod_steak_temp)
            MenuItemModifierGroup.objects.get_or_create(menu_item=m, modifier_group=mod_sauces)
        elif cat_slug == 'beverages':
            MenuItemModifierGroup.objects.get_or_create(menu_item=m, modifier_group=mod_cocktail_prep)

    print(f"  * Seeded {len(menu_items_data)} gourmet menu items with modifier links")

    # 7. Floor Sections & Tables
    sections_data = [
        ('Main Dining Hall', 'main-dining', 'Grand chandelier indoor seating', 1),
        ('VIP Terrace & Skyline', 'vip-terrace', 'Panoramic city view premium booths', 2),
        ('Cocktail Lounge & Bar', 'bar-lounge', 'High-top tables and craft cocktail seating', 3),
        ('Garden Patio (Outdoor)', 'garden-patio', 'Alfresco dining under pergolas', 4),
    ]

    sec_objs = {}
    for name, slug, desc, order in sections_data:
        s, _ = FloorSection.objects.update_or_create(
            slug=slug,
            defaults={'name': name, 'description': desc, 'sort_order': order}
        )
        sec_objs[slug] = s

    tables_data = [
        # Main Dining Hall
        ('T1', 'main-dining', 4, 'SQUARE', 50, 40, 90, 90, TableStatus.AVAILABLE, 0),
        ('T2', 'main-dining', 4, 'SQUARE', 180, 40, 90, 90, TableStatus.OCCUPIED, 4),
        ('T3', 'main-dining', 2, 'ROUND', 310, 40, 80, 80, TableStatus.AVAILABLE, 0),
        ('T4', 'main-dining', 6, 'RECTANGLE', 440, 40, 130, 90, TableStatus.OCCUPIED, 5),
        ('T5', 'main-dining', 4, 'SQUARE', 50, 180, 90, 90, TableStatus.BILL_REQUESTED, 3),
        ('T6', 'main-dining', 4, 'SQUARE', 180, 180, 90, 90, TableStatus.AVAILABLE, 0),
        ('T7', 'main-dining', 8, 'RECTANGLE', 310, 180, 160, 90, TableStatus.RESERVED, 0),
        ('T8', 'main-dining', 2, 'ROUND', 510, 180, 80, 80, TableStatus.AVAILABLE, 0),

        # VIP Terrace
        ('VIP-01', 'vip-terrace', 4, 'ROUND', 60, 50, 100, 100, TableStatus.OCCUPIED, 2),
        ('VIP-02', 'vip-terrace', 6, 'RECTANGLE', 220, 50, 140, 100, TableStatus.RESERVED, 0),
        ('VIP-03', 'vip-terrace', 4, 'ROUND', 420, 50, 100, 100, TableStatus.AVAILABLE, 0),

        # Cocktail Lounge
        ('B-01', 'bar-lounge', 2, 'ROUND', 50, 60, 70, 70, TableStatus.OCCUPIED, 2),
        ('B-02', 'bar-lounge', 2, 'ROUND', 160, 60, 70, 70, TableStatus.AVAILABLE, 0),
        ('B-03', 'bar-lounge', 4, 'SQUARE', 270, 60, 85, 85, TableStatus.AVAILABLE, 0),
        ('B-04', 'bar-lounge', 4, 'SQUARE', 400, 60, 85, 85, TableStatus.OCCUPIED, 4),

        # Garden Patio
        ('P-01', 'garden-patio', 4, 'SQUARE', 60, 60, 90, 90, TableStatus.AVAILABLE, 0),
        ('P-02', 'garden-patio', 4, 'SQUARE', 200, 60, 90, 90, TableStatus.OCCUPIED, 3),
        ('P-03', 'garden-patio', 6, 'RECTANGLE', 350, 60, 130, 90, TableStatus.AVAILABLE, 0),
    ]

    table_objs = {}
    for num, sec_slug, cap, shape, px, py, w, h, st, guests in tables_data:
        t, _ = DiningTable.objects.update_or_create(
            table_number=num,
            defaults={
                'section': sec_objs[sec_slug],
                'capacity': cap,
                'shape': shape,
                'pos_x': px,
                'pos_y': py,
                'width': w,
                'height': h,
                'status': st,
                'guest_count': guests,
                'seated_at': timezone.now() - datetime.timedelta(minutes=35) if st == TableStatus.OCCUPIED else None
            }
        )
        table_objs[num] = t
    print(f"  * Seeded {len(tables_data)} dining tables across 4 floor plan sections")

    # 7.5 Delivery Zones
    z_new_cairo, _ = DeliveryZone.objects.update_or_create(name='New Cairo', defaults={'city': 'Cairo', 'delivery_fee': Decimal('30.00'), 'estimated_minutes': 35, 'min_order_free_delivery': Decimal('500.00'), 'is_active': True})
    z_maadi, _ = DeliveryZone.objects.update_or_create(name='Maadi', defaults={'city': 'Cairo', 'delivery_fee': Decimal('40.00'), 'estimated_minutes': 45, 'min_order_free_delivery': Decimal('600.00'), 'is_active': True})
    z_nasr_city, _ = DeliveryZone.objects.update_or_create(name='Nasr City', defaults={'city': 'Cairo', 'delivery_fee': Decimal('35.00'), 'estimated_minutes': 40, 'min_order_free_delivery': Decimal('500.00'), 'is_active': True})
    z_heliopolis, _ = DeliveryZone.objects.update_or_create(name='Heliopolis', defaults={'city': 'Cairo', 'delivery_fee': Decimal('35.00'), 'estimated_minutes': 40, 'min_order_free_delivery': Decimal('500.00'), 'is_active': True})
    z_downtown, _ = DeliveryZone.objects.update_or_create(name='Downtown & Zamalek', defaults={'city': 'Cairo', 'delivery_fee': Decimal('25.00'), 'estimated_minutes': 30, 'min_order_free_delivery': Decimal('400.00'), 'is_active': True})
    print("  * Seeded 5 Delivery Zones with area-specific fees")

    # 8. Customers & Delivery CRM
    customers_data = [
        ('Ahmed Mohamed', '01012345678', '+201012345678', 'ahmed.m@cairo.eg', CustomerTier.PLATINUM, 2450, Decimal('4250.00'), 27, 'Loves Truffle Tagliolini. Call before arriving.', 'No Shellfish', 'Ahmed', 'Mohamed', 'CUST-1001'),
        ('Mahmoud Hassan', '01198765432', '+201198765432', 'mahmoud.h@cairo.eg', CustomerTier.GOLD, 1420, Decimal('2100.00'), 14, 'Prefers medium rare Wagyu. Extra sauces.', 'Gluten-Free', 'Mahmoud', 'Hassan', 'CUST-1002'),
        ('Julian Sterling', '+1 (555) 234-5678', '+15552345678', 'julian.sterling@luxury.io', CustomerTier.PLATINUM, 3420, Decimal('4850.00'), 18, 'Prefers Table VIP-01. Likes Chateau Margaux. Anniversary on Oct 12.', 'No Shellfish', 'Julian', 'Sterling', 'CUST-1003'),
        ('Amara Vance', '+1 (555) 345-6789', '+15553456789', 'amara.v@techfoundry.co', CustomerTier.GOLD, 1850, Decimal('2340.00'), 11, 'Regular Sunday dinner guest. Loves Wagyu medium rare.', 'Gluten-Free', 'Amara', 'Vance', 'CUST-1004'),
        ('Clara Beauchamp', '01233445566', '+201233445566', 'clara@designstudio.fr', CustomerTier.BRONZE, 180, Decimal('210.00'), 2, 'Likes corner tables in garden patio.', 'Vegetarian-Friendly', 'Clara', 'Beauchamp', 'CUST-1005'),
        ('Alexander Wright', '+1 (555) 678-9012', '+15556789012', 'alex.wright@capital.com', CustomerTier.PLATINUM, 4200, Decimal('6100.00'), 24, 'High roller, corporate entertaining account. Automatic 20% gratuity.', '', 'Alexander', 'Wright', 'CUST-1006'),
    ]

    cust_objs = {}
    for name, ph, nph, em, tier, pts, spent, vcount, notes, dtags, fn, ln, code in customers_data:
        c, _ = Customer.objects.update_or_create(
            phone=ph,
            defaults={
                'name': name, 'first_name': fn, 'last_name': ln, 'customer_code': code,
                'normalized_phone': nph, 'email': em, 'vip_tier': tier,
                'loyalty_points': pts, 'total_spent': spent,
                'visit_count': vcount, 'notes': notes, 'dietary_tags': dtags
            }
        )
        cust_objs[name] = c

    # 8.1 Customer Multi-Addresses
    CustomerAddress.objects.update_or_create(
        customer=cust_objs['Ahmed Mohamed'],
        label='HOME',
        defaults={'city': 'Cairo', 'area': 'New Cairo', 'street': 'Street 90 South', 'building': 'Building 15', 'floor': '2nd Floor', 'apartment': 'Apt 6', 'landmark': 'Next to Seif Pharmacy', 'instructions': 'Ring doorbell twice. Concierge at gate.', 'is_default': True}
    )
    CustomerAddress.objects.update_or_create(
        customer=cust_objs['Ahmed Mohamed'],
        label='WORK',
        defaults={'city': 'Cairo', 'area': 'Nasr City', 'street': 'Abbas El Akkad St', 'building': 'Tech Tower 8', 'floor': '5th Floor', 'apartment': 'Suite 502', 'landmark': 'Above CIB Bank', 'instructions': 'Leave with 5th floor reception desk.', 'is_default': False}
    )
    CustomerAddress.objects.update_or_create(
        customer=cust_objs['Mahmoud Hassan'],
        label='HOME',
        defaults={'city': 'Cairo', 'area': 'Maadi', 'street': 'Street 9', 'building': 'Villa 21', 'floor': 'Ground Floor', 'apartment': '', 'landmark': 'Opposite Degla Club', 'instructions': 'Direct gate access.', 'is_default': True}
    )
    CustomerAddress.objects.update_or_create(
        customer=cust_objs['Clara Beauchamp'],
        label='HOME',
        defaults={'city': 'Cairo', 'area': 'Zamalek', 'street': '26th of July Corridor', 'building': 'Building 88', 'floor': '4th Floor', 'apartment': 'Apt 4C', 'landmark': 'Near Marriott Hotel', 'instructions': 'Ring buzzer 204.', 'is_default': True}
    )

    # 8.2 Customer Notes
    CustomerNote.objects.update_or_create(customer=cust_objs['Ahmed Mohamed'], note_type='DELIVERY', defaults={'content': 'Call mobile when reaching gate. Gate security requires confirmation.', 'created_by': staff_objs[StaffRole.CASHIER]})
    CustomerNote.objects.update_or_create(customer=cust_objs['Ahmed Mohamed'], note_type='FOOD_PREFERENCE', defaults={'content': 'Loves extra parmesan on pasta. Prefers crispy french fries.', 'created_by': staff_objs[StaffRole.CHEF]})
    CustomerNote.objects.update_or_create(customer=cust_objs['Julian Sterling'], note_type='VIP', defaults={'content': 'High net-worth corporate entertaining account. Automatic VIP table priority.', 'created_by': staff_objs[StaffRole.ADMIN]})

    print(f"  * Seeded {len(customers_data)} CRM customer profiles with multi-addresses and categorized notes")

    # 9. Active Orders (FOH, BOH KDS, Delivery)
    # Order 1: Active in Kitchen (Table T2)
    ord1, _ = Order.objects.update_or_create(
        order_number='ORD-260901-1042',
        defaults={
            'order_type': OrderType.DINE_IN,
            'status': OrderStatus.PREPARING,
            'table': table_objs['T2'],
            'customer': cust_objs['Julian Sterling'],
            'server': staff_objs[StaffRole.WAITER],
            'guest_count': 4,
            'subtotal': Decimal('228.00'),
            'tax_amount': Decimal('18.81'),
            'tip_amount': Decimal('35.00'),
            'total_amount': Decimal('281.81'),
            'payment_method': PaymentMethod.CARD,
            'payment_status': PaymentStatus.UNPAID,
            'special_instructions': 'Guest allergic to peanuts. Table VIP celebration.',
            'created_at': timezone.now() - datetime.timedelta(minutes=14)
        }
    )
    table_objs['T2'].current_order_id = ord1.id
    table_objs['T2'].save()

    OrderItem.objects.get_or_create(
        order=ord1,
        menu_item=menu_objs['STK-01'],
        defaults={'quantity': 2, 'unit_price': Decimal('98.00'), 'total_price': Decimal('196.00'), 'status': OrderItemStatus.COOKING, 'station': KitchenStation.GRILL, 'selected_modifiers': [{'name': 'Medium Rare (Chef Rec.)', 'price_extra': 0}], 'notes': 'Extra charred crust'}
    )
    OrderItem.objects.get_or_create(
        order=ord1,
        menu_item=menu_objs['SIDE-01'],
        defaults={'quantity': 1, 'unit_price': Decimal('14.00'), 'total_price': Decimal('14.00'), 'status': OrderItemStatus.COOKING, 'station': KitchenStation.FRYER, 'notes': 'Crispy'}
    )
    OrderItem.objects.get_or_create(
        order=ord1,
        menu_item=menu_objs['BEV-01'],
        defaults={'quantity': 1, 'unit_price': Decimal('19.00'), 'total_price': Decimal('19.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.BAR, 'selected_modifiers': [{'name': 'Hand-carved Ice Sphere', 'price_extra': 2.00}], 'notes': ''}
    )

    # Order 2: KDS Ready for Serving (Table T4)
    ord2, _ = Order.objects.update_or_create(
        order_number='ORD-260901-1043',
        defaults={
            'order_type': OrderType.DINE_IN,
            'status': OrderStatus.READY,
            'table': table_objs['T4'],
            'customer': cust_objs['Amara Vance'],
            'server': staff_objs[StaffRole.WAITER],
            'guest_count': 5,
            'subtotal': Decimal('162.50'),
            'tax_amount': Decimal('13.41'),
            'total_amount': Decimal('175.91'),
            'payment_status': PaymentStatus.UNPAID,
            'created_at': timezone.now() - datetime.timedelta(minutes=22)
        }
    )
    table_objs['T4'].current_order_id = ord2.id
    table_objs['T4'].save()

    OrderItem.objects.get_or_create(
        order=ord2,
        menu_item=menu_objs['MAIN-01'],
        defaults={'quantity': 2, 'unit_price': Decimal('38.00'), 'total_price': Decimal('76.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.GRILL}
    )
    OrderItem.objects.get_or_create(
        order=ord2,
        menu_item=menu_objs['APP-01'],
        defaults={'quantity': 2, 'unit_price': Decimal('24.00'), 'total_price': Decimal('48.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.ASSEMBLY}
    )

    # Order 3: Delivery Order (In Transit)
    ord3, _ = Order.objects.update_or_create(
        order_number='ORD-260901-1044',
        defaults={
            'order_type': OrderType.DELIVERY,
            'status': OrderStatus.PREPARING,
            'customer': cust_objs['Alexander Wright'],
            'subtotal': Decimal('146.00'),
            'tax_amount': Decimal('12.05'),
            'tip_amount': Decimal('20.00'),
            'total_amount': Decimal('178.05'),
            'payment_method': PaymentMethod.CARD,
            'payment_status': PaymentStatus.PAID,
            'created_at': timezone.now() - datetime.timedelta(minutes=28)
        }
    )
    OrderItem.objects.get_or_create(
        order=ord3,
        menu_item=menu_objs['STK-02'],
        defaults={'quantity': 1, 'unit_price': Decimal('68.00'), 'total_price': Decimal('68.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.GRILL}
    )
    OrderItem.objects.get_or_create(
        order=ord3,
        menu_item=menu_objs['MAIN-02'],
        defaults={'quantity': 1, 'unit_price': Decimal('34.00'), 'total_price': Decimal('34.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.ASSEMBLY}
    )
    OrderItem.objects.get_or_create(
        order=ord3,
        menu_item=menu_objs['DES-01'],
        defaults={'quantity': 2, 'unit_price': Decimal('16.00'), 'total_price': Decimal('32.00'), 'status': OrderItemStatus.READY, 'station': KitchenStation.ASSEMBLY}
    )
    DeliveryOrder.objects.update_or_create(
        order=ord3,
        defaults={
            'driver': staff_objs[StaffRole.DRIVER],
            'delivery_address': '450 Penthouse Way, Skyline Tower 2B',
            'customer_phone': '+1 (555) 678-9012',
            'customer_name': 'Alexander Wright',
            'delivery_status': DeliveryStatus.PICKED_UP,
            'estimated_minutes': 18,
            'dispatched_at': timezone.now() - datetime.timedelta(minutes=10),
            'driver_notes': 'Ring buzzer 204. Concierge will let up.'
        }
    )

    # Order 4: Delivery Order (Pending Dispatch)
    ord4, _ = Order.objects.update_or_create(
        order_number='ORD-260901-1045',
        defaults={
            'order_type': OrderType.DELIVERY,
            'status': OrderStatus.READY,
            'customer': cust_objs['Clara Beauchamp'],
            'subtotal': Decimal('68.50'),
            'tax_amount': Decimal('5.65'),
            'total_amount': Decimal('74.15'),
            'payment_method': PaymentMethod.CARD,
            'payment_status': PaymentStatus.PAID,
            'created_at': timezone.now() - datetime.timedelta(minutes=15)
        }
    )
    DeliveryOrder.objects.update_or_create(
        order=ord4,
        defaults={
            'driver': None,
            'delivery_address': '88 Elm Street, Apt 4C',
            'customer_phone': '+1 (555) 567-8901',
            'customer_name': 'Clara Beauchamp',
            'delivery_status': DeliveryStatus.UNASSIGNED,
            'estimated_minutes': 30,
            'driver_notes': 'Leave at door if no answer.'
        }
    )

    # 10. Cash Shift
    CashShift.objects.get_or_create(
        staff=staff_objs[StaffRole.CASHIER],
        status='OPEN',
        defaults={
            'opening_cash': Decimal('400.00'),
            'total_sales': Decimal('1840.50'),
            'total_cash_sales': Decimal('420.00'),
            'total_card_sales': Decimal('1420.50'),
            'opened_at': timezone.now() - datetime.timedelta(hours=6),
            'notes': 'Afternoon lunch rush shift. Everything balanced.'
        }
    )

    # 11. Multi-Branch Enterprise Network
    b1, _ = Branch.objects.update_or_create(code='METRO-01', defaults={'name': "L'Étoile Downtown Flagship", 'address': '742 Evergreen Terrace, Metropolis', 'phone': '+1 (800) 555-FOOD', 'is_main': True})
    b2, _ = Branch.objects.update_or_create(code='METRO-02', defaults={'name': "L'Étoile Uptown Terrace", 'address': '1200 Grand Avenue, Metropolis', 'phone': '+1 (800) 555-UPTW', 'is_main': False})
    b3, _ = Branch.objects.update_or_create(code='METRO-03', defaults={'name': "L'Étoile Harbor Bay", 'address': '45 Marina Boulevard, Metropolis', 'phone': '+1 (800) 555-BAY1', 'is_main': False})
    print("  * Seeded 3 Multi-Branch restaurant locations")

    # 12. Suppliers & Purchase Orders
    s1, _ = Supplier.objects.update_or_create(name='Gourmet Meats Direct', defaults={'contact_name': 'Hans Becker', 'phone': '+1 555-882-1000', 'email': 'orders@gourmetmeats.com', 'lead_time_days': 2, 'quality_score': 98, 'on_time_rate': Decimal('99.20'), 'total_purchased': Decimal('48500.00')})
    s2, _ = Supplier.objects.update_or_create(name='French Truffle & Fine Imports', defaults={'contact_name': 'Henri Laurent', 'phone': '+1 555-334-9000', 'email': 'henri@truffles.fr', 'lead_time_days': 3, 'quality_score': 94, 'on_time_rate': Decimal('96.50'), 'total_purchased': Decimal('22100.00')})
    s3, _ = Supplier.objects.update_or_create(name='Artisan Dairy Cooperative', defaults={'contact_name': 'Marie DuPont', 'phone': '+1 555-112-4400', 'email': 'sales@artisandairy.co', 'lead_time_days': 1, 'quality_score': 96, 'on_time_rate': Decimal('98.00'), 'total_purchased': Decimal('14200.00')})

    po1, _ = PurchaseOrder.objects.update_or_create(
        po_number='PO-8821',
        defaults={'supplier': s1, 'status': 'DRAFT', 'total_amount': Decimal('1200.00'), 'expected_delivery': timezone.now().date() + datetime.timedelta(days=2), 'notes': 'A5 Wagyu restock for weekend rush', 'created_by': staff_objs[StaffRole.ADMIN]}
    )
    po2, _ = PurchaseOrder.objects.update_or_create(
        po_number='PO-8822',
        defaults={'supplier': s2, 'status': 'SUBMITTED', 'total_amount': Decimal('850.00'), 'expected_delivery': timezone.now().date() + datetime.timedelta(days=1), 'notes': 'Black Winter Truffle restock', 'created_by': staff_objs[StaffRole.MANAGER]}
    )
    print("  * Seeded Suppliers and Purchase Orders")

    # 13. Marketing Campaigns
    MarketingCampaign.objects.update_or_create(name='VIP Truffle Tasting Week', defaults={'campaign_type': 'VIP', 'channel': 'SMS', 'target_segment': 'VIP', 'discount_percent': Decimal('10.00'), 'budget': Decimal('300.00'), 'messages_sent': 140, 'redeemed_count': 38, 'revenue_generated': Decimal('3840.00'), 'profit_generated': Decimal('2420.00'), 'status': 'ACTIVE'})
    MarketingCampaign.objects.update_or_create(name='Win-Back Inactive Diners', defaults={'campaign_type': 'WIN_BACK', 'channel': 'EMAIL', 'target_segment': 'AT_RISK', 'discount_percent': Decimal('15.00'), 'budget': Decimal('150.00'), 'messages_sent': 85, 'redeemed_count': 19, 'revenue_generated': Decimal('1520.00'), 'profit_generated': Decimal('890.00'), 'status': 'ACTIVE'})
    MarketingCampaign.objects.update_or_create(name='Late Night Mixology Happy Hour', defaults={'campaign_type': 'HAPPY_HOUR', 'channel': 'WHATSAPP', 'target_segment': 'ALL', 'discount_percent': Decimal('20.00'), 'budget': Decimal('200.00'), 'messages_sent': 220, 'redeemed_count': 54, 'revenue_generated': Decimal('2160.00'), 'profit_generated': Decimal('1620.00'), 'status': 'ACTIVE'})
    print("  * Seeded Marketing Campaigns with ROI metrics")

    # 14. Waitlist & Reservations
    WaitlistEntry.objects.update_or_create(customer_name='Elena Gilbert', phone='+1 555-891-2233', defaults={'party_size': 2, 'preferred_section': 'Cocktail Lounge', 'estimated_wait_minutes': 12, 'status': 'WAITING'})
    WaitlistEntry.objects.update_or_create(customer_name='Marcus Holloway', phone='+1 555-442-9988', defaults={'party_size': 4, 'preferred_section': 'VIP Terrace', 'estimated_wait_minutes': 25, 'status': 'WAITING'})

    Reservation.objects.update_or_create(
        customer_name='Julian Sterling',
        reservation_time=timezone.now() + datetime.timedelta(hours=3),
        defaults={'customer': cust_objs['Julian Sterling'], 'phone': '+1 (555) 234-5678', 'table': table_objs['VIP-01'], 'party_size': 4, 'deposit_amount': Decimal('100.00'), 'status': 'CONFIRMED', 'notes': 'Anniversary dinner. Champagne on ice.'}
    )
    Reservation.objects.update_or_create(
        customer_name='Alexander Wright',
        reservation_time=timezone.now() + datetime.timedelta(hours=5),
        defaults={'customer': cust_objs['Alexander Wright'], 'phone': '+1 (555) 678-9012', 'table': table_objs['VIP-02'], 'party_size': 6, 'deposit_amount': Decimal('150.00'), 'status': 'CONFIRMED', 'notes': 'Executive Board dinner.'}
    )
    print("  * Seeded Waitlist queue and VIP Reservations")

    # 15. Staff Attendance & Approvals
    StaffAttendance.objects.update_or_create(staff=staff_objs[StaffRole.WAITER], clock_in=timezone.now() - datetime.timedelta(hours=5), defaults={'status': 'ON_TIME', 'break_minutes': 30})
    StaffAttendance.objects.update_or_create(staff=staff_objs[StaffRole.CHEF], clock_in=timezone.now() - datetime.timedelta(hours=6), defaults={'status': 'ON_TIME', 'break_minutes': 45})

    ApprovalRequest.objects.update_or_create(
        request_type='LARGE_DISCOUNT',
        requester=staff_objs[StaffRole.CASHIER],
        defaults={'amount': Decimal('45.00'), 'reason': 'Customer VIP promotion manual override for Julian Sterling table', 'status': 'PENDING', 'payload': {'table': 'VIP-01', 'discount_pct': 20}}
    )
    ApprovalRequest.objects.update_or_create(
        request_type='PRICE_CHANGE',
        requester=staff_objs[StaffRole.MANAGER],
        defaults={'amount': Decimal('4.00'), 'reason': 'Truffle Tagliolini price adjustment from $34 to $38 due to import inflation', 'status': 'PENDING', 'payload': {'item_id': 8, 'old_price': 34.0, 'new_price': 38.0}}
    )
    print("  * Seeded Staff Attendance & Manager Approval requests")

    # 16. Risk Alerts & Customer Feedback
    RiskAlert.objects.update_or_create(
        alert_type='FOOD_COST_SPIKE',
        defaults={'severity': 'HIGH', 'description': 'Black Winter Truffle cost increased by 8.5% across regional wholesale markets.', 'is_resolved': False}
    )
    RiskAlert.objects.update_or_create(
        alert_type='KITCHEN_DELAY_SLA',
        defaults={'severity': 'MEDIUM', 'description': 'Grill station ticket times averaged 16.2 min during 20:00 rush.', 'is_resolved': False}
    )

    CustomerFeedback.objects.update_or_create(customer_name='Julian Sterling', defaults={'rating_overall': 5, 'rating_food': 5, 'rating_service': 5, 'rating_speed': 5, 'comment': 'The A5 Wagyu was cooked to absolute perfection. Exemplary service from Sophie Laurent.', 'status': 'RESOLVED'})
    CustomerFeedback.objects.update_or_create(customer_name='Amara Vance', defaults={'rating_overall': 5, 'rating_food': 5, 'rating_service': 5, 'rating_speed': 4, 'comment': 'Exquisite truffle tagliolini. Atmosphere is world-class.', 'status': 'RESOLVED'})
    print("  * Seeded Risk Alerts and Customer Reviews")

    # 17. Targets & Expenses
    BusinessTarget.objects.update_or_create(metric_name='MONTHLY_REVENUE', defaults={'target_value': Decimal('120000.00'), 'actual_value': Decimal('98400.00'), 'period': 'MONTHLY', 'start_date': timezone.now().date(), 'end_date': timezone.now().date() + datetime.timedelta(days=30)})
    BusinessTarget.objects.update_or_create(metric_name='FOOD_COST_PCT', defaults={'target_value': Decimal('28.00'), 'actual_value': Decimal('28.40'), 'period': 'MONTHLY', 'start_date': timezone.now().date(), 'end_date': timezone.now().date() + datetime.timedelta(days=30)})

    ExpenseRecord.objects.update_or_create(category='RENT', defaults={'amount': Decimal('8500.00'), 'description': 'Monthly downtown flagship lease', 'branch': b1, 'expense_date': timezone.now().date()})
    ExpenseRecord.objects.update_or_create(category='UTILITIES', defaults={'amount': Decimal('1450.00'), 'description': 'Gas, electricity & commercial refrigeration', 'branch': b1, 'expense_date': timezone.now().date()})
    ExpenseRecord.objects.update_or_create(category='MARKETING', defaults={'amount': Decimal('1200.00'), 'description': 'VIP Campaign & Social Media Ad Spend', 'branch': b1, 'expense_date': timezone.now().date()})
    print("  * Seeded Financial Targets and Operating Expenses")

    # 18. AI Recommendations
    AIRecommendation.objects.update_or_create(
        category='PRICING',
        title='Optimize Truffle Tagliolini Selling Price',
        defaults={
            'recommendation': 'Increase Tagliolini al Tartufo from $34.00 to $38.00.',
            'reason': 'French Truffle ingredient cost increased 8.5%. Item popularity is in the 88th percentile (Plowhorse category), indicating zero demand risk with a $4 increase.',
            'supporting_metrics': {'current_margin': '64%', 'projected_margin': '72%', 'monthly_profit_gain': '+$864.00'},
            'confidence': 96,
            'expected_impact': '+$864.00 Monthly Profit',
            'status': 'NEW'
        }
    )
    AIRecommendation.objects.update_or_create(
        category='INVENTORY',
        title='Auto-Approve Wagyu Striploin Restock',
        defaults={
            'recommendation': 'Approve Purchase Order #PO-8821 for 15 KG of A5 Wagyu from Gourmet Meats Direct.',
            'reason': 'Current stock is 5.0 KG (safety reorder point: 7.5 KG). Friday/Saturday evening demand is forecast at 6.2 KG.',
            'supporting_metrics': {'stockout_probability': '82%', 'lead_time': '2 days'},
            'confidence': 98,
            'expected_impact': 'Prevent Weekend 86 Out-of-Stock',
            'status': 'NEW'
        }
    )
    AIRecommendation.objects.update_or_create(
        category='MARKETING',
        title='Launch Win-Back Campaign for 14 Inactive Diners',
        defaults={
            'recommendation': 'Send personalized 15% dinner incentive via SMS to at-risk diners who have not visited in >30 days.',
            'reason': 'Historical conversion rate for win-back campaigns is 22.4% with average ticket of $84.00.',
            'supporting_metrics': {'audience_size': 14, 'expected_conversions': 4, 'roi_multiplier': '6.2x'},
            'confidence': 91,
            'expected_impact': '+$336.00 Incremental Revenue',
            'status': 'NEW'
        }
    )
    print("  * Seeded AI Management Recommendations")

    print("[+] Seed complete! RestaurantOS enterprise database is loaded with production data.")

if __name__ == '__main__':
    seed()

