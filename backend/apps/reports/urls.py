from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views import ReportsViewSet

router = DefaultRouter()
router.register(r'analytics', ReportsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
