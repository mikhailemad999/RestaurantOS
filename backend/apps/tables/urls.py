from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.tables.views import FloorViewSet, TableViewSet

router = DefaultRouter()
router.register(r'floors', FloorViewSet, basename='floor')
router.register(r'tables', TableViewSet, basename='table')

urlpatterns = [
    path('', include(router.urls)),
]
