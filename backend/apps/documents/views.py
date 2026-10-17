from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Document, ExtractedField
from apps.cases.models import Case
from apps.cases.serializers import DocumentSerializer, ExtractedFieldSerializer
from apps.audit.models import AuditEvent
from services.ocr_service import OCRService
from services.rule_engine import RuleEngine

class DocumentListView(APIView):
    def get(self, request):
        queryset = Document.objects.all().order_by('-created_at')

        doc_type = request.query_params.get('type')
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)

        doc_status = request.query_params.get('status')
        if doc_status:
            queryset = queryset.filter(status=doc_status)

        case_id = request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(file_hash__icontains=search)
            )

        serializer = DocumentSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        case_id = request.data.get('case_id')
        doc_type = request.data.get('document_type', 'deed')
        title = request.data.get('title', 'আপলোডকৃত দলিল')
        file_obj = request.FILES.get('file')

        case = None
        if case_id:
            case = get_object_or_404(Case, pk=case_id) if str(case_id).isdigit() else get_object_or_404(Case, case_number=case_id)

        file_hash = request.data.get('file_hash', '')
        file_size_bytes = int(request.data.get('file_size_bytes', 0))

        doc = Document.objects.create(
            case=case,
            document_type=doc_type,
            title=title,
            file=file_obj,
            file_hash=file_hash,
            file_size_bytes=file_size_bytes,
            uploaded_by=request.user if request.user.is_authenticated else None
        )

        OCRService.process_document(doc)

        if case:
            # Re-evaluate case rules
            engine = RuleEngine(case)
            engine.evaluate_all()

            AuditEvent.objects.create(
                case=case,
                document=doc,
                user=request.user if request.user.is_authenticated else None,
                action='upload',
                details={'document_title': doc.title, 'sha256': doc.file_hash}
            )

        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    def get(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        return Response(DocumentSerializer(doc).data)

    def delete(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        case = doc.case
        doc.delete()
        if case:
            engine = RuleEngine(case)
            engine.evaluate_all()
        return Response({'success': True, 'message': 'নথি সফলভাবে অপসারিত হয়েছে।'}, status=status.HTTP_200_OK)


class DocumentFieldsView(APIView):
    def get(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        fields = doc.extracted_fields.all()
        return Response(ExtractedFieldSerializer(fields, many=True).data)

    def patch(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        field_id = request.data.get('field_id')
        field_key = request.data.get('field_key')
        corrected_value = request.data.get('corrected_value', '').strip()

        if field_id:
            field = get_object_or_404(ExtractedField, pk=field_id, document=doc)
        elif field_key:
            field = get_object_or_404(ExtractedField, field_key=field_key, document=doc)
        else:
            return Response({'error': 'field_id or field_key required'}, status=status.HTTP_400_BAD_REQUEST)

        old_val = field.effective_value
        field.corrected_value = corrected_value
        field.status = 'corrected'
        field.corrected_by = request.user if request.user.is_authenticated else None
        field.save()

        # Re-evaluate case rules
        if doc.case:
            engine = RuleEngine(doc.case)
            engine.evaluate_all()

            AuditEvent.objects.create(
                case=doc.case,
                document=doc,
                user=request.user if request.user.is_authenticated else None,
                action='correct_field',
                details={'field_key': field.field_key, 'old_value': old_val, 'new_value': corrected_value}
            )

        return Response(ExtractedFieldSerializer(field).data)


class CaseDocumentUploadView(APIView):
    def post(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        doc_type = request.data.get('document_type', 'deed')
        title = request.data.get('title', 'সংযুক্ত দলিল')
        file_obj = request.FILES.get('file')
        file_hash = request.data.get('file_hash', '')
        file_size_bytes = int(request.data.get('file_size_bytes', 0))

        doc = Document.objects.create(
            case=case,
            document_type=doc_type,
            title=title,
            file=file_obj,
            file_hash=file_hash,
            file_size_bytes=file_size_bytes,
            uploaded_by=request.user if request.user.is_authenticated else None
        )

        OCRService.process_document(doc)

        engine = RuleEngine(case)
        engine.evaluate_all()

        AuditEvent.objects.create(
            case=case,
            document=doc,
            user=request.user if request.user.is_authenticated else None,
            action='upload',
            details={'document_title': doc.title, 'sha256': doc.file_hash}
        )

        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)
