"""
Vector Storage & Semantic Retrieval Pipeline Service for UNBUmi Detector.
Manages page-aware document chunking, PII scrubbing, dense embedding generation,
and case-isolated cosine similarity retrieval for evidence-grounded RAG.
Integrates with EmbeddingRouter for modular embedding provider support.
"""

import math
import re
import hashlib
from typing import List, Dict, Any
from apps.documents.models import Document, DocumentChunk
from apps.cases.models import Case
from .pipeline.embeddings import (
    EmbeddingRouter,
    BaseEmbeddingProvider,
    DenseFeatureHashingProvider,
    DEFAULT_EMBEDDING_DIM,
    DEFAULT_MODEL_NAME,
    DEFAULT_MODEL_VERSION
)

EMBEDDING_DIM = DEFAULT_EMBEDDING_DIM
EMBEDDING_MODEL_NAME = DEFAULT_MODEL_NAME
EMBEDDING_MODEL_VERSION = DEFAULT_MODEL_VERSION


def scrub_pii(text: str) -> str:
    """Masks citizen national identity numbers and mobile phone numbers."""
    if not text:
        return ''
    # Mask mobile numbers first (01... or +8801... in English or Bengali numerals)
    scrubbed = re.sub(r'(?:\+?৮৮)?০১[০-৯]{8,9}|(?:\+?88)?01[0-9]{8,9}', '[মোবাইল নম্বর গোপনকৃত / PHONE-PROTECTED]', text)
    # Mask 10, 13, or 17 digit sequences (Bangladesh NID format)
    scrubbed = re.sub(r'\b[0-9০-৯]{10,17}\b', '[জাতীয় পরিচয়পত্র গোপনকৃত / NID-PROTECTED]', scrubbed)
    return scrubbed


def generate_dense_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """
    Generates a deterministic, L2-normalized dense embedding vector from text.
    Delegates to active EmbeddingRouter provider.
    """
    provider = EmbeddingRouter.get_provider()
    return provider.embed_text(text)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two unit vectors, enforcing dimension integrity."""
    return EmbeddingRouter.cosine_similarity(v1, v2)


class VectorService:
    @staticmethod
    def index_document(document: Document) -> int:
        """
        Splits completed document text into page-aware chunks, applies PII scrubbing,
        generates dense embeddings, and stores DocumentChunk records with provenance.
        """
        # Delete prior chunks for re-indexing
        DocumentChunk.objects.filter(document=document).delete()

        chunks_created = 0
        pages = list(document.pages.all().order_by('page_number'))
        provider = EmbeddingRouter.get_provider()
        model_name = provider.get_model_name()

        if not pages:
            # Fallback single chunk from document title
            text = f"{document.title} - {document.get_document_type_display()}"
            emb = generate_dense_embedding(text)
            DocumentChunk.objects.create(
                document=document,
                case=document.case,
                page_number=1,
                chunk_index=0,
                text_content=text,
                embedding_json=emb,
                embedding_model=model_name,
                model_version=DEFAULT_MODEL_VERSION
            )
            return 1

        for page in pages:
            raw_text = page.ocr_text or ''
            clean_text = scrub_pii(raw_text).strip()
            if not clean_text:
                continue

            # Split into paragraphs or word windows of ~150-250 words
            paragraphs = [p.strip() for p in clean_text.split('\n\n') if p.strip()]
            if not paragraphs:
                paragraphs = [clean_text]

            for chunk_idx, para in enumerate(paragraphs):
                emb = generate_dense_embedding(para)
                DocumentChunk.objects.create(
                    document=document,
                    case=document.case,
                    page_number=page.page_number,
                    chunk_index=chunk_idx,
                    text_content=para,
                    embedding_json=emb,
                    embedding_model=model_name,
                    model_version=DEFAULT_MODEL_VERSION
                )
                chunks_created += 1

        return chunks_created

    @staticmethod
    def retrieve_similar_chunks(case, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves top-k semantically relevant chunks for a case query with zero cross-case leakage.
        """
        if not query or not case:
            return []

        query_emb = generate_dense_embedding(query)

        # Scoped strictly to the target case
        if isinstance(case, str):
            chunks = DocumentChunk.objects.filter(case__case_number=case).select_related('document')
        else:
            chunks = DocumentChunk.objects.filter(case=case).select_related('document')

        scored_chunks = []
        for c in chunks:
            sim = cosine_similarity(query_emb, c.embedding_json)
            scored_chunks.append({
                'chunk_id': c.id,
                'doc_id': c.document.id,
                'doc_title': c.document.title,
                'doc_type': c.document.get_document_type_display(),
                'page': c.page_number,
                'chunk_index': c.chunk_index,
                'text': c.text_content,
                'similarity': round(float(sim), 3)
            })

        scored_chunks.sort(key=lambda x: x['similarity'], reverse=True)
        return scored_chunks[:top_k]
