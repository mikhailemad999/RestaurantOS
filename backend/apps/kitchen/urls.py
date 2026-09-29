from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.kitchen.views import KitchenStationViewSet, KitchenTicketViewSet

router = DefaultRouter()
router.register(r'stations', KitchenStationViewSet, basename='kitchen-station')
router.register(r'tickets', KitchenTicketViewSet, basename='kitchen-ticket')

urlpatterns = [
    path('', include(router.urls)),
]
