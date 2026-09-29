import uuid
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.restaurant.models import Branch
from apps.orders.models import Order
from apps.payments.models import CashDrawerShift, Payment
from apps.promotions.models import Promotion
from apps.audit.models import AuditLog


class Command(BaseCommand):
    help = 'Seeds sample data for Payments, Promotions, Reports, and Audit modules'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Payments, Promotions, and Audit data...')
        
        user = User.objects.filter(email='owner@restaurantos.com').first() or User.objects.first()
        branch = Branch.objects.first()

        # 1. Seed Promotions
        promos_data = [
            {
                'name': 'Happy Hour Sunset Special',
                'code': 'HAPPY20',
                'description': '20% off all dine-in food items between 4pm-7pm',
                'discount_type': Promotion.DiscountType.PERCENTAGE,
                'discount_value': Decimal('20.00'),
                'min_order_amount': Decimal('30.00'),
                'max_discount_amount': Decimal('40.00'),
                'is_active': True,
                'usage_limit': 500,
                'times_used': 34,
                'applicable_order_types': Promotion.OrderTypeTarget.ALL
            },
            {
                'name': 'Welcome New Guest Voucher',
                'code': 'WELCOME10',
                'description': '$10 off your first order over $50',
                'discount_type': Promotion.DiscountType.FIXED_AMOUNT,
                'discount_value': Decimal('10.00'),
                'min_order_amount': Decimal('50.00'),
                'max_discount_amount': Decimal('10.00'),
                'is_active': True,
                'usage_limit': 200,
                'times_used': 89,
                'applicable_order_types': Promotion.OrderTypeTarget.ALL
            },
            {
                'name': 'Weekend VIP Pizza BOGO',
                'code': 'PIZZABOGO',
                'description': 'Buy one gourmet pizza get 50% discount on second',
                'discount_type': Promotion.DiscountType.BOGO,
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('40.00'),
                'max_discount_amount': Decimal('25.00'),
                'is_active': True,
                'usage_limit': 150,
                'times_used': 42,
                'applicable_order_types': Promotion.OrderTypeTarget.DINE_IN
            },
            {
                'name': 'Chef Table Masterclass Promo',
                'code': 'CHEF50',
                'description': 'Special 50% discount code for VIP tasting events',
                'discount_type': Promotion.DiscountType.PERCENTAGE,
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('100.00'),
                'max_discount_amount': Decimal('150.00'),
                'is_active': False,
                'usage_limit': 50,
                'times_used': 50,
                'applicable_order_types': Promotion.OrderTypeTarget.ALL
            }
        ]

        for p_data in promos_data:
            Promotion.objects.update_or_create(
                code=p_data['code'],
                defaults={**p_data, 'branch': branch}
            )
        self.stdout.write(self.style.SUCCESS('Successfully seeded Promotions!'))

        # 2. Seed Shifts
        # Past closed shift
        yesterday = timezone.now() - timedelta(days=1)
        shift_closed, _ = CashDrawerShift.objects.update_or_create(
            shift_number='SFT-2609280800-A01',
            defaults={
                'user': user,
                'branch': branch,
                'opening_float': Decimal('250.00'),
                'closing_float': Decimal('1420.00'),
                'expected_cash': Decimal('1415.00'),
                'actual_cash': Decimal('1420.00'),
                'cash_difference': Decimal('5.00'),
                'total_cash_sales': Decimal('1165.00'),
                'total_card_sales': Decimal('2840.50'),
                'total_wallet_sales': Decimal('620.00'),
                'total_tips': Decimal('412.00'),
                'status': CashDrawerShift.ShiftStatus.CLOSED,
                'opened_at': yesterday.replace(hour=8, minute=0),
                'closed_at': yesterday.replace(hour=23, minute=30),
                'notes': 'Normal dinner rush. Slight $5 overage in register float.'
            }
        )

        # Current open shift
        shift_open, _ = CashDrawerShift.objects.update_or_create(
            shift_number='SFT-2609290800-B02',
            defaults={
                'user': user,
                'branch': branch,
                'opening_float': Decimal('300.00'),
                'expected_cash': Decimal('845.00'),
                'total_cash_sales': Decimal('545.00'),
                'total_card_sales': Decimal('1480.00'),
                'total_wallet_sales': Decimal('320.00'),
                'total_tips': Decimal('184.50'),
                'status': CashDrawerShift.ShiftStatus.OPEN,
                'opened_at': timezone.now().replace(hour=8, minute=30),
                'notes': 'Morning register opened with clean float.'
            }
        )
        self.stdout.write(self.style.SUCCESS('Successfully seeded Shifts!'))

        # 3. Seed Payments for existing orders
        orders = Order.objects.filter(is_deleted=False)[:8]
        methods = [
            (Payment.Method.CREDIT_CARD, '4242'),
            (Payment.Method.CASH, ''),
            (Payment.Method.DIGITAL_WALLET, '9812'),
            (Payment.Method.DEBIT_CARD, '1122'),
            (Payment.Method.CREDIT_CARD, '8834'),
        ]

        for idx, order in enumerate(orders):
            method, card = methods[idx % len(methods)]
            amount = order.total_amount if order.total_amount > Decimal('0.00') else Decimal('58.50')
            tip = Decimal('5.00') if method != Payment.Method.CASH else Decimal('0.00')
            tx_id = f"TXN-260929-{uuid.uuid4().hex[:6].upper()}"
            rec_no = f"REC-2609-{1001 + idx}"

            Payment.objects.get_or_create(
                order=order,
                defaults={
                    'shift': shift_open if idx % 2 == 0 else shift_closed,
                    'payment_method': method,
                    'amount': amount,
                    'tip_amount': tip,
                    'status': Payment.Status.COMPLETED,
                    'transaction_id': tx_id,
                    'receipt_number': rec_no,
                    'card_last_four': card,
                    'processed_by': user,
                    'notes': f'Settled via POS station terminal #{1 + (idx % 2)}'
                }
            )
            order.payment_status = 'PAID'
            order.status = Order.Status.COMPLETED
            order.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded Payments!'))

        # 4. Seed Audit Logs
        audit_events = [
            (AuditLog.ActionType.LOGIN, 'ACCOUNTS', 'User logged into POS Terminal with PIN auth', '192.168.1.104'),
            (AuditLog.ActionType.SHIFT_OPEN, 'PAYMENTS', 'Register shift #SFT-2609290800-B02 opened with $300.00 float', '192.168.1.101'),
            (AuditLog.ActionType.ORDER_CREATE, 'ORDERS', 'Order ORD-1429-A9B1 created for Table T-02 (Elena R.)', '192.168.1.102'),
            (AuditLog.ActionType.PAYMENT_PROCESSED, 'PAYMENTS', 'Payment of $142.90 processed via Credit Card (Visa *4242)', '192.168.1.101'),
            (AuditLog.ActionType.DISCOUNT_APPLIED, 'PROMOTIONS', 'Coupon code HAPPY20 applied: -$28.58 discount', '192.168.1.102'),
            (AuditLog.ActionType.ORDER_STATUS, 'KITCHEN', 'Order ORD-1429-A9B1 dispatched to Kitchen line - Prep started', '192.168.1.110'),
            (AuditLog.ActionType.PRICE_OVERRIDE, 'ORDERS', 'Manager override approved for order item customization (Alex V.)', '192.168.1.101'),
            (AuditLog.ActionType.ROLE_MODIFIED, 'ROLES', 'Staff role permissions updated: Shift Supervisor granted cash_drawer.close', '192.168.1.100'),
            (AuditLog.ActionType.SYSTEM_CONFIG, 'SETTINGS', 'Restaurant operational tax rate verified at 8.25%', '192.168.1.100'),
            (AuditLog.ActionType.PAYMENT_REFUND, 'PAYMENTS', 'Authorized refund of $24.00 for cancelled beverage order on Table T-05', '192.168.1.101'),
        ]

        for act, mod, desc, ip in audit_events:
            AuditLog.objects.get_or_create(
                action=act,
                description=desc,
                defaults={
                    'user': user,
                    'module': mod,
                    'ip_address': ip,
                    'metadata': {'source': 'pos_app', 'branch_id': str(branch.id) if branch else None}
                }
            )
        self.stdout.write(self.style.SUCCESS('Successfully seeded Audit Logs!'))
