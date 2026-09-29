from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncHour
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.menu.models import Category, MenuItem
from apps.accounts.models import User


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_date_range(self, request):
        period = request.query_params.get('period', 'today')
        now = timezone.now()

        if period == 'today':
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
        elif period == 'week':
            start = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
        elif period == 'month':
            start = (now - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
        elif period == 'year':
            start = (now - timedelta(days=365)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
        else: # all
            start = now - timedelta(days=3650)
            end = now

        return start, end

    @action(detail=False, methods=['get'], url_path='sales-summary')
    def sales_summary(self, request):
        start, end = self._get_date_range(request)
        orders = Order.objects.filter(
            is_deleted=False,
            created_at__gte=start,
            created_at__lte=end
        )

        total_orders = orders.count()
        completed_orders = orders.filter(status=Order.Status.COMPLETED).count()

        totals = orders.aggregate(
            gross_revenue=Sum('total_amount'),
            net_sales=Sum('subtotal'),
            taxes=Sum('tax_amount'),
            discounts=Sum('discount_amount'),
            service_charges=Sum('service_charge'),
            avg_check=Avg('total_amount'),
            guests=Sum('guest_count')
        )

        # Payment tips
        payments = Payment.objects.filter(
            is_deleted=False,
            status=Payment.Status.COMPLETED,
            created_at__gte=start,
            created_at__lte=end
        )
        total_tips = payments.aggregate(tips=Sum('tip_amount'))['tips'] or Decimal('0.00')

        # Order types
        dine_in = orders.filter(order_type=Order.OrderType.DINE_IN).count()
        takeout = orders.filter(order_type=Order.OrderType.TAKEOUT).count()
        delivery = orders.filter(order_type=Order.OrderType.DELIVERY).count()
        qr_orders = orders.filter(order_type=Order.OrderType.QR_ORDER).count()

        return Response({
            'period': request.query_params.get('period', 'today'),
            'total_revenue': str(totals['gross_revenue'] or Decimal('0.00')),
            'net_sales': str(totals['net_sales'] or Decimal('0.00')),
            'taxes': str(totals['taxes'] or Decimal('0.00')),
            'discounts': str(totals['discounts'] or Decimal('0.00')),
            'service_charges': str(totals['service_charges'] or Decimal('0.00')),
            'total_tips': str(total_tips),
            'avg_check': str(round(totals['avg_check'] or Decimal('0.00'), 2)),
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'total_guests': totals['guests'] or 0,
            'order_type_breakdown': {
                'dine_in': dine_in,
                'takeout': takeout,
                'delivery': delivery,
                'qr_order': qr_orders
            }
        })

    @action(detail=False, methods=['get'], url_path='hourly-sales')
    def hourly_sales(self, request):
        start, end = self._get_date_range(request)
        orders = Order.objects.filter(
            is_deleted=False,
            created_at__gte=start,
            created_at__lte=end
        )

        hourly_data = {f"{h:02d}:00": {'orders': 0, 'sales': Decimal('0.00')} for h in range(8, 24)}
        for o in orders:
            hour_str = f"{o.created_at.hour:02d}:00"
            if hour_str in hourly_data:
                hourly_data[hour_str]['orders'] += 1
                hourly_data[hour_str]['sales'] += o.total_amount
            else:
                hourly_data[hour_str] = {'orders': 1, 'sales': o.total_amount}

        formatted = [
            {'hour': h, 'orders': data['orders'], 'sales': str(data['sales'])}
            for h, data in sorted(hourly_data.items())
        ]
        return Response(formatted)

    @action(detail=False, methods=['get'], url_path='top-items')
    def top_items(self, request):
        start, end = self._get_date_range(request)
        order_items = OrderItem.objects.filter(
            order__is_deleted=False,
            order__created_at__gte=start,
            order__created_at__lte=end
        ).values('menu_item__name', 'menu_item__category__name').annotate(
            total_quantity=Sum('quantity'),
            total_sales=Sum('total_price')
        ).order_by('-total_sales')[:10]

        data = [
            {
                'item_name': row['menu_item__name'] or 'Special Item',
                'category_name': row['menu_item__category__name'] or 'Main Dishes',
                'quantity': row['total_quantity'],
                'sales': str(row['total_sales'])
            }
            for row in order_items
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='category-breakdown')
    def category_breakdown(self, request):
        start, end = self._get_date_range(request)
        category_stats = OrderItem.objects.filter(
            order__is_deleted=False,
            order__created_at__gte=start,
            order__created_at__lte=end
        ).values('menu_item__category__name').annotate(
            total_quantity=Sum('quantity'),
            total_sales=Sum('total_price')
        ).order_by('-total_sales')

        data = [
            {
                'category': row['menu_item__category__name'] or 'Uncategorized',
                'quantity': row['total_quantity'],
                'sales': str(row['total_sales'])
            }
            for row in category_stats
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='payment-methods')
    def payment_methods(self, request):
        start, end = self._get_date_range(request)
        payments = Payment.objects.filter(
            is_deleted=False,
            status=Payment.Status.COMPLETED,
            created_at__gte=start,
            created_at__lte=end
        ).values('payment_method').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')

        data = [
            {
                'method': row['payment_method'],
                'count': row['count'],
                'amount': str(row['total_amount'])
            }
            for row in payments
        ]
        return Response(data)
