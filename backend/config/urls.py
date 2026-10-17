"""
Root URL Configuration for UNBUmi Detector API (v1).
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection

class HealthCheckView(APIView):
    permission_classes = []

    def get(self, request):
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_ok = False

        return Response({
            'status': 'healthy' if db_ok else 'degraded',
            'database': 'connected' if db_ok else 'disconnected',
            'version': '1.0.0',
            'service': 'UNBUmi Detector API',
            'track': 'P3 — Catch Fraud & Double-Selling',
            'demo_mode': settings.DEMO_MODE
        })

api_v1_patterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.cases.urls')),
    path('', include('apps.documents.urls')),
    path('', include('apps.rules.urls')),
    path('health/', HealthCheckView.as_view(), name='api-health'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
