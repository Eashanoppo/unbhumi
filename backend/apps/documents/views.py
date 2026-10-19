from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import FileResponse, Http404
from django.core.exceptions import ValidationError

from .models import Document, ExtractedField
from apps.cases.models import Case
from apps.cases.serializers import DocumentSerializer, ExtractedFieldSerializer
from apps.cases.permissions import IsCaseAuthorized
from apps.audit.models import AuditEvent
from services.ocr_service import OCRService
from services.pipeline.ocr import OCRRouter
from services.pipeline.extraction import StructuredFieldExtractor
from services.normalization_service import NormalizationService
from services.vector_service import VectorService
from services.rule_engine import RuleEngine
from services.storage_service import validate_file_upload, generate_secure_storage_path


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

        file_meta = {}
        if file_obj:
            try:
                file_meta = validate_file_upload(file_obj)
            except ValidationError as ve:
                return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        file_hash = request.data.get('file_hash', '')
        file_size_bytes = int(request.data.get('file_size_bytes', file_meta.get('size_bytes', 0)))

        doc = Document.objects.create(
            case=case,
            document_type=doc_type,
            title=title,
            file=file_obj,
            original_filename=file_meta.get('name', ''),
            file_hash=file_hash,
            file_size_bytes=file_size_bytes,
            uploaded_by=request.user if request.user.is_authenticated else None
        )

        # 1. Real OCR & field extraction
        OCRService.process_document(doc)

        # 2. Entity normalization & relation sync
        NormalizationService.sync_entities_from_document(doc)

        # 3. Page-aware vector chunking & indexing
        VectorService.index_document(doc)

        if case:
            # 4. Re-evaluate case rules
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


class DocumentFileDownloadView(APIView):
    """Authorized file download / stream endpoint with case-level permission checks."""
    permission_classes = [IsCaseAuthorized]

    def get(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        self.check_object_permissions(request, doc)

        if not doc.file:
            raise Http404("নথির কোনো ফাইল সংরক্ষিত নেই (No file attached to this document).")

        try:
            return FileResponse(doc.file.open('rb'), content_type=doc.mime_type or 'application/octet-stream')
        except Exception as e:
            return Response({'error': f"ফাইল খোলা সম্ভব হয়নি: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        # Synchronize normalized entities with corrected field value
        NormalizationService.sync_entities_from_document(doc)

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

        file_meta = {}
        if file_obj:
            try:
                file_meta = validate_file_upload(file_obj)
            except ValidationError as ve:
                return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        file_hash = request.data.get('file_hash', '')
        file_size_bytes = int(request.data.get('file_size_bytes', file_meta.get('size_bytes', 0)))

        doc = Document.objects.create(
            case=case,
            document_type=doc_type,
            title=title,
            file=file_obj,
            original_filename=file_meta.get('name', ''),
            file_hash=file_hash,
            file_size_bytes=file_size_bytes,
            uploaded_by=request.user if request.user.is_authenticated else None
        )

        # 1. Run real OCR
        OCRService.process_document(doc)

        # 2. Sync entity relations
        NormalizationService.sync_entities_from_document(doc)

        # 3. Vector chunking & index
        VectorService.index_document(doc)

        # 4. Evaluate rules
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


class DocumentScanPreviewView(APIView):
    """
    Live OCR Scan Preview Endpoint:
    Processes an uploaded document in-memory and returns genuine OCR recognized text,
    confidence score, bounding boxes, and extracted land schedule fields for real-time
    client-side verification in the ingestion wizard.
    """
    permission_classes = []

    def post(self, request):
        file_obj = request.FILES.get('file')
        doc_type = request.data.get('document_type', 'deed')
        if not file_obj:
            return Response({'error': 'ফাইল পাওয়া যায়নি (No file provided)'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            file_meta = validate_file_upload(file_obj)
        except ValidationError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        file_bytes = file_obj.read()
        mime_type = file_meta.get('mime_type', 'application/octet-stream')
        orig_name = file_meta.get('name', 'document')

        # 1. Real OCR extraction (for multi-page preview, process first 3 pages for instant interactive response)
        router = OCRRouter()
        is_pdf = mime_type == 'application/pdf' or orig_name.lower().endswith('.pdf')
        pages = router.process(file_bytes, is_pdf=is_pdf, max_pages=3 if is_pdf else None)

        raw_text = "\n\n".join(p.get('text', '') for p in pages if p.get('text')).strip()
        confidence = round(sum(p.get('confidence', 0.8) for p in pages) / max(len(pages), 1), 3)
        words_count = sum(p.get('words_count', 0) for p in pages)
        bboxes = []
        for p in pages:
            bboxes.extend(p.get('bounding_boxes', []))

        engine = router.ocr_provider.name if hasattr(router.ocr_provider, 'name') else 'tesseract'
        engine_version = router.ocr_provider.version if hasattr(router.ocr_provider, 'version') else '5.5.0'
        language = router.ocr_provider.lang if hasattr(router.ocr_provider, 'lang') else 'script/Bengali+eng'

        # 2. Structured field extraction
        extracted_map = StructuredFieldExtractor.extract_fields(pages)
        fields = list(extracted_map.values())

        # 3. Suggest metadata for case creation if present
        suggested = {}
        for f in fields:
            k = f.get('field_key')
            val = f.get('normalized_value') or f.get('raw_value')
            if k == 'mouza':
                suggested['mouza'] = val
            elif k == 'dag_number':
                suggested['dag_number'] = val
            elif k in ('transferred_area', 'recorded_area'):
                suggested['area'] = val
            elif k == 'survey_type':
                suggested['survey_type'] = val

        return Response({
            'success': True,
            'raw_ocr_text': raw_text,
            'confidence': confidence,
            'words_count': words_count,
            'engine': engine,
            'engine_version': engine_version,
            'language': language,
            'bounding_boxes': bboxes[:100],
            'extracted_fields': fields,
            'suggested': suggested
        })
