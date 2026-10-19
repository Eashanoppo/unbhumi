"""
Pipeline Orchestrator for UNBhumi LandGuard.
Coordinates end-to-end processing across document intake, OCR, normalization,
vector indexing, deterministic rule evaluation, topological graph generation, and audit logging.
"""

import time
import logging
from typing import Dict, Any, Optional

from apps.documents.models import Document
from apps.cases.models import Case
from apps.audit.models import AuditEvent

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """
    Central pipeline orchestrator.
    Executes stages in strict sequence with timing metrics and error resilience:
    1. Ingestion & Fingerprinting
    2. OCR & Document Layout Extraction
    3. Cadastral Entity Normalization & Relational Sync
    4. PII Scrubbing & Vector Indexing
    5. Deterministic Rule Evaluation (Rules D001 - X001)
    6. NetworkX Topological Ownership Graph Construction
    7. Audit Trail Registration
    """

    @classmethod
    def process_document(cls, document: Document, file_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        start_time = time.time()
        stage_metrics = {}

        # 1 & 2. Ingestion, Fingerprinting & Real OCR
        from services.ocr_service import OCRService
        t0 = time.time()
        ocr_result = OCRService.process_document(document, file_bytes=file_bytes)
        stage_metrics['ocr_ms'] = int((time.time() - t0) * 1000)

        # 3. Normalization & Entity Synchronization
        from services.normalization_service import NormalizationService
        t0 = time.time()
        NormalizationService.sync_entities_from_document(document)
        stage_metrics['normalization_ms'] = int((time.time() - t0) * 1000)

        # 4. Vector Chunking & Semantic Indexing
        from services.vector_service import VectorService
        t0 = time.time()
        chunks_count = VectorService.index_document(document)
        stage_metrics['vector_indexing_ms'] = int((time.time() - t0) * 1000)
        stage_metrics['chunks_count'] = chunks_count

        # 5 & 6. Rule Evaluation & Knowledge Graph Generation (if attached to a case)
        findings_count = 0
        if document.case:
            from services.rule_engine import RuleEngine
            t0 = time.time()
            engine = RuleEngine(document.case)
            findings = engine.evaluate_all()
            findings_count = len(findings)
            stage_metrics['rule_evaluation_ms'] = int((time.time() - t0) * 1000)

            from services.graph_service import GraphService
            t0 = time.time()
            graph_svc = GraphService(document.case)
            graph_svc.build_and_persist_graph()
            stage_metrics['graph_ms'] = int((time.time() - t0) * 1000)

            # 7. Audit Event Logging
            AuditEvent.objects.create(
                case=document.case,
                document=document,
                user=document.uploaded_by,
                action='upload',
                details={
                    'document_title': document.title,
                    'sha256': document.file_hash,
                    'page_count': document.page_count,
                    'fields_count': document.extracted_fields.count(),
                    'findings_count': findings_count
                }
            )

        total_time_ms = int((time.time() - start_time) * 1000)
        stage_metrics['total_pipeline_ms'] = total_time_ms

        return {
            'success': True,
            'document_id': document.id,
            'title': document.title,
            'file_hash': document.file_hash,
            'page_count': document.page_count,
            'fields_count': document.extracted_fields.count(),
            'findings_count': findings_count,
            'metrics': stage_metrics
        }
