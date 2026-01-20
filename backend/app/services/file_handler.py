import io
import logging
from fastapi import UploadFile

logger = logging.getLogger("ats.file_handler")

async def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename
    ext = filename.lower().split('.')[-1]
    content = await file.read()
    
    text = ""
    try:
        if ext == "pdf":
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(page.extract_text() or '' for page in pdf.pages)
        elif ext == "docx":
            from docx import Document
            doc = Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs])
        elif ext == "txt":
            text = content.decode(errors="ignore")
        else:
            text = "" # Should be handled by validation before calling this or return empty
    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {e}")
        raise e
        
    return text
