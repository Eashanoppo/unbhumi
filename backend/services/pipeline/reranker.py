"""
Reranker Providers for Stage-8 GraphRAG and Evidence Synthesis.
Prunes graph-expanded candidate nodes and semantic chunks to maximize precision.
"""

from typing import List, Dict, Any, Optional

class BaseRerankerProvider:
    """Abstract interface for passage and evidence rerankers."""
    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        raise NotImplementedError


class HeuristicRerankerProvider(BaseRerankerProvider):
    """
    Precision reranker using token overlap, legal keyword alignment, and proximity scoring.
    Operates strictly on retrieved candidates without hallucinating new evidence.
    """
    LEGAL_KEYWORDS = ['দলিল', 'খতিয়ান', 'দাগ', 'মৌজা', 'বিক্রেতা', 'ক্রেতা', 'শতাংশ', 'বায়া', 'deed', 'khatian', 'dag', 'area']

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not candidates or not query:
            return candidates[:top_k]

        q_tokens = set(query.lower().split())
        scored = []

        for cand in candidates:
            text = str(cand.get('text', '') or cand.get('label', '') or cand.get('subtext', '')).lower()
            text_tokens = set(text.split())

            # 1. Query token overlap
            overlap = len(q_tokens.intersection(text_tokens))

            # 2. Domain keyword density
            legal_bonus = sum(1 for kw in self.LEGAL_KEYWORDS if kw in text) * 0.2

            # 3. Base similarity score if available
            base_score = float(cand.get('similarity', 0.5))

            final_score = base_score + (overlap * 0.4) + legal_bonus
            cand_copy = dict(cand)
            cand_copy['rerank_score'] = round(final_score, 3)
            scored.append(cand_copy)

        scored.sort(key=lambda x: x['rerank_score'], reverse=True)
        return scored[:top_k]
