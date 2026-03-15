from huggingface_hub import hf_hub_download
import os

os.makedirs("data", exist_ok=True)
hf_hub_download(repo_id="NITHINPhegde/medical-rag-data", filename="medical.index", repo_type="dataset", local_dir="data")
hf_hub_download(repo_id="NITHINPhegde/medical-rag-data", filename="metadata.json", repo_type="dataset", local_dir="data")
print("Data downloaded!")