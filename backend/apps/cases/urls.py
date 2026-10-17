from django.urls import path
from .views import (
    DashboardSummaryView, CaseListView, CaseDetailView,
    CaseRunChecksView, CaseGraphView, CaseGraphQueryView, CaseReportView, SeedDemoView
)

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('cases/', CaseListView.as_view(), name='case-list'),
    path('cases/<str:pk_or_number>/', CaseDetailView.as_view(), name='case-detail'),
    path('cases/<str:pk_or_number>/run-checks/', CaseRunChecksView.as_view(), name='case-run-checks'),
    path('cases/<str:pk_or_number>/graph/', CaseGraphView.as_view(), name='case-graph'),
    path('cases/<str:pk_or_number>/graph-rag/', CaseGraphQueryView.as_view(), name='case-graph-rag'),
    path('cases/<str:pk_or_number>/report/', CaseReportView.as_view(), name='case-report'),
    path('seed-demo/', SeedDemoView.as_view(), name='seed-demo'),
]
