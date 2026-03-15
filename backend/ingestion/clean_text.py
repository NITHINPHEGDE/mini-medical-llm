import re
import os

def clean_text(text):
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"\[\d+\]", "", text) 
    text = re.sub(r"Page \d+", "", text)
    return text.strip()


def clean_files(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    for file in os.listdir(input_dir):
        with open(os.path.join(input_dir, file), "r", encoding="utf-8") as f:
            text = f.read()

        cleaned = clean_text(text)

        with open(os.path.join(output_dir, file), "w", encoding="utf-8") as f:
            f.write(cleaned)


if __name__ == "__main__":
    clean_files("data/text", "data/cleaned")
