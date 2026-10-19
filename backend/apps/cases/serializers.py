from rest_framework import serializers
from .models import Case, AnalysisRun
from apps.documents.models import Document, ExtractedField, DocumentPage
from apps.rules.models import AnomalyFinding
from apps.ownership.models import OwnershipEdge
from apps.audit.models import AuditEvent, ReviewerDecision

class ExtractedFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedField
        fields = [
            'id', 'document_id', 'page_number', 'field_key', 'field_label_bn',
            'raw_value', 'normalized_value', 'confidence', 'bounding_box',
            'status', 'corrected_value', 'effective_value', 'updated_at'
        ]

class DocumentPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentPage
        fields = ['id', 'page_number', 'image', 'ocr_text', 'ocr_confidence']

class DocumentSerializer(serializers.ModelSerializer):
    extracted_fields = ExtractedFieldSerializer(many=True, read_only=True)
    pages = DocumentPageSerializer(many=True, read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    raw_ocr_text = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'document_type', 'document_type_display', 'title',
            'file', 'file_url', 'file_hash', 'file_size_bytes', 'page_count', 'status',
            'status_display', 'created_at', 'extracted_fields', 'pages', 'raw_ocr_text'
        ]

    def get_raw_ocr_text(self, obj):
        texts = [p.ocr_text for p in obj.pages.all() if p.ocr_text]
        return "\n\n".join(texts) if texts else ""

    def get_file_url(self, obj):
        if obj.file:
            try:
                return obj.file.url
            except Exception:
                return None
        return None

class AnomalyFindingSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AnomalyFinding
        fields = [
            'id', 'case_id', 'rule_code_snapshot', 'severity', 'severity_display',
            'title_bn', 'title_en', 'description_bn', 'description_en',
            'conflicting_records', 'source_pages', 'source_fields',
            'human_action_recommended_bn', 'status', 'status_display',
            'created_at', 'updated_at'
        ]

class OwnershipEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnershipEdge
        fields = [
            'id', 'source_node_type', 'source_node_id', 'source_node_label',
            'target_node_type', 'target_node_id', 'target_node_label',
            'relation_type', 'is_conflict', 'conflict_reason', 'metadata'
        ]

class AuditEventSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditEvent
        fields = ['id', 'action', 'action_display', 'details', 'user_email', 'created_at']

class CaseListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)
    anomalies_count = serializers.IntegerField(source='anomalies.count', read_only=True)
    mouza = serializers.CharField(source='parcel.mouza', read_only=True, default='')
    dag_number = serializers.CharField(source='parcel.dag_number', read_only=True, default='')

    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'status', 'status_display',
            'risk_level', 'risk_level_display', 'risk_score', 'risk_summary_bn',
            'documents_count', 'anomalies_count', 'mouza', 'dag_number',
            'created_at', 'updated_at'
        ]

class CaseDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    anomalies = AnomalyFindingSerializer(many=True, read_only=True)
    ownership_edges = OwnershipEdgeSerializer(many=True, read_only=True)
    audit_events = AuditEventSerializer(many=True, read_only=True)
    mouza = serializers.CharField(source='parcel.mouza', read_only=True, default='')
    dag_number = serializers.CharField(source='parcel.dag_number', read_only=True, default='')
    recorded_area = serializers.FloatField(source='parcel.recorded_area_decimals', read_only=True, default=0.0)

    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'description', 'status', 'status_display',
            'risk_level', 'risk_level_display', 'risk_score', 'risk_summary_bn',
            'risk_summary_en', 'mouza', 'dag_number', 'recorded_area',
            'documents', 'anomalies', 'ownership_edges', 'audit_events',
            'created_at', 'updated_at'
        ]
