from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.menu.views import CategoryViewSet, MenuItemViewSet, ModifierGroupViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='menu-category')
router.register(r'items', MenuItemViewSet, basename='menu-item')
router.register(r'modifiers', ModifierGroupViewSet, basename='menu-modifier')

urlpatterns = [
    path('', include(router.urls)),
]
