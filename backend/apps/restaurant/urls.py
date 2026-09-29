from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, BranchViewSet, SystemSettingViewSet

router = DefaultRouter()
router.register('profile', RestaurantViewSet, basename='restaurant')
router.register('branches', BranchViewSet, basename='branches')
router.register('settings', SystemSettingViewSet, basename='settings')

urlpatterns = router.urls
