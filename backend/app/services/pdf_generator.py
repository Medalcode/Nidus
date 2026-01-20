import io
from reportlab.pdfgen import canvas
from typing import Dict

def generate_pdf_report(analysis: Dict) -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    
    c.drawString(100, 800, f"Análisis de CV: {analysis['filename']}")
    c.drawString(100, 780, f"Formato: {analysis['format']}")
    c.drawString(100, 760, f"Keywords: {', '.join(analysis['keywords'])}")
    c.drawString(100, 740, f"Estructura: {analysis['structure']}")
    c.drawString(100, 720, "Recomendaciones:")
    
    y = 700
    for rec in analysis['recommendations']:
        c.drawString(120, y, f"- {rec}")
        y -= 20
        
    c.save()
    buffer.seek(0)
    return buffer
