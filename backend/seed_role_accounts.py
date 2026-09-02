import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurantos_backend.settings')
django.setup()

from api.models import StaffMember, StaffRole

def seed_role_accounts():
    print("[+] Seeding Role-Isolated Staff Accounts for RestaurantOS...")
    
    accounts = [
        {
            'name': 'Marcus Vance',
            'role': StaffRole.ADMIN,
            'pin_code': '9999',
            'email': 'marcus.vance@noirhospitality.com',
            'phone': '+1 (555) 019-9999',
            'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            'permissions': {'all': True, 'financials': True, 'business_settings': True, 'portfolio_bi': True}
        },
        {
            'name': 'Elena Rostova',
            'role': StaffRole.MANAGER,
            'pin_code': '1234',
            'email': 'elena.rostova@noirhospitality.com',
            'phone': '+1 (555) 012-1234',
            'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            'permissions': {'tables': True, 'kitchen': True, 'approvals': True, 'inventory': True, 'staff': True}
        },
        {
            'name': 'Sarah Connor',
            'role': StaffRole.CASHIER,
            'pin_code': '2222',
            'email': 'sarah.connor@noirhospitality.com',
            'phone': '+1 (555) 013-2222',
            'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
            'permissions': {'pos': True, 'shift': True, 'payments': True, 'receipts': True}
        },
        {
            'name': 'Antoine Dubois',
            'role': StaffRole.WAITER,
            'pin_code': '3333',
            'email': 'antoine.dubois@noirhospitality.com',
            'phone': '+1 (555) 014-3333',
            'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            'permissions': {'tables': True, 'coursing': True, 'orders': True, 'bill_request': True}
        },
        {
            'name': 'Marco Rossi',
            'role': StaffRole.CHEF,
            'pin_code': '4444',
            'email': 'marco.rossi@noirhospitality.com',
            'phone': '+1 (555) 015-4444',
            'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            'permissions': {'kds': True, 'stations': True, 'expo': True, 'waste': True}
        },
        {
            'name': 'Ahmed Hassan',
            'role': StaffRole.DRIVER,
            'pin_code': '5555',
            'email': 'ahmed.hassan@noirhospitality.com',
            'phone': '+1 (555) 016-5555',
            'avatar_url': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
            'permissions': {'deliveries': True, 'navigation': True, 'cod_collection': True}
        },
        {
            'name': 'Karim Nabil',
            'role': StaffRole.PACKING,
            'pin_code': '6666',
            'email': 'karim.nabil@noirhospitality.com',
            'phone': '+1 (555) 017-6666',
            'avatar_url': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
            'permissions': {'expo': True, 'assembly': True, 'dispatch': True}
        },
        {
            'name': 'Tarek Zaki',
            'role': StaffRole.INVENTORY,
            'pin_code': '7777',
            'email': 'tarek.zaki@noirhospitality.com',
            'phone': '+1 (555) 018-7777',
            'avatar_url': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
            'permissions': {'stock': True, 'purchase_orders': True, 'suppliers': True, 'waste': True}
        },
        {
            'name': 'Nour Ali',
            'role': StaffRole.CALL_CENTER,
            'pin_code': '8888',
            'email': 'nour.ali@noirhospitality.com',
            'phone': '+1 (555) 019-8888',
            'avatar_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            'permissions': {'caller_id': True, 'phone_pos': True, 'repeat_order': True, 'customers': True}
        }
    ]

    for acc in accounts:
        staff, created = StaffMember.objects.update_or_create(
            role=acc['role'],
            defaults={
                'name': acc['name'],
                'pin_code': acc['pin_code'],
                'email': acc['email'],
                'phone': acc['phone'],
                'avatar_url': acc['avatar_url'],
                'permissions': acc['permissions'],
                'is_active': True
            }
        )
        status_str = "Created" if created else "Updated"
        print(f"  [OK] {status_str} {staff.name} as {staff.role} (PIN: {staff.pin_code})")

    print("[SUCCESS] All 9 Role-Isolated Staff Accounts Ready!")

if __name__ == '__main__':
    seed_role_accounts()
