from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.promotions.models import Promotion
from apps.promotions.serializers import PromotionSerializer, ValidatePromoSerializer


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_deleted=False).select_related('branch').order_by('-created_at')
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        active = self.request.query_params.get('active')
        if active is not None:
            is_active_val = active.lower() in ['true', '1']
            qs = qs.filter(is_active=is_active_val)
        return qs

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_promo(self, request):
        serializer = ValidatePromoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].strip().upper()
        order_amount = serializer.validated_data['order_amount']
        order_type = serializer.validated_data.get('order_type', 'ALL')

        promo = Promotion.objects.filter(code__iexact=code, is_deleted=False).first()
        if not promo:
            return Response({
                'valid': False,
                'message': 'Coupon code not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        if not promo.is_active:
            return Response({
                'valid': False,
                'message': 'This promotion is currently inactive.'
            }, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        if promo.start_date and promo.start_date > now:
            return Response({
                'valid': False,
                'message': f'This promotion starts on {promo.start_date.strftime("%Y-%m-%d")}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if promo.end_date and promo.end_date < now:
            return Response({
                'valid': False,
                'message': 'This coupon has expired.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if promo.times_used >= promo.usage_limit:
            return Response({
                'valid': False,
                'message': 'Coupon redemption limit has been reached.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if promo.applicable_order_types != 'ALL' and promo.applicable_order_types != order_type:
            return Response({
                'valid': False,
                'message': f'Coupon only valid for {promo.get_applicable_order_types_display()} orders.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if order_amount < promo.min_order_amount:
            return Response({
                'valid': False,
                'message': f'Minimum order amount of ${promo.min_order_amount} required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = promo.calculate_discount(order_amount)
        new_total = max(Decimal('0.00'), order_amount - discount)

        return Response({
            'valid': True,
            'code': promo.code,
            'name': promo.name,
            'discount_type': promo.discount_type,
            'discount_value': str(promo.discount_value),
            'discount_amount': str(discount),
            'final_amount': str(new_total),
            'message': f'Promo applied: saved ${discount}!'
        })

    @action(detail=True, methods=['post'], url_path='redeem')
    def redeem(self, request, pk=None):
        promo = self.get_object()
        promo.times_used += 1
        promo.save()
        return Response({'success': True, 'times_used': promo.times_used})
