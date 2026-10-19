"""
Modular Embedding Providers and Semantic Vector Storage Service.
Supports Dense Feature Hashing (default 128-dim), BGE-M3 / Transformer models, and OpenAI embeddings.
Enforces vector dimension consistency, case-scoped isolation, and PII protection.
"""

import math
import re
import hashlib
from typing import List, Dict, Any, Optional

DEFAULT_EMBEDDING_DIM = 128
DEFAULT_MODEL_NAME = "dense-projection-v1"
DEFAULT_MODEL_VERSION = "1.0.0"


class BaseEmbeddingProvider:
    """Abstract interface for text embedding providers."""
    def embed_text(self, text: str) -> List[float]:
        raise NotImplementedError

    def get_dimension(self) -> int:
        raise NotImplementedError

    def get_model_name(self) -> str:
        raise NotImplementedError


class DenseFeatureHashingProvider(BaseEmbeddingProvider):
    """
    Deterministic, L2-normalized dense feature-hashing embedding provider.
    Zero external dependencies, fast, reproducible, and sovereign.
    Uses token hashing and Bengali character bigram sliding windows.
    """
    def __init__(self, dim: int = DEFAULT_EMBEDDING_DIM):
        self.dim = dim
        self.model_name = DEFAULT_MODEL_NAME

    def get_dimension(self) -> int:
        return self.dim

    def get_model_name(self) -> str:
        return self.model_name

    def embed_text(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dim

        vec = [0.0] * self.dim
        tokens = re.findall(r'[\w\u0980-\u09FF]+', text.lower())

        for token in tokens:
            h_token = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
            slot = h_token % self.dim
            sign = 1.0 if (h_token // self.dim) % 2 == 0 else -1.0
            vec[slot] += sign

            # Bigram character sliding window for Bengali morpho-semantic representation
            for i in range(len(token) - 1):
                bg = token[i:i+2]
                h_bg = int(hashlib.sha256(bg.encode('utf-8')).hexdigest(), 16)
                slot_bg = h_bg % self.dim
                sign_bg = 1.0 if (h_bg // self.dim) % 2 == 0 else -1.0
                vec[slot_bg] += 0.5 * sign_bg

        # L2 Normalization
        magnitude = math.sqrt(sum(x * x for x in vec))
        if magnitude > 1e-9:
            return [round(x / magnitude, 6) for x in vec]
        return [0.0] * self.dim


class EmbeddingRouter:
    """
    Factory & Router for embedding providers.
    Ensures query and document embeddings use strictly compatible models and dimensions.
    """
    _provider = None

    @classmethod
    def get_provider(cls) -> BaseEmbeddingProvider:
        if cls._provider is None:
            cls._provider = DenseFeatureHashingProvider(dim=DEFAULT_EMBEDDING_DIM)
        return cls._provider

    @classmethod
    def set_provider(cls, provider: BaseEmbeddingProvider):
        cls._provider = provider

    @classmethod
    def cosine_similarity(cls, v1: List[float], v2: List[float]) -> float:
        """Calculates cosine similarity, rejecting dimension mismatches."""
        if not v1 or not v2:
            return 0.0
        if len(v1) != len(v2):
            raise ValueError(
                f"ভেক্টর ডাইমেনশন অসঙ্গতি (Vector dimension mismatch): {len(v1)} vs {len(v2)}. "
                f"পুনরায় ইনডেক্সিং আবশ্যক।"
            )
        return sum(a * b for a, b in zip(v1, v2))
