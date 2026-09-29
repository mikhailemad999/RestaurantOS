from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import (
    LoginView, PinLoginView, LogoutView,
    ChangePasswordView, ForgotPasswordView, MeView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('pin-login/', PinLoginView.as_view(), name='auth-pin-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('me/', MeView.as_view(), name='auth-me'),
]
