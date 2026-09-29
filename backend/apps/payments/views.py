import uuid
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.payments.models import CashDrawerShift, Payment
from apps.payments.serializers import (
    PaymentSerializer,
    CashDrawerShiftSerializer,
    ProcessPaymentSerializer,
    OpenShiftSerializer,
    CloseShiftSerializer,
)
from apps.orders.models import Order
from apps.restaurant.models import Restaurant, Branch


class CashDrawerShiftViewSet(viewsets.ModelViewSet):
    queryset = CashDrawerShift.objects.filter(is_deleted=False).select_related('user', 'branch')
    serializer_class = CashDrawerShiftSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return qs

    @action(detail=False, methods=['get'], url_path='current')
    def current(self, request):
        """Get the currently open shift for the user, or the most recent open shift in their branch."""
        open_shift = CashDrawerShift.objects.filter(
            is_deleted=False,
            status=CashDrawerShift.ShiftStatus.OPEN,
            user=request.user
        ).first()

        if not open_shift:
            # Fallback to any open shift in the branch
            branch_id = request.query_params.get('branch_id')
            if branch_id:
                open_shift = CashDrawerShift.objects.filter(
                    is_deleted=False,
                    status=CashDrawerShift.ShiftStatus.OPEN,
                    branch_id=branch_id
                ).first()

        if open_shift:
            # Recalculate live totals
            self._update_shift_totals(open_shift)
            return Response({'has_open_shift': True, 'data': CashDrawerShiftSerializer(open_shift).data})

        return Response({'has_open_shift': False, 'data': None})

    @action(detail=False, methods=['post'], url_path='open')
    def open_shift(self, request):
        serializer = OpenShiftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if already open
        existing = CashDrawerShift.objects.filter(
            is_deleted=False,
            user=request.user,
            status=CashDrawerShift.ShiftStatus.OPEN
        ).first()
        if existing:
            return Response(
                {'success': False, 'message': 'You already have an active open shift.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        branch = None
        branch_id = serializer.validated_data.get('branch_id')
        if branch_id:
            branch = Branch.objects.filter(id=branch_id).first()
        if not branch:
            branch = Branch.objects.first()

        shift_number = f"SFT-{timezone.now().strftime('%y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"
        opening_float = serializer.validated_data['opening_float']

        shift = CashDrawerShift.objects.create(
            shift_number=shift_number,
            user=request.user,
            branch=branch,
            opening_float=opening_float,
            expected_cash=opening_float,
            status=CashDrawerShift.ShiftStatus.OPEN,
            notes=serializer.validated_data.get('notes', '')
        )

        return Response({'success': True, 'data': CashDrawerShiftSerializer(shift).data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='close')
    def close_shift(self, request, pk=None):
        shift = self.get_object()
        if shift.status == CashDrawerShift.ShiftStatus.CLOSED:
            return Response(
                {'success': False, 'message': 'This shift is already closed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CloseShiftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self._update_shift_totals(shift)

        actual_cash = serializer.validated_data['actual_cash']
        shift.actual_cash = actual_cash
        shift.closing_float = actual_cash
        shift.cash_difference = actual_cash - shift.expected_cash
        shift.status = CashDrawerShift.ShiftStatus.CLOSED
        shift.closed_at = timezone.now()
        if serializer.validated_data.get('notes'):
            shift.notes = f"{shift.notes}\n[Close Note]: {serializer.validated_data['notes']}".strip()
        shift.save()

        return Response({'success': True, 'data': CashDrawerShiftSerializer(shift).data})

    def _update_shift_totals(self, shift):
        completed_payments = shift.payments.filter(status=Payment.Status.COMPLETED)
        
        cash_sales = completed_payments.filter(payment_method=Payment.Method.CASH).aggregate(
            total=Sum('amount'))['total'] or Decimal('0.00')
        card_sales = completed_payments.filter(
            payment_method__in=[Payment.Method.CREDIT_CARD, Payment.Method.DEBIT_CARD]
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        wallet_sales = completed_payments.filter(payment_method=Payment.Method.DIGITAL_WALLET).aggregate(
            total=Sum('amount'))['total'] or Decimal('0.00')
        tips = completed_payments.aggregate(total=Sum('tip_amount'))['total'] or Decimal('0.00')

        shift.total_cash_sales = cash_sales
        shift.total_card_sales = card_sales
        shift.total_wallet_sales = wallet_sales
        shift.total_tips = tips
        shift.expected_cash = shift.opening_float + cash_sales
        shift.save()


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(is_deleted=False).select_related('order', 'shift', 'processed_by').order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        order_id = self.request.query_params.get('order_id')
        if order_id:
            qs = qs.filter(order_id=order_id)
        shift_id = self.request.query_params.get('shift_id')
        if shift_id:
            qs = qs.filter(shift_id=shift_id)
        method = self.request.query_params.get('method')
        if method:
            qs = qs.filter(payment_method=method.upper())
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return qs

    @action(detail=False, methods=['post'], url_path='process')
    def process_payment(self, request):
        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        order = Order.objects.filter(id=order_id, is_deleted=False).first()
        if not order:
            return Response({'success': False, 'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'PAID':
            return Response(
                {'success': False, 'message': 'This order has already been fully paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find active shift
        active_shift = CashDrawerShift.objects.filter(
            is_deleted=False,
            user=request.user,
            status=CashDrawerShift.ShiftStatus.OPEN
        ).first()

        amount = serializer.validated_data['amount']
        tip_amount = serializer.validated_data.get('tip_amount', Decimal('0.00'))
        method = serializer.validated_data['payment_method']

        tx_id = f"TXN-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        receipt_no = f"REC-{timezone.now().strftime('%m%d')}-{uuid.uuid4().hex[:4].upper()}"

        payment = Payment.objects.create(
            order=order,
            shift=active_shift,
            payment_method=method,
            amount=amount,
            tip_amount=tip_amount,
            status=Payment.Status.COMPLETED,
            transaction_id=tx_id,
            receipt_number=receipt_no,
            card_last_four=serializer.validated_data.get('card_last_four', ''),
            processed_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )

        # Update order payment status
        total_paid = order.payments.filter(status=Payment.Status.COMPLETED).aggregate(
            paid=Sum('amount')
        )['paid'] or Decimal('0.00')

        if total_paid >= order.total_amount:
            order.payment_status = 'PAID'
            order.status = Order.Status.COMPLETED
            if order.table:
                # Mark table as dirty/vacant after payment
                order.table.status = 'VACANT'
                order.table.current_order_id = None
                order.table.save()
        else:
            order.payment_status = 'PARTIAL'
        order.save()

        # Update shift totals if tied to a shift
        if active_shift:
            if method == Payment.Method.CASH:
                active_shift.total_cash_sales += amount
                active_shift.expected_cash += amount
            elif method in [Payment.Method.CREDIT_CARD, Payment.Method.DEBIT_CARD]:
                active_shift.total_card_sales += amount
            elif method == Payment.Method.DIGITAL_WALLET:
                active_shift.total_wallet_sales += amount
            active_shift.total_tips += tip_amount
            active_shift.save()

        return Response({
            'success': True,
            'message': f'Payment of ${amount} completed successfully.',
            'payment': PaymentSerializer(payment).data,
            'order_payment_status': order.payment_status,
            'total_paid': total_paid,
            'balance_remaining': max(Decimal('0.00'), order.total_amount - total_paid)
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='refund')
    def refund(self, request, pk=None):
        payment = self.get_object()
        if payment.status == Payment.Status.REFUNDED:
            return Response({'success': False, 'message': 'Payment already refunded.'}, status=400)

        payment.status = Payment.Status.REFUNDED
        refund_note = request.data.get('reason', 'Refunded by manager')
        payment.notes = f"{payment.notes}\n[Refund]: {refund_note}".strip()
        payment.save()

        # Recalculate order status
        order = payment.order
        total_paid = order.payments.filter(status=Payment.Status.COMPLETED).aggregate(
            paid=Sum('amount')
        )['paid'] or Decimal('0.00')

        if total_paid <= Decimal('0.00'):
            order.payment_status = 'UNPAID'
        elif total_paid < order.total_amount:
            order.payment_status = 'PARTIAL'
        order.save()

        return Response({'success': True, 'payment': PaymentSerializer(payment).data})

    @action(detail=False, methods=['get'], url_path='receipt')
    def receipt(self, request):
        order_id = request.query_params.get('order_id')
        payment_id = request.query_params.get('payment_id')

        if payment_id:
            payment = Payment.objects.filter(id=payment_id).select_related('order', 'processed_by').first()
            if not payment:
                return Response({'success': False, 'message': 'Payment not found'}, status=404)
            order = payment.order
        elif order_id:
            order = Order.objects.filter(id=order_id).first()
            if not order:
                return Response({'success': False, 'message': 'Order not found'}, status=404)
            payment = order.payments.filter(status=Payment.Status.COMPLETED).first()
        else:
            return Response({'success': False, 'message': 'Provide order_id or payment_id'}, status=400)

        restaurant = Restaurant.objects.first()
        branch = order.branch or Branch.objects.first()

        items = [
            {
                'name': item.menu_item.name if item.menu_item else 'Item',
                'variant': item.variant.name if item.variant else None,
                'quantity': item.quantity,
                'unit_price': str(item.unit_price),
                'total_price': str(item.total_price),
            }
            for item in order.items.all()
        ]

        receipt_data = {
            'restaurant_name': restaurant.name if restaurant else 'RestaurantOS',
            'branch_name': branch.name if branch else 'Main Branch',
            'branch_address': branch.address if branch else 'Downtown Avenue 12',
            'branch_phone': branch.phone if branch else '+1 (555) 019-2831',
            'order_number': order.order_number,
            'table_number': order.table.table_number if order.table else 'Takeout / Direct',
            'server_name': order.server.full_name if order.server else 'Cashier Desk',
            'order_type': order.order_type,
            'subtotal': str(order.subtotal),
            'tax_amount': str(order.tax_amount),
            'discount_amount': str(order.discount_amount),
            'service_charge': str(order.service_charge),
            'total_amount': str(order.total_amount),
            'payments': [
                {
                    'method': p.payment_method,
                    'amount': str(p.amount),
                    'tip': str(p.tip_amount),
                    'receipt_number': p.receipt_number,
                    'transaction_id': p.transaction_id,
                    'card_last_four': p.card_last_four,
                    'date': p.created_at.strftime('%Y-%m-%d %H:%M'),
                }
                for p in order.payments.filter(status=Payment.Status.COMPLETED)
            ],
            'items': items,
            'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }

        return Response(receipt_data)
