from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.promotions.views import PromotionViewSet

router = DefaultRouter()
router.register(r'coupons', PromotionViewSet, basename='promotion')

urlpatterns = [
    path('', include(router.urls)),
]
