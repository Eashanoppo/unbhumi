"""
Comprehensive Integration & Verification Tests for UNBhumi Production AI Pipeline.
Tests:
1. Real OCR & Image Preprocessing (Tesseract Bengali + English, genuine confidence & bounding boxes)
2. Scanned PDF Rendering at 300 DPI via pypdfium2
3. Khatian Table Schedule Extraction & Map Boundary Vision
4. Structured Field Extractor with Pydantic Schema Validation
5. Dense Feature Embeddings with Dimension Mismatch Rejection
6. Heuristic Reranker for GraphRAG Candidate Pruning
7. NLI Conflict Screening & Statistical Anomaly Providers
8. Pipeline Orchestrator End-to-End Execution & Telemetry
"""

import io
from datetime import date, timedelta
from PIL import Image, ImageDraw
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.cases.models import Case
from apps.documents.models import Document, ExtractedField
from apps.parcels.models import Parcel
from services.pipeline.ocr import (
    TesseractOCRProvider,
    ImagePreprocessor,
    PDFPageRenderer,
    OCRRouter,
    find_tesseract_binary,
    is_visual_encoded_document,
    repair_visual_bengali_document
)
from services.pipeline.layout import TableExtractionProvider, MapVisionProvider
from services.pipeline.extraction import StructuredFieldExtractor, LandDocumentSchema
from services.pipeline.embeddings import (
    DenseFeatureHashingProvider,
    EmbeddingRouter
)
from services.pipeline.reranker import HeuristicRerankerProvider
from services.pipeline.nli import NLIConflictProvider
from services.pipeline.anomaly import StatisticalAnomalyProvider
from services.pipeline.orchestrator import PipelineOrchestrator


class ProductionPipelineTests(TestCase):
    def setUp(self):
        self.parcel = Parcel.objects.create(
            mouza='কাউন্দিয়া',
            dag_number='৪১২',
            survey_type='RS',
            recorded_area_decimals=25.0,
            normalized_key='dhaka_savar_kaundia_rs_412'
        )
        self.case = Case.objects.create(
            case_number='UB-TEST-PROD-01',
            title='প্রোডাকশন টেস্ট কেস',
            parcel=self.parcel
        )

    # -------------------------------------------------------------
    # 1. OCR & Preprocessing Tests
    # -------------------------------------------------------------
    def test_find_tesseract_binary(self):
        cmd = find_tesseract_binary()
        self.assertIsNotNone(cmd)
        self.assertTrue(any('tesseract' in cmd.lower() for _ in [1]))

    def test_tesseract_provider_real_inference(self):
        provider = TesseractOCRProvider()
        if not provider.is_available():
            self.skipTest("Tesseract binary not installed in test environment")

        # Generate sample image with numbers
        img = Image.new('RGB', (400, 100), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.text((20, 30), "Deed 8899 Date 2026", fill=(0, 0, 0))

        res = provider.extract_image(img)
        self.assertEqual(res['status'], 'success')
        self.assertIn('8899', res['text'])
        self.assertGreater(res['confidence'], 0.40)
        self.assertGreater(len(res['bounding_boxes']), 0)
        self.assertEqual(res['engine'], 'tesseract')

    def test_image_preprocessor(self):
        img = Image.new('RGBA', (600, 400), color=(255, 255, 255, 255))
        processed = ImagePreprocessor.preprocess(img)
        self.assertEqual(processed.mode, 'RGB')
        # Min dimension scaled up to 1200 for OCR legibility
        self.assertGreaterEqual(min(processed.size), 1200)

    def test_pypdfium2_pdf_page_renderer(self):
        import pypdfium2
        pdf = pypdfium2.PdfDocument.new()
        pdf.new_page(612, 792)
        pdf_bytes = io.BytesIO()
        pdf.save(pdf_bytes)
        pdf.close()
        pdf_bytes.seek(0)

        rendered = PDFPageRenderer.render_pdf(pdf_bytes.getvalue(), max_pages=1, dpi=300)
        self.assertEqual(len(rendered), 1)
        p_no, pil_img = rendered[0]
        self.assertEqual(p_no, 1)
        # 612 pts * (300/72) = 2550 px width
        self.assertAlmostEqual(pil_img.width, 2550, delta=10)

    def test_visual_bengali_detection_and_repair(self):
        # 1. Clean Unicode deed should NOT be flagged as visual
        clean_deed = "দলিল নং ১২৩৪/২০২৪, বিক্রেতা: মো: রফিকুল ইসলাম, দাগ নং: ১২৩৪"
        self.assertFalse(is_visual_encoded_document(clean_deed))

        # 2. English document should NOT be flagged as visual
        english_doc = "LandTech 2026 Innovation Hackathon Rule Book"
        self.assertFalse(is_visual_encoded_document(english_doc))

        # 3. Visual encoded document SHOULD be flagged
        visual_str = "লয্ান্ডেটক ইেনােভশন হয্াকাথন এবং স্মাটর্ ই গভনয্র্ ােন্সর জনয্ লয্ান্ড েটক"
        self.assertTrue(is_visual_encoded_document(visual_str))

        # 4. Repair should correctly normalize to standard Unicode
        repaired = repair_visual_bengali_document(visual_str)
        self.assertIn("ল্যান্ডটেক", repaired)
        self.assertIn("ইনোভেশন", repaired)
        self.assertIn("হ্যাকাথন", repaired)
        self.assertIn("স্মার্ট", repaired)
        self.assertIn("গভর্ন্যান্সের", repaired)

    # -------------------------------------------------------------
    # 2. Table & Map Layout Providers
    # -------------------------------------------------------------
    def test_khatian_table_schedule_extraction(self):
        schedule_text = """
        খতিয়ান নং ৫৮৩
        দাগ নং ৪১২ নাল জমি ২৫.০ শতাংশ
        দাগ নং ৪১৩ ভিটি জমি ১০.৫ শতাংশ
        """
        rows = TableExtractionProvider.extract_khatian_schedule(schedule_text)
        self.assertGreaterEqual(len(rows), 1)
        first_row = rows[0]
        self.assertIn(first_row['land_classification'], ('নাল', 'ভিটি'))

    def test_map_boundary_vision(self):
        map_text = """
        সাভার মৌজা নকশা
        জে এল নম্বর: ৬৭
        শিট নম্বর: ১
        উত্তরে: সরকারি রাস্তা
        দক্ষিণে: আব্দুর রহিমের জমি
        পূর্বে: খাল
        পশ্চিমে: আনোয়ার হোসেনের প্লট
        """
        map_meta = MapVisionProvider.analyze_map_sheet(map_text, width=1600.0, height=1200.0)
        self.assertTrue(map_meta['is_map_sheet'])
        self.assertEqual(map_meta['jl_number'], '৬৭')
        self.assertEqual(map_meta['sheet_number'], '১')
        self.assertIn('রাস্তা', map_meta['boundaries']['north'])
        self.assertIn('খাল', map_meta['boundaries']['east'])

    # -------------------------------------------------------------
    # 3. Structured Field Extraction & Schema Validation
    # -------------------------------------------------------------
    def test_structured_field_extractor_with_bounding_boxes(self):
        pages_data = [{
            'page_number': 1,
            'text': 'দলিল নম্বর: ৭৪৫২\nতারিখ: ১৫/০৩/২০২৬\n১ম পক্ষ: মো: আব্দুর রহিম\n২য় পক্ষ: ফাতেমা বেগম\nদাগ নম্বর: ৪১২\nজমির পরিমাণ: ২৫ শতাংশ',
            'confidence': 0.94,
            'bounding_boxes': [
                {'word': '৭৪৫২', 'confidence': 0.95, 'x': 120, 'y': 80, 'w': 50, 'h': 20},
                {'word': '৪১২', 'confidence': 0.95, 'x': 120, 'y': 150, 'w': 40, 'h': 20}
            ]
        }]
        extracted = StructuredFieldExtractor.extract_fields(pages_data)
        self.assertIn('deed_number', extracted)
        self.assertEqual(extracted['deed_number']['raw_value'], '৭৪৫২')
        self.assertEqual(extracted['deed_number']['bounding_box']['x'], 120)
        self.assertEqual(extracted['deed_number']['bounding_box']['y'], 80)
        self.assertIn('dag_number', extracted)
        self.assertEqual(extracted['dag_number']['raw_value'], '৪১২')

    def test_pydantic_schema_validation(self):
        schema = LandDocumentSchema(
            deed_number='৭৪৫২',
            deed_date='15/03/2026',
            seller_name='মো: আব্দুর রহিম',
            buyer_name='ফাতেমা বেগম',
            dag_number='৪১২',
            land_area='২৫ শতাংশ'
        )
        self.assertEqual(schema.deed_number, '৭৪৫২')
        self.assertEqual(schema.dag_number, '৪১২')

    # -------------------------------------------------------------
    # 4. Semantic Embeddings & Dimension Validation
    # -------------------------------------------------------------
    def test_dense_feature_embedding_provider(self):
        provider = DenseFeatureHashingProvider(dim=128)
        self.assertEqual(provider.get_dimension(), 128)
        vec = provider.embed_text("সাফ কবলা জমি হস্তান্তর কাউন্দিয়া দাগ ৪১২")
        self.assertEqual(len(vec), 128)
        # Must be L2-normalized
        magnitude = sum(x * x for x in vec)
        self.assertAlmostEqual(magnitude, 1.0, places=4)

    def test_dimension_mismatch_rejection(self):
        v1 = [0.1] * 128
        v2 = [0.1] * 64
        with self.assertRaises(ValueError):
            EmbeddingRouter.cosine_similarity(v1, v2)

    def test_heuristic_reranker(self):
        reranker = HeuristicRerankerProvider()
        candidates = [
            {'id': 1, 'text': 'সাধারণ তথ্যাবলী ও আইন', 'similarity': 0.8},
            {'id': 2, 'text': 'দলিল নং ৭৪৫২ দাগ ৪১২ হস্তান্তরিত জমি', 'similarity': 0.65},
        ]
        reranked = reranker.rerank('দলিল ও দাগ নম্বর', candidates, top_k=2)
        # Candidate 2 has matching domain keywords (দলিল, দাগ) and should be reranked higher
        self.assertEqual(reranked[0]['id'], 2)

    # -------------------------------------------------------------
    # 5. NLI & Statistical Anomaly Screening
    # -------------------------------------------------------------
    def test_nli_area_excess_contradiction(self):
        nli = NLIConflictProvider()
        premise = "খতিয়ানে মোট রেকর্ডকৃত জমি ২০ শতাংশ।"
        hypothesis = "বিক্রেতা একই দাগ থেকে ৩৫ শতাংশ জমি বিক্রি করেছেন।"
        res = nli.check_conflict(premise, hypothesis)
        self.assertEqual(res['verdict'], 'contradiction')
        self.assertGreaterEqual(res['confidence'], 0.90)

    def test_statistical_anomaly_rapid_resale(self):
        t1_date = date(2026, 4, 1)
        t2_date = date(2026, 4, 12)  # 11 days interval (< 30 days)
        txs = [
            {'deed_number': '101', 'deed_date': t1_date},
            {'deed_number': '102', 'deed_date': t2_date}
        ]
        anomalies = StatisticalAnomalyProvider.evaluate_transactions(txs)
        self.assertEqual(len(anomalies), 1)
        self.assertEqual(anomalies[0]['type'], 'rapid_resale_anomaly')
        self.assertEqual(anomalies[0]['delta_days'], 11)

    # -------------------------------------------------------------
    # 6. Pipeline Orchestrator End-to-End Execution
    # -------------------------------------------------------------
    def test_pipeline_orchestrator_execution(self):
        doc = Document.objects.create(
            case=self.case,
            document_type='deed',
            title='অরকেস্ট্রাটর টেস্ট দলিল',
            file_hash='orch_test_hash_1234567890'
        )
        res = PipelineOrchestrator.process_document(doc)
        self.assertTrue(res['success'])
        self.assertEqual(res['document_id'], doc.id)
        self.assertIn('ocr_ms', res['metrics'])
        self.assertIn('normalization_ms', res['metrics'])
        self.assertIn('vector_indexing_ms', res['metrics'])
        self.assertIn('total_pipeline_ms', res['metrics'])
