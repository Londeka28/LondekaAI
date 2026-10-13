"""TXT, PDF, and DOCX text extraction utilities (Phase 3)."""

import os
from pypdf import PdfReader
from docx import Document

def extract_text_from_file(file_storage):
    """
    Extracts readable text from uploaded TXT, text-based PDF, or DOCX files
    using project-recommended libraries[cite: 8, 11].
    """
    filename = file_storage.filename.lower()
    
    if filename.endswith(".txt"):
        try:
            content = file_storage.read().decode("utf-8")
            return content.strip()
        except UnicodeDecodeError:
            file_storage.seek(0)
            content = file_storage.read().decode("latin-1")
            return content.strip()

    elif filename.endswith(".pdf"):
        try:
            reader = PdfReader(file_storage)
            text_parts = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            return "\n".join(text_parts).strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {e}")

    elif filename.endswith(".docx"):
        try:
            doc = Document(file_storage)
            text_parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
            return "\n".join(text_parts).strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from Word document: {e}")

    else:
        raise ValueError(
            "Unsupported file format. Please upload a TXT, text-based PDF, or DOCX file[cite: 8, 11]."
        )
