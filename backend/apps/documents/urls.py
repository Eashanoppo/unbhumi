from django.urls import path
from .views import DocumentListView, DocumentDetailView, DocumentFieldsView, CaseDocumentUploadView

urlpatterns = [
    path('documents/', DocumentListView.as_view(), name='document-list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/fields/', DocumentFieldsView.as_view(), name='document-fields'),
    path('cases/<str:pk_or_number>/documents/', CaseDocumentUploadView.as_view(), name='case-document-upload'),
]
