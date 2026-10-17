from rest_framework import serializers
from .models import RuleDefinition, AnomalyFinding

class RuleDefinitionSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    family_display = serializers.CharField(source='get_family_display', read_only=True)

    class Meta:
        model = RuleDefinition
        fields = [
            'id', 'rule_code', 'family', 'family_display', 'title_en', 'title_bn',
            'description_en', 'description_bn', 'severity', 'severity_display',
            'points', 'safeguard_explanation_bn'
        ]

class AnomalyQueueItemSerializer(serializers.ModelSerializer):
    case_number = serializers.CharField(source='case.case_number', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AnomalyFinding
        fields = [
            'id', 'case_id', 'case_number', 'case_title', 'rule_code_snapshot',
            'severity', 'severity_display', 'title_bn', 'title_en',
            'description_bn', 'description_en', 'conflicting_records',
            'source_pages', 'source_fields', 'human_action_recommended_bn',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
