import os
import sys
import django
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurantos_backend.settings')
django.setup()

from api.models import (
    BusinessConfig, Brand, CateringEvent, MenuPricingRule,
    DiningTable, FloorSection, MenuItem, TableStatus
)

def seed_universal_platform():
    print("[+] Seeding Universal Restaurant Operating System (UROS)...")

    # 1. Master Business Config
    config, created = BusinessConfig.objects.get_or_create(
        id=1,
        defaults={
            'business_name': 'Noir Hospitality Group',
            'business_mode': 'FINE_DINING',
            'operating_tenant_code': 'TENANT-001',
            'currency_code': 'USD',
            'currency_symbol': '$',
            'tax_percentage': Decimal('14.00'),
            'service_charge_percentage': Decimal('12.00'),
            'tax_inclusive': False,
            'active_brand_count': 3,
            'active_branch_count': 4,
            'feature_flags': {
                'enable_dine_in': True,
                'enable_takeaway': True,
                'enable_delivery': True,
                'enable_catering': True,
                'enable_kiosk': True,
                'enable_qr_ordering': True,
                'enable_online_ordering': True,
                'enable_loyalty': True,
                'enable_marketing': True,
                'enable_inventory': True,
                'enable_recipes': True,
                'enable_waste': True,
                'enable_printers': True,
                'enable_kds': True,
                'enable_tables': True,
                'enable_delivery_drivers': True,
                'enable_multi_branch': True,
                'enable_ai': True,
                'enable_forecasting': True,
                'enable_attendance': True,
                'enable_accounting': True
            }
        }
    )
    print(f"  [OK] Business Configuration: {config.business_name} ({config.business_mode})")

    # 2. Multi-Brand Topology
    brands_data = [
        {
            'code': 'NOIR_PIZZA',
            'name_en': 'Noir Pizza & Trattoria',
            'name_ar': 'نوار بيتزا وتراطوريا',
            'cuisine_type': 'Neapolitan & Artisanal Pizza',
            'theme_color': '#f2ca50',
            'gross_revenue': Decimal('1420000.00'),
            'order_count': 4280,
            'cogs_percentage': Decimal('29.40'),
            'profit_lift_percentage': Decimal('8.50'),
            'is_active': True
        },
        {
            'code': 'NOIR_BURGER',
            'name_en': 'Noir Prime Burger House',
            'name_ar': 'نوار برجر هاوس الفاخر',
            'cuisine_type': 'Gourmet Wagyu & Steaks',
            'theme_color': '#ff949c',
            'gross_revenue': Decimal('1850000.00'),
            'order_count': 5610,
            'cogs_percentage': Decimal('31.80'),
            'profit_lift_percentage': Decimal('12.20'),
            'is_active': True
        },
        {
            'code': 'LUMINA_CAFE',
            'name_en': 'Lumina Specialty Roastery',
            'name_ar': 'لومينا كافيه ومحمصة مختصة',
            'cuisine_type': 'Third-Wave Coffee & French Pastry',
            'theme_color': '#4edea3',
            'gross_revenue': Decimal('930000.00'),
            'order_count': 9150,
            'cogs_percentage': Decimal('24.50'),
            'profit_lift_percentage': Decimal('14.70'),
            'is_active': True
        }
    ]

    for b_data in brands_data:
        brand, _ = Brand.objects.update_or_create(code=b_data['code'], defaults=b_data)
        print(f"  [OK] Brand: {brand.name_en} (${brand.gross_revenue:,.2f})")

    # 3. Universal Table 2.0 Zones & Seating
    # Assign sections and zones to existing dining tables
    zone_mapping = [
        ('1', 'Main Dining', 'SQUARE', 4, False, 'STARTER_HOLD', TableStatus.OCCUPIED),
        ('2', 'Main Dining', 'RECTANGLE', 6, False, 'STARTER_FIRE', TableStatus.AVAILABLE),
        ('3', 'VIP Lounge', 'ROUND', 4, True, 'MAIN_HOLD', TableStatus.RESERVED),
        ('4', 'Main Dining', 'RECTANGLE', 4, False, 'DESSERT_FIRE', TableStatus.BILL_REQUESTED),
        ('5', 'Terrace', 'ROUND', 2, False, 'STARTER_HOLD', TableStatus.AVAILABLE),
        ('6', 'Terrace', 'SQUARE', 4, False, 'STARTER_HOLD', TableStatus.OCCUPIED),
        ('7', 'VIP Lounge', 'ROUND', 8, True, 'MAIN_FIRE', TableStatus.OCCUPIED),
        ('8', 'Bar', 'SQUARE', 2, False, 'STARTER_HOLD', TableStatus.AVAILABLE),
        ('9', 'Bar', 'SQUARE', 2, False, 'STARTER_HOLD', TableStatus.AVAILABLE),
        ('10', 'Bar', 'SQUARE', 2, False, 'STARTER_HOLD', TableStatus.AVAILABLE),
        ('11', 'Bar', 'SQUARE', 2, False, 'STARTER_HOLD', TableStatus.OCCUPIED),
        ('12', 'Main Dining', 'RECTANGLE', 4, False, 'MAIN_FIRE', TableStatus.OCCUPIED),
    ]

    for tbl_num, zone_name, shape_val, cap_val, access_flag, coursing, status_val in zone_mapping:
        tbl = DiningTable.objects.filter(table_number=tbl_num).first()
        if tbl:
            tbl.zone = zone_name
            tbl.shape = shape_val
            tbl.capacity = cap_val
            tbl.is_accessible = access_flag
            tbl.coursing_status = coursing
            tbl.status = status_val
            if not tbl.seats_data:
                tbl.seats_data = [
                    {'seat': s + 1, 'guest_name': f"Guest {s + 1}", 'notes': ''}
                    for s in range(cap_val)
                ]
            tbl.save()
    print("  [OK] Universal Tables 2.0: Zones, shapes, accessible tags & seats updated.")

    # 4. Catering Events
    now = timezone.now()
    events_data = [
        {
            'event_number': 'EVT-892',
            'title': 'Starlight Corporate Gala',
            'client_name': 'Aura Technologies Inc.',
            'client_phone': '+1 (555) 349-2810',
            'client_email': 'events@auratech.io',
            'event_date': now + timedelta(days=2, hours=4),
            'guest_count': 250,
            'venue_name': 'Grand Ballroom B',
            'venue_type': 'ON_SITE',
            'package_name': 'Royal Executive Buffet & Wine Pairing',
            'status': 'CONFIRMED',
            'total_amount': Decimal('12500.00'),
            'deposit_paid': Decimal('8500.00'),
            'balance_due': Decimal('4000.00'),
            'assigned_head_chef': 'Chef Antoine Dubois',
            'staff_assigned_count': 8,
            'menu_summary': 'Truffle filet mignon, saffron lobster risotto, artisanal dessert tower',
            'special_instructions': 'Strict gluten-free station for 15 guests at Table 4.'
        },
        {
            'event_number': 'EVT-894',
            'title': 'Tech Innovators Networking Lunch',
            'client_name': 'Venture Catalyst Group',
            'client_phone': '+1 (555) 782-9014',
            'client_email': 'contact@vcg-ny.com',
            'event_date': now + timedelta(days=5, hours=1),
            'guest_count': 85,
            'venue_name': 'Off-site (Downtown Innovation Hub)',
            'venue_type': 'OFF_SITE_DOWNTOWN',
            'package_name': 'Gourmet Bento Box & Cold Brew Bar',
            'status': 'CONFIRMED',
            'total_amount': Decimal('3400.00'),
            'deposit_paid': Decimal('3400.00'),
            'balance_due': Decimal('0.00'),
            'assigned_head_chef': 'Chef Marco Rossi',
            'staff_assigned_count': 4,
            'menu_summary': 'Artisanal sliders, quinoa bowls, nitro cold brew, matcha financier',
            'special_instructions': 'Delivery van arrives at loading dock by 11:15 AM.'
        },
        {
            'event_number': 'EVT-901',
            'title': "L'Étoile Autumn Wedding Reception",
            'client_name': 'Eleanor & Michael Vance',
            'client_phone': '+1 (555) 629-4411',
            'client_email': 'eleanor.vance@gmail.com',
            'event_date': now + timedelta(days=12, hours=6),
            'guest_count': 180,
            'venue_name': 'Garden Pavilion & Grand Veranda',
            'venue_type': 'ON_SITE',
            'package_name': 'Michelin 5-Course Plated Banquet',
            'status': 'CONFIRMED',
            'total_amount': Decimal('18000.00'),
            'deposit_paid': Decimal('10000.00'),
            'balance_due': Decimal('8000.00'),
            'assigned_head_chef': 'Chef Antoine Dubois',
            'staff_assigned_count': 12,
            'menu_summary': 'Oscietra Caviar, Wagyu Wellington, Wild Mushroom Velouté, Gold leaf Opera cake',
            'special_instructions': 'Champagne toast at 19:45 promptly.'
        }
    ]

    for ev_data in events_data:
        ev, _ = CateringEvent.objects.update_or_create(event_number=ev_data['event_number'], defaults=ev_data)
        print(f"  [OK] Catering Event: {ev.event_number} - {ev.title} (${ev.total_amount:,.2f})")

    # 5. Menu Pricing Rules
    items = MenuItem.objects.all()[:6]
    channels = [
        ('DINE_IN', Decimal('1.00'), Decimal('0.90')),
        ('TAKEAWAY', Decimal('1.00'), None),
        ('DELIVERY', Decimal('1.15'), None),
        ('KIOSK', Decimal('0.95'), Decimal('0.85')),
        ('ONLINE', Decimal('1.10'), Decimal('0.95'))
    ]

    for item in items:
        for ch, mult, hh_mult in channels:
            adj_price = (item.price * mult).quantize(Decimal('0.01'))
            hh_price = (item.price * hh_mult).quantize(Decimal('0.01')) if hh_mult else None
            MenuPricingRule.objects.update_or_create(
                item=item,
                channel=ch,
                defaults={
                    'base_price': item.price,
                    'adjusted_price': adj_price,
                    'happy_hour_price': hh_price,
                    'is_happy_hour_active': (hh_price is not None),
                    'margin_percentage': Decimal('68.00'),
                    'is_active': True
                }
            )
    print(f"  [OK] Menu Pricing Rules seeded across {len(items)} items for all channels.")

    print("\n[SUCCESS] Universal Restaurant Operating System (UROS) Seed Complete!\n")

if __name__ == '__main__':
    seed_universal_platform()
