import os
import json
from tqdm import tqdm


INPUT_DIR = "data/cleaned"
OUTPUT_FILE = "data/chunks.json"

CHUNK_SIZE = 400      
OVERLAP = 50          


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):

    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        chunks.append(chunk_text)

       
        start += chunk_size - overlap

    return chunks


def process_files(input_dir):

    all_chunks = []
    chunk_id = 0

    files = [f for f in os.listdir(input_dir) if f.endswith(".txt")]

    for file in tqdm(files, desc="Chunking files"):
        file_path = os.path.join(input_dir, file)

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        if not text:
            continue

        chunks = chunk_text(text)

        for c in chunks:
            if len(c.split()) < 50:
                continue 

            all_chunks.append({
                "chunk_id": chunk_id,
                "text": c,
                "source": file
            })
            chunk_id += 1

    return all_chunks


if __name__ == "__main__":
    print("Starting chunking process...")

    chunks = process_files(INPUT_DIR)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2)

    print(f"Chunking complete!")
    print(f"Total chunks created: {len(chunks)}")
    print(f"Saved to: {OUTPUT_FILE}")
