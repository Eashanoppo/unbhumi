from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import RuleDefinition, AnomalyFinding
from .serializers import RuleDefinitionSerializer, AnomalyQueueItemSerializer
from apps.audit.models import ReviewerDecision, AuditEvent
from services.rules_catalog import ensure_rules_seeded

class RulesCatalogueView(APIView):
    def get(self, request):
        ensure_rules_seeded()
        rules = RuleDefinition.objects.all().order_by('rule_code')
        return Response(RuleDefinitionSerializer(rules, many=True).data)


class AlertsQueueView(APIView):
    def get(self, request):
        queryset = AnomalyFinding.objects.all().select_related('case').order_by('-created_at')

        severity = request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)

        finding_status = request.query_params.get('status')
        if finding_status:
            queryset = queryset.filter(status=finding_status)

        case_id = request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case__case_number=case_id)

        serializer = AnomalyQueueItemSerializer(queryset, many=True)
        return Response(serializer.data)


class AlertDispositionView(APIView):
    def post(self, request, pk):
        finding = get_object_or_404(AnomalyFinding, pk=pk)
        decision_val = request.data.get('decision')
        reason_bn = request.data.get('reason_bn', 'পর্যালোচক কর্তৃক নিষ্পত্তি').strip()
        reason_en = request.data.get('reason_en', '')

        valid_decisions = [c[0] for c in ReviewerDecision.DECISION_CHOICES]
        if decision_val not in valid_decisions:
            return Response({'error': f'Invalid decision. Must be one of: {valid_decisions}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update finding status
        old_status = finding.status
        finding.status = decision_val
        finding.save()

        # Create ReviewerDecision
        user = request.user if request.user.is_authenticated else None
        decision_record = ReviewerDecision.objects.create(
            case=finding.case,
            finding=finding,
            reviewer=user,
            decision=decision_val,
            reason_bn=reason_bn,
            reason_en=reason_en
        )

        # Create AuditEvent
        AuditEvent.objects.create(
            case=finding.case,
            user=user,
            action='review_disposition',
            details={
                'finding_id': finding.id,
                'rule_code': finding.rule_code_snapshot,
                'old_status': old_status,
                'new_status': decision_val,
                'reason_bn': reason_bn
            }
        )

        # Check if all findings for this case are resolved
        open_findings = finding.case.anomalies.filter(status='flagged').exists()
        if not open_findings:
            finding.case.status = 'resolved'
            finding.case.save()

        return Response({
            'success': True,
            'message': 'পর্যালোচক সিদ্ধান্ত সফলভাবে সংরক্ষিত হয়েছে।',
            'finding': AnomalyQueueItemSerializer(finding).data,
            'decision_id': decision_record.id
        })
