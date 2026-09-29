from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.payments.views import PaymentViewSet, CashDrawerShiftViewSet

router = DefaultRouter()
router.register(r'transactions', PaymentViewSet, basename='payment')
router.register(r'shifts', CashDrawerShiftViewSet, basename='cash-drawer-shift')

urlpatterns = [
    path('', include(router.urls)),
]
