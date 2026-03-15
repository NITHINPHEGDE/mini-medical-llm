import pdfplumber
import os

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def process_pdfs(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    for file in os.listdir(input_dir):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(input_dir, file)
            text = extract_text_from_pdf(pdf_path)

            out_file = file.replace(".pdf", ".txt")
            with open(os.path.join(output_dir, out_file), "w", encoding="utf-8") as f:
                f.write(text)


if __name__ == "__main__":
    process_pdfs("data/pdfs", "data/text")
