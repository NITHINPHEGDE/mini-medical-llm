import json
import os
import numpy as np
import faiss
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

CHUNKS_FILE = "data/chunks.json"
INDEX_FILE = "data/medical.index"
METADATA_FILE = "data/metadata.json"

MODEL_NAME = "all-MiniLM-L6-v2" 
BATCH_SIZE = 64


def main():
    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    texts = [c["text"] for c in chunks]

    model = SentenceTransformer(MODEL_NAME)

    embeddings = []

    for i in tqdm(range(0, len(texts), BATCH_SIZE)):
        batch = texts[i:i + BATCH_SIZE]
        batch_embeddings = model.encode(batch, show_progress_bar=False)
        embeddings.extend(batch_embeddings)

    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    os.makedirs(os.path.dirname(INDEX_FILE), exist_ok=True)
    faiss.write_index(index, INDEX_FILE)

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2)

    print("✅ Embedding & indexing complete!")
    print(f"Index saved to: {INDEX_FILE}")
    print(f"Metadata saved to: {METADATA_FILE}")


if __name__ == "__main__":
    main()
