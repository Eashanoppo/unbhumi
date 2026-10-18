from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.cases.models import Case
from apps.documents.models import Document, DocumentFingerprint, ExtractedField, DocumentChunk
from apps.parcels.models import Parcel, KhatianRecord
from apps.ownership.models import PersonOrParty, DeedTransaction
from apps.rules.models import AnomalyFinding
from services.storage_service import validate_file_upload
from services.ocr_service import OCRService
from services.normalization_service import (
    bangla_to_arabic_digits,
    normalize_area_to_decimals,
    parse_date_str,
    NormalizationService
)
from services.vector_service import VectorService, scrub_pii, generate_dense_embedding, cosine_similarity
from services.rule_engine import RuleEngine
from services.seed_service import seed_demo_data

class PipelineAndSecurityTests(APITestCase):
    def setUp(self):
        seed_demo_data()
        self.case = Case.objects.get(case_number='UB-2026-1002')

    # -------------------------------------------------------------
    # 1. Storage & File Intake Validation Tests
    # -------------------------------------------------------------
    def test_file_validation_valid_pdf(self):
        valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        f = SimpleUploadedFile("deed_scan.pdf", valid_pdf_content, content_type="application/pdf")
        meta = validate_file_upload(f)
        self.assertEqual(meta['name'], 'deed_scan.pdf')
        self.assertEqual(meta['extension'], '.pdf')

    def test_file_validation_valid_png(self):
        valid_png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
        f = SimpleUploadedFile("map_sheet.png", valid_png_content, content_type="image/png")
        meta = validate_file_upload(f)
        self.assertEqual(meta['extension'], '.png')

    def test_file_validation_disallowed_extension(self):
        f = SimpleUploadedFile("malicious.exe", b"MZ\x90\x00\x03\x00", content_type="application/x-dosexec")
        with self.assertRaises(ValidationError):
            validate_file_upload(f)

    def test_file_validation_corrupted_header(self):
        # Named .pdf but plain text inside
        f = SimpleUploadedFile("fake.pdf", b"This is not a real PDF file header", content_type="application/pdf")
        with self.assertRaises(ValidationError):
            validate_file_upload(f)

    def test_file_validation_empty_file(self):
        f = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        with self.assertRaises(ValidationError):
            validate_file_upload(f)

    # -------------------------------------------------------------
    # 2. Normalization & Entity Resolution Tests
    # -------------------------------------------------------------
    def test_bangla_digit_conversion(self):
        self.assertEqual(bangla_to_arabic_digits("৭৪৫২"), "7452")
        self.assertEqual(bangla_to_arabic_digits("দাগ নং ৪১২ ও খতিয়ান ৫৮৩"), "দাগ নং 412 ও খতিয়ান 583")
        self.assertEqual(bangla_to_arabic_digits("২৫.৫"), "25.5")

    def test_area_normalization(self):
        # Decimals (শতাংশ / শতক)
        self.assertAlmostEqual(normalize_area_to_decimals("২৫ শতাংশ"), 25.0)
        self.assertAlmostEqual(normalize_area_to_decimals("10 decimals"), 10.0)
        # Katha (কাঠা -> 1.65 decimals)
        self.assertAlmostEqual(normalize_area_to_decimals("২ কাঠা"), 3.3)
        # Acre (একর -> 100 decimals)
        self.assertAlmostEqual(normalize_area_to_decimals("০.৫০ একর"), 50.0)
        # Bigha (বিঘা -> 33 decimals)
        self.assertAlmostEqual(normalize_area_to_decimals("১ বিঘা"), 33.0)

    def test_date_parsing(self):
        d1 = parse_date_str("১৫/০৩/২০২৬")
        self.assertIsNotNone(d1)
        self.assertEqual(d1.year, 2026)
        self.assertEqual(d1.month, 3)
        self.assertEqual(d1.day, 15)

    # -------------------------------------------------------------
    # 3. Vector Storage, PII Scrubbing & Semantic Retrieval Tests
    # -------------------------------------------------------------
    def test_pii_scrubbing(self):
        raw_text = "বিক্রেতা মো: আব্দুর রহিম, জাতীয় পরিচয়পত্র নম্বর: ১৯৫৮২৬১১৮৩৫০৫০০০০, মোবাইল: ০১৭০১২৩৪৫৬৭"
        scrubbed = scrub_pii(raw_text)
        self.assertNotIn("১৯৫৮২৬১১৮৩৫০৫০০০০", scrubbed)
        self.assertNotIn("০১৭০১২৩৪৫৬৭", scrubbed)
        self.assertIn("[জাতীয় পরিচয়পত্র গোপনকৃত", scrubbed)
        self.assertIn("[মোবাইল নম্বর গোপনকৃত", scrubbed)

    def test_vector_indexing_and_similarity_retrieval(self):
        doc = Document.objects.filter(case=self.case).first()
        self.assertIsNotNone(doc)
        assert doc is not None
        chunks_count = VectorService.index_document(doc)
        self.assertGreaterEqual(chunks_count, 1)

        # Retrieve relevant passages
        retrieved = VectorService.retrieve_similar_chunks(self.case, "দলিল ও দাগ নম্বর", top_k=2)
        self.assertGreaterEqual(len(retrieved), 1)
        self.assertEqual(retrieved[0]['doc_id'], doc.id)
        self.assertIn('similarity', retrieved[0])
        self.assertGreaterEqual(retrieved[0]['similarity'], -1.0)

    def test_case_isolation_in_vector_retrieval(self):
        # Case A vs Case B vector isolation
        case_a = Case.objects.get(case_number='UB-2026-1001')
        case_b = Case.objects.get(case_number='UB-2026-1002')

        doc_a = Document.objects.filter(case=case_a).first()
        self.assertIsNotNone(doc_a)
        assert doc_a is not None
        VectorService.index_document(doc_a)

        # Querying case B should NOT return case A chunks
        retrieved_b = VectorService.retrieve_similar_chunks(case_b, "সাফ কবলা", top_k=5)
        for chunk in retrieved_b:
            self.assertNotEqual(chunk['doc_id'], doc_a.id)

    # -------------------------------------------------------------
    # 4. Deterministic Rules & False-Positive Prevention Tests
    # -------------------------------------------------------------
    def test_rule_p001_double_selling_detected(self):
        # Case UB-2026-1002 is our double selling case
        c2 = Case.objects.get(case_number='UB-2026-1002')
        engine = RuleEngine(c2)
        findings = engine.evaluate_all()
        codes = [f.rule_code_snapshot for f in findings]
        self.assertIn('P001', codes)
        self.assertIn(c2.risk_level, ('critical', 'high'))

    def test_legitimate_partial_transfer_does_not_trigger_false_double_sale(self):
        # Create a synthetic clean case with legitimate partial transfers
        p = Parcel.objects.create(
            mouza='কাউন্দিয়া',
            dag_number='৯৯৯',
            survey_type='RS',
            recorded_area_decimals=50.0,
            normalized_key='dhaka_savar_kaundia_rs_999'
        )
        case_clean = Case.objects.create(
            case_number='UB-TEST-CLEAN',
            title='বৈধ আংশিক হস্তান্তর কেস',
            parcel=p
        )
        seller = PersonOrParty.objects.create(name='আব্দুস সাত্তার', name_bn='আব্দুস সাত্তার')
        buyer1 = PersonOrParty.objects.create(name='জামাল উদ্দিন', name_bn='জামাল উদ্দিন')
        buyer2 = PersonOrParty.objects.create(name='কামাল উদ্দিন', name_bn='কামাল উদ্দিন')

        # Tx1: Seller sells 10 decimals out of 50 decimals to buyer1
        t1 = DeedTransaction.objects.create(
            deed_number='99901',
            seller=seller,
            buyer=buyer1,
            parcel=p,
            transferred_area_decimals=10.0
        )
        # Tx2: Seller sells another 15 decimals out of remaining 40 to buyer2 (Total: 25 <= 50)
        t2 = DeedTransaction.objects.create(
            deed_number='99902',
            seller=seller,
            buyer=buyer2,
            parcel=p,
            transferred_area_decimals=15.0
        )

        engine = RuleEngine(case_clean)
        findings = engine.evaluate_all()
        codes = [f.rule_code_snapshot for f in findings]

        # Crucial requirement: legitimate partial transfer MUST NOT trigger P001!
        self.assertNotIn('P001', codes)

    def test_rule_p002_sold_area_exceeds_recorded(self):
        case_p002 = Case.objects.get(case_number='UB-2026-1005')
        engine = RuleEngine(case_p002)
        findings = engine.evaluate_all()
        codes = [f.rule_code_snapshot for f in findings]
        self.assertIn('P002', codes)

    def test_rule_k001_seller_khatian_mismatch(self):
        case_k001 = Case.objects.get(case_number='UB-2026-1003')
        engine = RuleEngine(case_k001)
        findings = engine.evaluate_all()
        codes = [f.rule_code_snapshot for f in findings]
        self.assertIn('K001', codes)
        self.assertIn('O001', codes)  # Missing baya deed

    def test_rule_d001_duplicate_hash(self):
        case_d001 = Case.objects.get(case_number='UB-2026-1006')
        engine = RuleEngine(case_d001)
        findings = engine.evaluate_all()
        codes = [f.rule_code_snapshot for f in findings]
        self.assertIn('D001', codes)

    # -------------------------------------------------------------
    # 5. Security & Authorization Tests
    # -------------------------------------------------------------
    @override_settings(DEMO_MODE=False)
    def test_seed_demo_blocked_in_production(self):
        # Even when authenticated as reviewer, seed demo is forbidden in production
        client = APIClient()
        login_res = client.post('/api/v1/auth/demo-login/', {'role': 'demo_reviewer'})
        login_data = login_res.json()
        token = login_data.get('token')
        if token:
            client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = client.post('/api/v1/seed-demo/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        res_data = response.json()
        self.assertIn('error', res_data)

    def test_authorized_document_download(self):
        client = APIClient()
        login_res = client.post('/api/v1/auth/demo-login/', {'role': 'demo_reviewer'})
        login_data = login_res.json()
        token = login_data['token']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        doc = Document.objects.filter(case=self.case).first()
        self.assertIsNotNone(doc)
        assert doc is not None
        assert doc.file is not None
        # Ensure file field has simulated content
        pdf_content = b"%PDF-1.4\nTest Document Stream\n%%EOF"
        doc.file.save("test_download.pdf", SimpleUploadedFile("test_download.pdf", pdf_content))

        response = client.get(f'/api/v1/documents/{doc.id}/file/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
