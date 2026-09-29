"""
RestaurantOS — Seed Data Command
Seeds roles, permissions, default owner user, and sample restaurant.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import Permission, Role, User
from apps.restaurant.models import Restaurant, Branch


# All system permissions organized by module
PERMISSIONS = {
    'dashboard': [
        ('dashboard.view', 'View Dashboard'),
        ('dashboard.limited', 'View Limited Dashboard'),
    ],
    'reports': [
        ('reports.view', 'View Reports'),
        ('reports.export', 'Export Reports'),
    ],
    'sales': [
        ('sales.view', 'View Sales'),
    ],
    'orders': [
        ('orders.view', 'View Orders'),
        ('orders.create', 'Create Orders'),
        ('orders.edit', 'Edit Orders'),
        ('orders.cancel', 'Cancel Orders'),
        ('orders.refund', 'Issue Refunds'),
        ('orders.print', 'Print Orders'),
        ('orders.payment', 'Process Payments'),
        ('orders.split_payment', 'Split Payments'),
        ('orders.reprint_receipt', 'Reprint Receipts'),
        ('orders.view.own_tables', 'View Own Table Orders'),
        ('orders.edit.own_orders', 'Edit Own Orders'),
        ('orders.edit.before_payment', 'Edit Before Payment'),
        ('orders.send_to_kitchen', 'Send to Kitchen'),
        ('orders.add_items', 'Add Items to Order'),
        ('orders.remove_items.before_kitchen', 'Remove Items Before Kitchen'),
        ('orders.notes', 'Add Order Notes'),
    ],
    'tables': [
        ('tables.view', 'View Tables'),
        ('tables.create', 'Create Tables'),
        ('tables.edit', 'Edit Tables'),
        ('tables.delete', 'Delete Tables'),
        ('tables.merge', 'Merge Tables'),
        ('tables.split', 'Split Tables'),
        ('tables.open', 'Open Table'),
        ('tables.assign', 'Assign Table'),
        ('tables.move', 'Move Table'),
    ],
    'menu': [
        ('menu.view', 'View Menu'),
        ('menu.create', 'Create Menu Items'),
        ('menu.edit', 'Edit Menu Items'),
        ('menu.delete', 'Delete Menu Items'),
    ],
    'categories': [
        ('categories.manage', 'Manage Categories'),
    ],
    'modifiers': [
        ('modifiers.manage', 'Manage Modifiers'),
    ],
    'users': [
        ('users.view', 'View Users'),
        ('users.create', 'Create Users'),
        ('users.edit', 'Edit Users'),
        ('users.disable', 'Disable Users'),
    ],
    'roles': [
        ('roles.view', 'View Roles'),
        ('roles.manage', 'Manage Roles'),
    ],
    'inventory': [
        ('inventory.view', 'View Inventory'),
        ('inventory.manage', 'Manage Inventory'),
    ],
    'purchases': [
        ('purchases.manage', 'Manage Purchases'),
    ],
    'suppliers': [
        ('suppliers.manage', 'Manage Suppliers'),
    ],
    'expenses': [
        ('expenses.manage', 'Manage Expenses'),
    ],
    'customers': [
        ('customers.view', 'View Customers'),
        ('customers.create', 'Create Customers'),
        ('customers.manage', 'Manage Customers'),
    ],
    'discounts': [
        ('discounts.use', 'Use Discounts'),
        ('discounts.manage', 'Manage Discounts'),
    ],
    'promotions': [
        ('promotions.manage', 'Manage Promotions'),
    ],
    'shifts': [
        ('shift.manage', 'Manage Shifts'),
    ],
    'cash_drawer': [
        ('cash_drawer.open', 'Open Cash Drawer'),
        ('cash_drawer.close', 'Close Cash Drawer'),
        ('cash_drawer.manage', 'Manage Cash Drawer'),
    ],
    'kitchen': [
        ('kitchen.view', 'View Kitchen'),
        ('kitchen.accept', 'Accept Kitchen Order'),
        ('kitchen.start', 'Start Preparation'),
        ('kitchen.ready', 'Mark Ready'),
        ('kitchen.reject', 'Reject Kitchen Order'),
        ('kitchen.notes', 'Kitchen Notes'),
    ],
    'delivery': [
        ('delivery.view', 'View Deliveries'),
        ('delivery.view_assigned', 'View Assigned Deliveries'),
        ('delivery.update_status', 'Update Delivery Status'),
        ('delivery.customer_view', 'View Delivery Customer'),
        ('delivery.order_view', 'View Delivery Order'),
    ],
    'settings': [
        ('settings.restaurant', 'Restaurant Settings'),
    ],
    'audit': [
        ('audit_logs.view', 'View Audit Logs'),
    ],
}

# Role permission mappings
ROLE_PERMISSIONS = {
    'Manager': [
        'dashboard.view', 'reports.view', 'reports.export', 'sales.view',
        'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.refund',
        'orders.print', 'orders.payment', 'orders.split_payment', 'orders.reprint_receipt',
        'orders.send_to_kitchen', 'orders.add_items', 'orders.notes',
        'tables.view', 'tables.create', 'tables.edit', 'tables.delete',
        'tables.merge', 'tables.split', 'tables.open', 'tables.assign', 'tables.move',
        'menu.view', 'menu.create', 'menu.edit', 'menu.delete',
        'categories.manage', 'modifiers.manage',
        'users.view', 'users.create', 'users.edit', 'users.disable',
        'roles.view',
        'inventory.view', 'inventory.manage',
        'purchases.manage', 'suppliers.manage', 'expenses.manage',
        'customers.view', 'customers.create', 'customers.manage',
        'discounts.use', 'discounts.manage', 'promotions.manage',
        'shift.manage', 'cash_drawer.manage', 'cash_drawer.open', 'cash_drawer.close',
        'kitchen.view', 'delivery.view',
        'settings.restaurant', 'audit_logs.view',
    ],
    'Cashier': [
        'dashboard.limited',
        'orders.view', 'orders.create', 'orders.edit.before_payment',
        'orders.print', 'orders.payment', 'orders.split_payment', 'orders.reprint_receipt',
        'tables.view',
        'customers.view', 'customers.create',
        'discounts.use',
        'cash_drawer.open', 'cash_drawer.close',
    ],
    'Captain': [
        'tables.view', 'tables.open', 'tables.assign', 'tables.move',
        'tables.merge', 'tables.split',
        'orders.create', 'orders.view.own_tables', 'orders.edit.own_orders',
        'orders.send_to_kitchen', 'orders.add_items',
        'orders.remove_items.before_kitchen', 'orders.notes',
        'customers.view',
    ],
    'Kitchen': [
        'kitchen.view', 'kitchen.accept', 'kitchen.start',
        'kitchen.ready', 'kitchen.reject', 'kitchen.notes',
    ],
    'Delivery': [
        'delivery.view_assigned', 'delivery.update_status',
        'delivery.customer_view', 'delivery.order_view',
    ],
}


class Command(BaseCommand):
    help = 'Seed database with roles, permissions, default user, and sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding permissions...')
        self._seed_permissions()

        self.stdout.write('Seeding roles...')
        self._seed_roles()

        self.stdout.write('Seeding default owner...')
        self._seed_default_user()

        self.stdout.write('Seeding sample restaurant...')
        self._seed_restaurant()

        self.stdout.write(self.style.SUCCESS('[OK] Seed data created successfully!'))

    def _seed_permissions(self):
        for module, perms in PERMISSIONS.items():
            for codename, name in perms:
                Permission.objects.get_or_create(
                    codename=codename,
                    defaults={'name': name, 'module': module},
                )
        self.stdout.write(f'  - {Permission.objects.count()} permissions')

    def _seed_roles(self):
        # Create Owner role (no explicit permissions -- has_perm checks role name)
        owner_role, _ = Role.objects.get_or_create(
            name='Owner',
            defaults={
                'description': 'Business owner with complete system access',
                'is_system': True,
            },
        )

        # Create other system roles with their permissions
        for role_name, perm_codenames in ROLE_PERMISSIONS.items():
            role, _ = Role.objects.get_or_create(
                name=role_name,
                defaults={
                    'description': f'{role_name} role with predefined permissions',
                    'is_system': True,
                },
            )
            permissions = Permission.objects.filter(codename__in=perm_codenames)
            role.permissions.set(permissions)

        self.stdout.write(f'  - {Role.objects.count()} roles')

    def _seed_default_user(self):
        owner_role = Role.objects.get(name='Owner')
        user, created = User.objects.get_or_create(
            email='owner@restaurantos.com',
            defaults={
                'full_name': 'Restaurant Owner',
                'role': owner_role,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            user.set_password('owner123456')
            user.save()
            self.stdout.write('  - Default owner: owner@restaurantos.com / owner123456')
        else:
            self.stdout.write('  - Owner user already exists')

    def _seed_restaurant(self):
        restaurant, _ = Restaurant.objects.get_or_create(
            name='RestaurantOS Demo',
            defaults={
                'phone': '+1234567890',
                'email': 'info@restaurantos.com',
                'address': '123 Main Street, City',
                'currency': 'USD',
                'timezone': 'UTC',
                'tax_number': 'TAX-001',
                'receipt_footer': 'Thank you for dining with us!',
            },
        )

        Branch.objects.get_or_create(
            restaurant=restaurant,
            name='Main Branch',
            defaults={
                'address': '123 Main Street, City',
                'phone': '+1234567890',
                'is_active': True,
            },
        )
        self.stdout.write('  - Restaurant and branch created')
