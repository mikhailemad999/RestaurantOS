from django.core.management.base import BaseCommand
from apps.restaurant.models import Branch
from apps.accounts.models import User
from apps.orders.models import Order
from apps.kitchen.models import KitchenStation, KitchenTicket
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Seeds kitchen stations, tickets and notifications'

    def handle(self, *args, **options):
        self.stdout.write('Seeding kitchen stations & notifications...')
        branch = Branch.objects.first()
        user = User.objects.filter(email='owner@restaurantos.com').first() or User.objects.first()

        stations_data = [
            ('Grill & Saute', '#EF4444', 1),
            ('Pizza & Woodfire Oven', '#F97316', 2),
            ('Salad & Cold Prep', '#10B981', 3),
            ('Beverages & Bar', '#3B82F6', 4),
            ('Expo & Dispatch', '#8B5CF6', 5),
        ]

        created_stations = []
        for name, color, order_num in stations_data:
            st, _ = KitchenStation.objects.get_or_create(
                name=name,
                branch=branch,
                defaults={
                    'display_color': color,
                    'display_order': order_num,
                    'is_active': True
                }
            )
            created_stations.append(st)

        # Seed tickets for active orders
        orders = Order.objects.filter(is_deleted=False)[:5]
        for idx, order in enumerate(orders):
            station = created_stations[idx % len(created_stations)]
            ticket_no = f"KDS-{order.order_number[-4:]}-{idx+1}"
            KitchenTicket.objects.get_or_create(
                ticket_number=ticket_no,
                defaults={
                    'order': order,
                    'station': station,
                    'status': KitchenTicket.Status.IN_PREP if idx % 2 == 0 else KitchenTicket.Status.READY,
                    'elapsed_minutes': 8 + (idx * 3),
                    'notes': 'Allergy alert: No dairy' if idx == 1 else ''
                }
            )

        # Seed notifications
        notifs_data = [
            (Notification.NotificationType.ORDER_CREATED, 'New Order #ORD-1429 Received', 'Table T-02 placed an order for Ribeye & Salmon.', '/orders'),
            (Notification.NotificationType.ORDER_READY, 'Kitchen Ticket Ready: Table T-01', 'Chef marked order ready on Pizza & Oven station.', '/kitchen'),
            (Notification.NotificationType.LOW_STOCK, 'Low Inventory Alert: Truffle Oil', 'Current stock is 2 bottles, below reorder point of 5.', '/inventory'),
            (Notification.NotificationType.SHIFT_ALERT, 'Register Shift Drawer Open', 'Cashier Alex opened drawer #SFT-260929 with $300.00 float.', '/payments'),
            (Notification.NotificationType.PAYMENT_RECEIVED, 'Settled Payment: $142.90', 'Order settled via Visa ending in 4242 with $15.00 tip.', '/payments'),
        ]

        for ntype, title, msg, link in notifs_data:
            Notification.objects.get_or_create(
                title=title,
                defaults={
                    'recipient': user,
                    'notification_type': ntype,
                    'message': msg,
                    'is_read': False,
                    'link_url': link
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Kitchen and Notifications!'))
