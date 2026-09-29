from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory.views import SupplierViewSet, InventoryItemViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'items', InventoryItemViewSet, basename='inventory-item')

urlpatterns = [
    path('', include(router.urls)),
]
