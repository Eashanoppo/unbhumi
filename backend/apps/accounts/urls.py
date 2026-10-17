from django.urls import path
from .views import DemoLoginView, DemoLogoutView, MeView

urlpatterns = [
    path('auth/demo-login/', DemoLoginView.as_view(), name='demo-login'),
    path('auth/logout/', DemoLogoutView.as_view(), name='demo-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
]
