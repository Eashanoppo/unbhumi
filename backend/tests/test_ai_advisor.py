"""
Tests for Bangladesh Land Law Knowledge Base & GraphRAG AI Advisor.
Verifies GraphRAG context compilation, statute retrieval, deterministic fallback,
Groq model API integration, and security controls.
"""

from typing import Any
from unittest.mock import patch, MagicMock
import json
from django.test import override_settings
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.cases.models import Case
from apps.parcels.models import Parcel
from apps.documents.models import Document, ExtractedField
from apps.rules.models import AnomalyFinding
from apps.accounts.models import UserProfile
from services.land_knowledge_service import LandKnowledgeService, BANGLADESH_LAND_STATUTES


class AIAdvisorTests(APITestCase):
    api_client: Any

    def setUp(self):
        self.api_client = APIClient()

        # Parcel & Case
        self.parcel = Parcel.objects.create(
            mouza='কাউন্দিয়া',
            dag_number='৭৮৯',
            survey_type='RS',
            recorded_area_decimals=15.5,
            normalized_key='dhaka_savar_kaundia_rs_789'
        )

        self.user_owner = User.objects.create_user(username='officer1', password='password123')
        self.user_intruder = User.objects.create_user(username='intruder', password='password123')
        UserProfile.objects.create(user=self.user_owner, role='officer')
        UserProfile.objects.create(user=self.user_intruder, role='officer')

        self.case = Case.objects.create(
            case_number='UB-20269174',
            title='জাল দলিল ও ডাবল-সেলিং তদন্ত কেস',
            parcel=self.parcel,
            created_by=self.user_owner,
            risk_score=85,
            risk_level='HIGH',
            status='UNDER_INVESTIGATION'
        )

        # Add document & extracted fields
        self.doc = Document.objects.create(
            case=self.case,
            title='দলিল ১২৩৪/২০২৪',
            original_filename='deed_1234_2024.pdf',
            document_type='deed',
            page_count=2,
            status='verified'
        )
        ExtractedField.objects.create(
            document=self.doc,
            field_key='deed_number',
            field_label_bn='দলিল নম্বর',
            raw_value='১২৩৪/২০২৪',
            normalized_value='1234/2024',
            confidence=0.98
        )
        ExtractedField.objects.create(
            document=self.doc,
            field_key='seller_name',
            field_label_bn='বিক্রেতা',
            raw_value='মো: আব্দুল জলিল',
            normalized_value='মো: আব্দুল জলিল',
            confidence=0.95
        )

        # Add anomaly finding matching AnomalyFinding model schema
        self.anomaly = AnomalyFinding.objects.create(
            case=self.case,
            rule_code_snapshot='DOUBLE_SALE',
            severity='critical',
            title_bn='একই দাগে পূর্ববর্তী বিক্রয়ের অস্তিত্ব (Double Selling)',
            title_en='Double Selling Detected on Same Dag',
            description_bn='দলিল ১২৩৪/২০২৪ অনুযায়ী জমিটি ইতিপূর্বে অন্য ক্রেতার নিকট বিক্রয় করা সত্ত্বেও দ্বিতীয়বার বিক্রয় দেখানো হয়েছে।',
            description_en='Land appears to have been sold twice previously.',
            human_action_recommended_bn='ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ অনুযায়ী সহকারী কমিশনার (ভূমি) এবং সাব-রেজিস্ট্রার বরাবর লিখিত অভিযোগ দাখিল করুন।'
        )
        self.anomaly.source_documents.add(self.doc)

    def test_land_statutes_presence_and_retrieval(self):
        """Verify statutory database contains core Bangladesh land laws."""
        self.assertGreaterEqual(len(BANGLADESH_LAND_STATUTES), 5)
        statutes = LandKnowledgeService.get_relevant_statutes(query='double sale registration fraud', top_k=3)
        self.assertGreaterEqual(len(statutes), 1)
        titles = [s['title'] for s in statutes]
        has_relevant_act = any(
            'ভূমি অপরাধ' in t or 'Land Crime' in t or 'Transfer of Property' in t or 'Registration' in t
            for t in titles
        )
        self.assertTrue(has_relevant_act)

    def test_build_case_rag_context(self):
        """Verify GraphRAG context correctly extracts all case attributes and anomalies."""
        rag_data = LandKnowledgeService.build_case_rag_context(self.case, user_query='পরবর্তী করণীয় কী?')

        self.assertEqual(rag_data['case']['case_number'], 'UB-20269174')
        self.assertEqual(rag_data['case']['mouza'], 'কাউন্দিয়া')
        self.assertGreaterEqual(len(rag_data['anomalies']), 1)
        self.assertEqual(rag_data['anomalies'][0]['rule_code'], 'DOUBLE_SALE')
        self.assertGreaterEqual(len(rag_data['documents']), 1)
        self.assertEqual(rag_data['documents'][0]['deed_number'], '1234/2024')
        self.assertGreaterEqual(len(rag_data['statutes']), 1)

    def test_case_ai_advisor_endpoint_get_context(self):
        """Verify GET returns GraphRAG context and available Groq models."""
        self.api_client.force_authenticate(user=self.user_owner)
        url = f'/api/v1/cases/{self.case.case_number}/ai-advisor/'
        response = self.api_client.get(url, HTTP_ACCEPT='application/json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['case_number'], self.case.case_number)
        self.assertIn('context_summary', response.data)
        self.assertIn('available_models', response.data)
        self.assertIn('llama-3.3-70b-versatile', response.data['available_models'])
        self.assertIn('openai/gpt-oss-120b', response.data['available_models'])
        self.assertIn('openai/gpt-oss-20b', response.data['available_models'])
        self.assertIn('meta-llama/llama-prompt-guard-2-22m', response.data['available_models'])
        self.assertIn('meta-llama/llama-prompt-guard-2-86m', response.data['available_models'])

    def test_case_ai_advisor_endpoint_post_deterministic_fallback(self):
        """Verify POST without Groq key returns rich deterministic legal advisory."""
        self.api_client.force_authenticate(user=self.user_owner)
        url = f'/api/v1/cases/{self.case.case_number}/ai-advisor/'
        payload = {
            'message': 'এই ডাবল সেলিং কেসে আমার কি করা উচিত?',
            'history': []
        }
        response = self.api_client.post(url, data=payload, format='json', HTTP_ACCEPT='application/json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reply', response.data)
        self.assertIn('Built-in', response.data['model'])
        self.assertGreater(len(response.data['suggested_actions']), 0)
        self.assertIn('grounded_context', response.data)
        self.assertIn('ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩', response.data['reply'])

    @patch('urllib.request.urlopen')
    def test_case_ai_advisor_endpoint_post_groq_success(self, mock_urlopen):
        """Verify POST with user Groq API key contacts Groq cloud and returns AI response."""
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({
            'choices': [{
                'message': {
                    'role': 'assistant',
                    'content': 'আপনার কেসে দলিল নম্বর ১২৩৪/২০২৪ সংক্রান্ত ডাবল সেলিং ধরা পড়েছে। অবিলম্বে সহকারী কমিশনার (ভূমি) এর কাছে মিস কেস (Mis-Case) দায়ের করুন।'
                }
            }]
        }).encode('utf-8')
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        self.api_client.force_authenticate(user=self.user_owner)
        url = f'/api/v1/cases/{self.case.case_number}/ai-advisor/'
        payload = {
            'message': 'আমাকে কী আইনি পদক্ষেপ নিতে হবে?',
            'groq_api_key': 'gsk_mock_valid_key_for_testing',
            'model': 'llama-3.3-70b-versatile'
        }
        response = self.api_client.post(url, data=payload, format='json', HTTP_ACCEPT='application/json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('সহকারী কমিশনার', response.data['reply'])
        self.assertEqual(response.data['model'], 'llama-3.3-70b-versatile')
        self.assertTrue(mock_urlopen.called)

    @override_settings(DEMO_MODE=False)
    def test_case_ai_advisor_unauthorized_access(self):
        """Verify unauthorized user cannot access another user's case AI advisor."""
        self.api_client.force_authenticate(user=self.user_intruder)
        url = f'/api/v1/cases/{self.case.case_number}/ai-advisor/'
        response = self.api_client.get(url, HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
