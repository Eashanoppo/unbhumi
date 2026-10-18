"""
Vector Storage & Semantic Retrieval Pipeline Service for UNBUmi Detector.
Manages page-aware document chunking, PII scrubbing, dense embedding generation,
and case-isolated cosine similarity retrieval for evidence-grounded RAG.
"""

import math
import re
import hashlib
from typing import List, Dict, Any
from apps.documents.models import Document, DocumentChunk
from apps.cases.models import Case

EMBEDDING_DIM = 128
EMBEDDING_MODEL_NAME = "dense-projection-v1"
EMBEDDING_MODEL_VERSION = "1.0.0"

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
    Utilizes character n-gram and token feature hashing with cosine normalization.
    """
    if not text:
        return [0.0] * dim

    vec = [0.0] * dim
    tokens = re.findall(r'[\w\u0980-\u09FF]+', text.lower())

    for token in tokens:
        # Token hash feature
        h_token = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
        slot = h_token % dim
        sign = 1.0 if (h_token // dim) % 2 == 0 else -1.0
        vec[slot] += sign

        # Bigram character sliding window for Bengali morpho-semantic representation
        for i in range(len(token) - 1):
            bg = token[i:i+2]
            h_bg = int(hashlib.sha256(bg.encode('utf-8')).hexdigest(), 16)
            slot_bg = h_bg % dim
            sign_bg = 1.0 if (h_bg // dim) % 2 == 0 else -1.0
            vec[slot_bg] += 0.5 * sign_bg

    # L2 Normalization
    magnitude = math.sqrt(sum(x * x for x in vec))
    if magnitude > 1e-9:
        return [round(x / magnitude, 6) for x in vec]
    return [0.0] * dim

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two unit vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    return sum(a * b for a, b in zip(v1, v2))


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
                embedding_model=EMBEDDING_MODEL_NAME,
                model_version=EMBEDDING_MODEL_VERSION
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
                    embedding_model=EMBEDDING_MODEL_NAME,
                    model_version=EMBEDDING_MODEL_VERSION
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
