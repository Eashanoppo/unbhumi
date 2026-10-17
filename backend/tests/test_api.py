from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from services.seed_service import seed_demo_data
from apps.cases.models import Case
from apps.rules.models import AnomalyFinding, RuleDefinition
from apps.documents.models import Document, ExtractedField

class UNBUmiAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        seed_demo_data()

    def test_health_check(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['database'], 'connected')

    def test_demo_login_success(self):
        response = self.client.post('/api/v1/auth/demo-login/', {'role': 'demo_reviewer'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_demo_login_invalid_role(self):
        response = self.client.post('/api/v1/auth/demo-login/', {'role': 'unauthorized_hacker'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_auth_me_with_token(self):
        login_res = self.client.post('/api/v1/auth/demo-login/', {'role': 'demo_reviewer'})
        token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/v1/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['authenticated'])
        self.assertEqual(response.data['user']['username'], 'reviewer')

    def test_dashboard_summary(self):
        response = self.client.get('/api/v1/dashboard/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['metrics']['total_cases'], 8)
        self.assertGreaterEqual(response.data['metrics']['total_docs'], 8)

    def test_case_list_and_filter(self):
        response = self.client.get('/api/v1/cases/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 8)

        # Filter by high risk
        response_high = self.client.get('/api/v1/cases/?risk=high')
        self.assertEqual(response_high.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response_high.data), 1)

    def test_case_detail_and_graph(self):
        case = Case.objects.get(case_number='UB-2026-1002')
        response = self.client.get(f'/api/v1/cases/{case.case_number}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['case_number'], 'UB-2026-1002')
        self.assertGreaterEqual(len(response.data['anomalies']), 1)

        # Test graph
        graph_resp = self.client.get(f'/api/v1/cases/{case.case_number}/graph/')
        self.assertEqual(graph_resp.status_code, status.HTTP_200_OK)
        self.assertIn('nodes', graph_resp.data)
        self.assertIn('edges', graph_resp.data)
        self.assertGreaterEqual(len(graph_resp.data['nodes']), 3)
        self.assertTrue(graph_resp.data['metrics']['has_conflicting_paths'])

    def test_run_checks_endpoint(self):
        case = Case.objects.get(case_number='UB-2026-1003')
        response = self.client.post(f'/api/v1/cases/{case.case_number}/run-checks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['anomalies']), 1)

    def test_field_correction_patch(self):
        doc = Document.objects.first()
        field = doc.extracted_fields.first()
        self.assertIsNotNone(field)

        response = self.client.patch(f'/api/v1/documents/{doc.id}/fields/', {
            'field_key': field.field_key,
            'corrected_value': 'পরিক্ষীত মান'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        field.refresh_from_db()
        self.assertEqual(field.status, 'corrected')
        self.assertEqual(field.corrected_value, 'পরিক্ষীত মান')

    def test_alert_disposition(self):
        finding = AnomalyFinding.objects.first()
        self.assertIsNotNone(finding)
        response = self.client.post(f'/api/v1/alerts/{finding.id}/disposition/', {
            'decision': 'confirmed_inconsistency',
            'reason_bn': 'সাব-রেজিস্ট্রি ইনডেক্স যাচাইপূর্বক অসঙ্গতি নিশ্চিত করা হলো।'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        finding.refresh_from_db()
        self.assertEqual(finding.status, 'confirmed_inconsistency')

    def test_rules_catalogue(self):
        response = self.client.get('/api/v1/rules/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 12)

    def test_case_report_export(self):
        case = Case.objects.get(case_number='UB-2026-1002')
        response = self.client.get(f'/api/v1/cases/{case.case_number}/report/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['report_id'], f'REP-{case.case_number}')
        self.assertIn('disclaimer', response.data)
        self.assertIn('anomalies', response.data)

    def test_case_graph_rag_query(self):
        case = Case.objects.get(case_number='UB-2026-1002')
        response = self.client.post(f'/api/v1/cases/{case.case_number}/graph-rag/', {'query': 'কামাল হোসেন'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('retrieved_nodes', response.data)
        self.assertIn('retrieved_edges', response.data)
        self.assertIn('grounded_evidence', response.data)
        self.assertIn('graph_synthesis_bn', response.data)
        self.assertGreaterEqual(len(response.data['retrieved_nodes']), 1)
