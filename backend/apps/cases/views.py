from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.conf import settings
from .models import Case, AnalysisRun
from .serializers import CaseListSerializer, CaseDetailSerializer, AnomalyFindingSerializer
from .permissions import IsCaseAuthorized
from apps.documents.models import Document
from apps.parcels.models import Parcel
from apps.rules.models import AnomalyFinding
from apps.audit.models import AuditEvent
from services.rule_engine import RuleEngine
from services.graph_service import GraphService
from services.seed_service import seed_demo_data

class DashboardSummaryView(APIView):
    def get(self, request):
        total_cases = Case.objects.count()
        critical_high_count = Case.objects.filter(risk_level__in=['critical', 'high']).count()
        needs_review_count = Case.objects.filter(status='flagged_review').count()
        clean_count = Case.objects.filter(risk_level='low').count()
        total_docs = Document.objects.count()

        recent_cases = Case.objects.order_by('-updated_at')[:5]
        recent_audits = AuditEvent.objects.order_by('-created_at')[:8]

        status_distribution = {
            'flagged_review': Case.objects.filter(status='flagged_review').count(),
            'verified_clean': Case.objects.filter(status='verified_clean').count(),
            'resolved': Case.objects.filter(status='resolved').count(),
            'pending': Case.objects.filter(status='pending').count(),
        }

        risk_distribution = {
            'critical': Case.objects.filter(risk_level='critical').count(),
            'high': Case.objects.filter(risk_level='high').count(),
            'review': Case.objects.filter(risk_level='review').count(),
            'low': Case.objects.filter(risk_level='low').count(),
        }

        return Response({
            'metrics': {
                'total_cases': total_cases,
                'critical_high_count': critical_high_count,
                'needs_review_count': needs_review_count,
                'clean_count': clean_count,
                'total_docs': total_docs
            },
            'status_distribution': status_distribution,
            'risk_distribution': risk_distribution,
            'recent_cases': CaseListSerializer(recent_cases, many=True).data,
            'recent_activity': [
                {
                    'id': a.id,
                    'action': a.get_action_display(),
                    'case_number': a.case.case_number if a.case else 'General',
                    'user': a.user.username if a.user else 'System',
                    'timestamp': a.created_at
                } for a in recent_audits
            ]
        })


class CaseListView(APIView):
    def get(self, request):
        queryset = Case.objects.all().select_related('parcel').order_by('-created_at')

        # Filter by risk_level
        risk = request.query_params.get('risk')
        if risk:
            queryset = queryset.filter(risk_level=risk)

        # Filter by status
        case_status = request.query_params.get('status')
        if case_status:
            queryset = queryset.filter(status=case_status)

        # Search by case_number, title, or mouza
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(case_number__icontains=search) |
                Q(title__icontains=search) |
                Q(parcel__mouza__icontains=search) |
                Q(parcel__dag_number__icontains=search)
            )

        serializer = CaseListSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        title = data.get('title', 'নতুন জমি দলিল যাচাই')
        desc = data.get('description', '')
        mouza = data.get('mouza', 'সাভার')
        dag_number = data.get('dag_number', '১০০')
        survey_type = data.get('survey_type', 'RS')
        area = float(data.get('area', 20.0))

        parcel, _ = Parcel.objects.get_or_create(
            mouza=mouza,
            dag_number=dag_number,
            survey_type=survey_type,
            defaults={'recorded_area_decimals': area}
        )

        user = request.user if request.user.is_authenticated else None

        case = Case.objects.create(
            title=title,
            description=desc,
            parcel=parcel,
            created_by=user,
            assigned_to=user
        )

        AuditEvent.objects.create(
            case=case,
            user=user,
            action='upload',
            details={'message': f'Case {case.case_number} created'}
        )

        return Response(CaseDetailSerializer(case).data, status=status.HTTP_201_CREATED)


class CaseDetailView(APIView):
    def get(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)
        serializer = CaseDetailSerializer(case)
        return Response(serializer.data)

    def patch(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)
        
        status_val = request.data.get('status')
        if status_val in dict(Case.STATUS_CHOICES):
            old_status = case.status
            case.status = status_val
            case.save()

            AuditEvent.objects.create(
                case=case,
                user=request.user if request.user.is_authenticated else None,
                action='review_disposition',
                details={'old_status': old_status, 'new_status': status_val}
            )

        return Response(CaseDetailSerializer(case).data)


class CaseRunChecksView(APIView):
    def post(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        engine = RuleEngine(case)
        findings = engine.evaluate_all()

        graph_service = GraphService(case)
        graph_service.build_and_persist_graph()

        AuditEvent.objects.create(
            case=case,
            user=request.user if request.user.is_authenticated else None,
            action='run_checks',
            details={'anomalies_count': len(findings), 'risk_score': case.risk_score}
        )

        return Response({
            'success': True,
            'message': f'অসঙ্গতি পরীক্ষা সম্পন্ন হয়েছে। {len(findings)}টি সংকেত চিহ্নিত।',
            'case': CaseDetailSerializer(case).data,
            'anomalies': AnomalyFindingSerializer(findings, many=True).data
        })


class CaseGraphView(APIView):
    def get(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        service = GraphService(case)
        graph_data = service.build_and_persist_graph()
        return Response(graph_data)


class CaseGraphQueryView(APIView):
    """
    GraphRAG Endpoint: Executes graph traversal and documentary evidence synthesis
    over the case's NetworkX knowledge graph.
    """
    def post(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        query = request.data.get('query', '')
        service = GraphService(case)
        result = service.query_graph(query)
        return Response(result)

    def get(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        query = request.query_params.get('query', '')
        service = GraphService(case)
        result = service.query_graph(query)
        return Response(result)


class CaseReportView(APIView):
    def get(self, request, pk_or_number):
        if pk_or_number.isdigit():
            case = get_object_or_404(Case, pk=pk_or_number)
        else:
            case = get_object_or_404(Case, case_number=pk_or_number)

        anomalies = AnomalyFinding.objects.filter(case=case)
        documents = Document.objects.filter(case=case)

        return Response({
            'report_id': f"REP-{case.case_number}",
            'generated_at': case.updated_at,
            'product_name': 'UNBUmi Detector (UNLEFT LandGuard)',
            'disclaimer': 'এই প্রতিবেদনটি একটি এআই-সহায়তাকৃত সিদ্ধান্ত সমর্থন বিশ্লেষণ। এটি কোনো আদালত বা সরকারি সাব-রেজিস্ট্রি কার্যালয়ের চূড়ান্ত আইনি স্বত্ব নির্ধারণ নয়।',
            'case_metadata': {
                'case_number': case.case_number,
                'title': case.title,
                'mouza': case.parcel.mouza if case.parcel else '',
                'dag_number': case.parcel.dag_number if case.parcel else '',
                'survey_type': case.parcel.survey_type if case.parcel else 'RS',
                'recorded_area': case.parcel.recorded_area_decimals if case.parcel else 0.0,
                'risk_level': case.get_risk_level_display(),
                'risk_score': case.risk_score,
                'risk_summary_bn': case.risk_summary_bn,
                'status': case.get_status_display(),
            },
            'documents': [
                {
                    'title': d.title,
                    'type': d.get_document_type_display(),
                    'sha256': d.file_hash,
                    'status': d.get_status_display()
                } for d in documents
            ],
            'anomalies': AnomalyFindingSerializer(anomalies, many=True).data,
            'audit_trail': [
                {
                    'action': a.get_action_display(),
                    'user': a.user.email if a.user else 'System',
                    'timestamp': a.created_at,
                    'details': a.details
                } for a in AuditEvent.objects.filter(case=case)[:10]
            ]
        })


class SeedDemoView(APIView):
    def post(self, request):
        if not getattr(settings, 'DEMO_MODE', True):
            return Response(
                {'error': 'উৎপাদন পরিবেশে ডেমো ডাটা রিসেট নিষ্ক্রিয় (Demo reset disabled in production mode)'},
                status=status.HTTP_403_FORBIDDEN
            )
        count = seed_demo_data()
        from django.contrib.auth.models import User
        from apps.accounts.models import DemoToken
        from apps.accounts.serializers import UserSerializer

        reviewer = User.objects.filter(profile__role='demo_reviewer').first()
        token = None
        if reviewer:
            token_obj = DemoToken.objects.filter(user=reviewer).first()
            if token_obj:
                token = token_obj.key

        return Response({
            'success': True,
            'message': f'সফলভাবে {count}টি সিন্থেটিক ভূমি রেকর্ড ও কেস ডাটাবেসে লোড হয়েছে।',
            'count': count,
            'token': token,
            'user': UserSerializer(reviewer).data if reviewer else None
        })
