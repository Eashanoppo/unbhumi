from django.urls import path
from .views import RulesCatalogueView, AlertsQueueView, AlertDispositionView

urlpatterns = [
    path('rules/', RulesCatalogueView.as_view(), name='rules-catalogue'),
    path('alerts/', AlertsQueueView.as_view(), name='alerts-queue'),
    path('alerts/<int:pk>/disposition/', AlertDispositionView.as_view(), name='alert-disposition'),
]
