import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict


PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

DATA_DIR = os.path.join(PROJECT_ROOT, "data")

INDEX_PATH = os.path.join(DATA_DIR, "medical.index")
METADATA_PATH = os.path.join(DATA_DIR, "metadata.json")

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
TOP_K = 5


_embedding_model = None
_faiss_index = None
_metadata = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        print("🔵 Loading embedding model...")
        _embedding_model = SentenceTransformer(EMBED_MODEL_NAME)
    return _embedding_model


def get_faiss_index() -> faiss.Index:
    global _faiss_index
    if _faiss_index is None:
        print("🟢 Loading FAISS index...")
        if not os.path.exists(INDEX_PATH):
            raise FileNotFoundError(f"FAISS index not found at {INDEX_PATH}")
        _faiss_index = faiss.read_index(INDEX_PATH)
    return _faiss_index


def get_metadata() -> List[Dict]:
    global _metadata
    if _metadata is None:
        print("🟣 Loading metadata...")
        if not os.path.exists(METADATA_PATH):
            raise FileNotFoundError(f"Metadata not found at {METADATA_PATH}")
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    return _metadata


def retrieve(query: str, k: int = TOP_K) -> List[Dict]:
    model = get_embedding_model()
    index = get_faiss_index()
    metadata = get_metadata()

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True
    ).astype("float32")

    distances, indices = index.search(query_embedding, k)

    results = []
    for idx in indices[0]:
        if idx < 0 or idx >= len(metadata):
            continue

        chunk = metadata[idx]
        results.append({
            "text": chunk["text"],
            "source": chunk.get("source", "unknown"),
            "chunk_id": int(idx)
        })

    return results
