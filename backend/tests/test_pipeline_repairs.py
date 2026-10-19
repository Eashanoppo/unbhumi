"""
Regression Test Suite for UNBhumi Post-OCR Pipeline Repairs.
Locks in data integrity, deed identity, ownership graph correctness, deterministic risk rules,
GraphRAG evidence provenance, and production security without touching the protected OCR pipeline.
"""

from datetime import date
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from apps.cases.models import Case
from apps.parcels.models import Parcel, KhatianRecord
from apps.documents.models import Document, ExtractedField
from apps.ownership.models import PersonOrParty, DeedTransaction, OwnershipEdge
from apps.rules.models import AnomalyFinding, RuleDefinition
from apps.accounts.models import UserProfile
from services.graph_service import GraphService
from services.rule_engine import RuleEngine
from services.normalization_service import (
    NormalizationService,
    normalize_parcel_key,
    normalize_area_to_decimals,
    parse_date_str
)


class PipelineRepairsRegressionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create distinct parcels
        self.parcel1 = Parcel.objects.create(
            mouza='কাউন্দিয়া',
            dag_number='৪১২',
            survey_type='RS',
            recorded_area_decimals=25.0,
            normalized_key='dhaka_savar_kaundia_rs_412'
        )
        self.parcel2 = Parcel.objects.create(
            mouza='বিরুলিয়া',
            dag_number='৪১২',  # Same dag, different mouza
            survey_type='SA',
            recorded_area_decimals=50.0,
            normalized_key='dhaka_savar_birulia_sa_412'
        )

        # Standard users
        self.user_owner = User.objects.create_user(username='case_owner', password='password123')
        self.user_other = User.objects.create_user(username='other_user', password='password123')
        UserProfile.objects.create(user=self.user_owner, role='officer')
        UserProfile.objects.create(user=self.user_other, role='officer')

        # Case
        self.case = Case.objects.create(
            case_number='UB-REGRESSION-01',
            title='জমি স্বত্ব যাচাই অনুসন্ধান',
            parcel=self.parcel1,
            created_by=self.user_owner,
            assigned_to=self.user_owner
        )

    # -------------------------------------------------------------------------
    # 1. Normalization & Parcel Association (Phase 4.1 & 4.2)
    # -------------------------------------------------------------------------
    def test_normalization_does_not_invent_survey_or_area(self):
        """Missing survey type, area, mouza must NOT default to RS, Savar, or 20.0 decimals."""
        doc = Document.objects.create(
            case=self.case,
            title='দলিল টেস্ট',
            document_type='deed',
            status='extracted'
        )
        # Create extracted fields WITHOUT survey_type or area
        ExtractedField.objects.create(
            document=doc,
            field_key='seller_name',
            field_label_bn='বিক্রেতা',
            raw_value='আব্দুল করিম',
            normalized_value='আব্দুল করিম',
            confidence=0.9
        )
        ExtractedField.objects.create(
            document=doc,
            field_key='buyer_name',
            field_label_bn='ক্রেতা',
            raw_value='রফিকুল ইসলাম',
            normalized_value='রফিকুল ইসলাম',
            confidence=0.9
        )
        ExtractedField.objects.create(
            document=doc,
            field_key='deed_number',
            field_label_bn='দলিল নম্বর',
            raw_value='৭৭৮৮',
            normalized_value='7788',
            confidence=0.95
        )

        NormalizationService.sync_entities_from_document(doc)

        # The deed transaction must NOT have fabricated area or sub-registry
        tx = DeedTransaction.objects.filter(deed_number='7788').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.transferred_area_decimals, 0.0, "Missing area must remain 0.0, not fabricated 20.0 or 10.0")
        self.assertEqual(tx.sub_registry_office, '', "Missing sub-registry must remain empty, not fabricated Savar")

    def test_same_dag_different_mouza_parcel_keys_differ(self):
        """Dag 412 in Kaundia vs Birulia must have different normalized parcel keys."""
        key1 = normalize_parcel_key('ঢাকা', 'সাভার', 'কাউন্দিয়া', 'RS', '৪১২')
        key2 = normalize_parcel_key('ঢাকা', 'সাভার', 'বিরুলিয়া', 'RS', '৪১২')
        self.assertNotEqual(key1, key2)

    def test_case_creation_without_mouza_dag_leaves_parcel_unlinked(self):
        """CaseListView.post without mouza or dag must not create a fabricated Savar parcel."""
        res = self.client.post('/api/v1/cases/', {
            'title': 'অনির্ধারিত মৌজা কেস',
            'description': 'তথ্যহীন কেস'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        case_id = res.data['case_number']
        new_case = Case.objects.get(case_number=case_id)
        self.assertIsNone(new_case.parcel, "Parcel must be None when no mouza/dag supplied")

    # -------------------------------------------------------------------------
    # 2. Deed Identity & Idempotence (Phase 4.3)
    # -------------------------------------------------------------------------
    def test_deed_reprocessing_is_idempotent(self):
        """Reprocessing the same document multiple times must not create duplicate transactions."""
        doc = Document.objects.create(
            case=self.case,
            title='দলিল ৮৮৯৯',
            document_type='deed',
            status='extracted'
        )
        for key, val in [('deed_number', '8899'), ('seller_name', 'ক'), ('buyer_name', 'খ'), ('land_area', '12.5')]:
            ExtractedField.objects.create(
                document=doc,
                field_key=key,
                field_label_bn=key,
                raw_value=val,
                normalized_value=val,
                confidence=0.95
            )

        NormalizationService.sync_entities_from_document(doc)
        initial_count = DeedTransaction.objects.filter(deed_number='8899').count()
        self.assertEqual(initial_count, 1)

        # Reprocess
        NormalizationService.sync_entities_from_document(doc)
        final_count = DeedTransaction.objects.filter(deed_number='8899').count()
        self.assertEqual(final_count, 1, "Repeated normalization must be idempotent without duplicates")

    def test_same_deed_number_different_parcel_not_overwritten(self):
        """Deed 9999 on Parcel 1 and Deed 9999 on Parcel 2 must remain separate records."""
        party1 = PersonOrParty.objects.create(name='রহিম')
        party2 = PersonOrParty.objects.create(name='করিম')
        party3 = PersonOrParty.objects.create(name='জামাল')

        doc1 = Document.objects.create(case=self.case, title='দলিল ১', document_type='deed')
        doc2 = Document.objects.create(case=self.case, title='দলিল ২', document_type='deed')

        tx1, _ = DeedTransaction.objects.update_or_create(
            deed_number='9999',
            parcel=self.parcel1,
            source_document=doc1,
            defaults={'seller': party1, 'buyer': party2, 'transferred_area_decimals': 10.0}
        )
        tx2, _ = DeedTransaction.objects.update_or_create(
            deed_number='9999',
            parcel=self.parcel2,
            source_document=doc2,
            defaults={'seller': party2, 'buyer': party3, 'transferred_area_decimals': 15.0}
        )

        self.assertNotEqual(tx1.id, tx2.id)
        self.assertEqual(DeedTransaction.objects.filter(deed_number='9999').count(), 2)

    # -------------------------------------------------------------------------
    # 3. Ownership Graph & Double-Sale Correctness (Phase 5)
    # -------------------------------------------------------------------------
    def test_sequential_transfers_a_to_b_to_c_is_not_double_sale(self):
        """
        Sequential ownership transfer:
        Transaction 1 (2020): A -> B
        Transaction 2 (2023): B -> C
        Must NOT be flagged as double sale! This is a valid historical chain of title.
        """
        person_a = PersonOrParty.objects.create(name='আনোয়ার হোসেন')
        person_b = PersonOrParty.objects.create(name='বেলায়েত শেখ')
        person_c = PersonOrParty.objects.create(name='চৌধুরী সাহেব')

        doc1 = Document.objects.create(case=self.case, title='দলিল ২০২০', document_type='deed')
        doc2 = Document.objects.create(case=self.case, title='দলিল ২০২৩', document_type='deed')

        DeedTransaction.objects.create(
            deed_number='TX-SEQ-01',
            parcel=self.parcel1,
            seller=person_a,
            buyer=person_b,
            deed_date=date(2020, 1, 1),
            transferred_area_decimals=10.0,
            source_document=doc1
        )
        DeedTransaction.objects.create(
            deed_number='TX-SEQ-02',
            parcel=self.parcel1,
            seller=person_b,
            buyer=person_c,
            deed_date=date(2023, 1, 1),
            transferred_area_decimals=10.0,
            source_document=doc2
        )

        graph_service = GraphService(self.case)
        graph_data = graph_service.build_and_persist_graph()

        # Check that there are NO CONFLICTED edges
        conflict_edges = [e for e in graph_data.get('edges', []) if e.get('is_conflict')]
        self.assertEqual(len(conflict_edges), 0, "Sequential transfer A -> B -> C must not produce conflict edges")

        # Evaluate rules
        engine = RuleEngine(self.case)
        findings = engine.evaluate_all()
        double_sale_findings = [f for f in findings if f.rule_code_snapshot == 'P001']
        self.assertEqual(len(double_sale_findings), 0, "Sequential transfer must not trigger P001 double sale finding")

    def test_actual_double_sale_same_seller_multiple_buyers_exceeding_area(self):
        """
        Genuine conflict:
        Same seller sells to Buyer 1 (15 decimals) and then Buyer 2 (15 decimals) on a 25 decimal plot,
        totaling 30 decimals > 25 decimals recorded parcel area.
        """
        seller = PersonOrParty.objects.create(name='একই বিক্রেতা')
        buyer1 = PersonOrParty.objects.create(name='প্রথম ক্রেতা')
        buyer2 = PersonOrParty.objects.create(name='দ্বিতীয় ক্রেতা')

        doc1 = Document.objects.create(case=self.case, title='দলিল ১', document_type='deed')
        doc2 = Document.objects.create(case=self.case, title='দলিল ২', document_type='deed')

        DeedTransaction.objects.create(
            deed_number='TX-DS-01',
            parcel=self.parcel1,
            seller=seller,
            buyer=buyer1,
            deed_date=date(2021, 5, 10),
            transferred_area_decimals=15.0,
            source_document=doc1
        )
        DeedTransaction.objects.create(
            deed_number='TX-DS-02',
            parcel=self.parcel1,
            seller=seller,
            buyer=buyer2,
            deed_date=date(2022, 6, 15),
            transferred_area_decimals=15.0,
            source_document=doc2
        )

        graph_service = GraphService(self.case)
        graph_data = graph_service.build_and_persist_graph()

        conflict_edges = [e for e in graph_data.get('edges', []) if e.get('is_conflict')]
        self.assertGreaterEqual(len(conflict_edges), 1, "Genuine double sale must be identified with is_conflict=True")

        engine = RuleEngine(self.case)
        findings = engine.evaluate_all()
        double_sale_findings = [f for f in findings if f.rule_code_snapshot == 'P001']
        self.assertGreaterEqual(len(double_sale_findings), 1, "Genuine double sale must trigger P001")

    # -------------------------------------------------------------------------
    # 4. Deterministic Risk Rules (Phase 6)
    # -------------------------------------------------------------------------
    def test_allegation_in_title_does_not_trigger_double_sale(self):
        """Case title mentioning 'double sale' or 'দ্বৈত বিক্রি' must NOT trigger P001 without transaction evidence."""
        case_with_allegation = Case.objects.create(
            case_number='UB-ALLEGATION-01',
            title='জরুরি অভিযোগ: দ্বৈত বিক্রি সন্দেহজনক মামলা Double Sale Case',
            description='বাদীপক্ষ দাবি করেছে এখানে দ্বৈত বিক্রি হয়েছে',
            parcel=self.parcel1
        )

        engine = RuleEngine(case_with_allegation)
        findings = engine.evaluate_all()
        double_sale_findings = [f for f in findings if f.rule_code_snapshot == 'P001']
        self.assertEqual(len(double_sale_findings), 0, "Title allegation alone must not produce P001 finding")

    # -------------------------------------------------------------------------
    # 5. GraphRAG & Evidence Provenance (Phase 8)
    # -------------------------------------------------------------------------
    def test_graph_query_empty_string_does_not_match_all_nodes(self):
        """Empty query string must return an overview summary, not match every node."""
        graph_service = GraphService(self.case)
        graph_service.build_and_persist_graph()

        result = graph_service.query_graph("")
        self.assertEqual(len(result['nodes']), 0, "Empty query must not match nodes via blank substring")
        self.assertEqual(len(result['edges']), 0, "Empty query must not match edges via blank substring")
        self.assertIn('summary_bn', result)
        self.assertIn('অনুগ্রহ করে অনুসন্ধানের জন্য নির্দিষ্ট কীওয়ার্ড', result['summary_bn'])

    def test_evidence_confidence_zero_remains_zero(self):
        """Extracted field confidence of 0.0 must be preserved as 0.0 and not defaulted to 0.95."""
        doc = Document.objects.create(case=self.case, title='অস্পষ্ট দলিল', document_type='deed')
        person1 = PersonOrParty.objects.create(name='দাতা')
        person2 = PersonOrParty.objects.create(name='গ্রহীতা')
        DeedTransaction.objects.create(
            deed_number='TX-UNCLEAR',
            parcel=self.parcel1,
            seller=person1,
            buyer=person2,
            source_document=doc
        )
        ExtractedField.objects.create(
            document=doc,
            field_key='unclear_field',
            field_label_bn='অস্পষ্ট তথ্য',
            raw_value='অস্পষ্ট লেখা',
            confidence=0.0
        )
        graph_service = GraphService(self.case)
        graph_service.build_and_persist_graph()
        result = graph_service.query_graph('TX-UNCLEAR')
        self.assertGreaterEqual(len(result.get('evidence', [])), 1)
        ev = next((e for e in result['evidence'] if e['field_key'] == 'unclear_field'), None)
        self.assertIsNotNone(ev)
        self.assertEqual(ev['confidence'], 0.0, "Real confidence 0.0 must NOT be replaced with 0.95")

    # -------------------------------------------------------------------------
    # 6. Production Security & Permissions (Phase 10)
    # -------------------------------------------------------------------------
    @override_settings(DEMO_MODE=False)
    def test_anonymous_access_blocked_in_production_mode(self):
        """In production (DEMO_MODE=False), anonymous GET on case report must return 401/403."""
        res = self.client.get(f'/api/v1/cases/{self.case.case_number}/report/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    @override_settings(DEMO_MODE=False)
    def test_unauthorized_user_blocked_from_other_users_case(self):
        """In production (DEMO_MODE=False), user_other cannot access user_owner's case."""
        self.client.force_authenticate(user=self.user_other)
        res = self.client.get(f'/api/v1/cases/{self.case.case_number}/report/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(DEMO_MODE=False)
    def test_authorized_owner_allowed_access(self):
        """In production (DEMO_MODE=False), case creator can access their case report."""
        self.client.force_authenticate(user=self.user_owner)
        res = self.client.get(f'/api/v1/cases/{self.case.case_number}/report/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check machine-readable fields
        meta = res.data['case_metadata']
        self.assertIn(meta['risk_level'], ['low', 'review', 'high', 'critical'])
        self.assertIn(meta['status'], ['pending', 'processing', 'flagged_review', 'verified_clean', 'resolved'])
