from typing import List, Dict
from app.services.ai_service import ai_service

def analyze_cv_text(text: str, filename: str, ext: str, api_key: str = None) -> Dict:
    # Try AI extraction first
    ai_data = ai_service.extract_cv_data(text, api_key=api_key)
    
    if ai_data:
        # Map AI data to our internal structure
        # Note: We might want to extend our internal structure (schemas/cv.py) to hold these new fields
        # For now, we'll map them to the existing flexible structure or just return them
        
        keywords = ai_data.get("skills", [])
        structure_items = []
        if ai_data.get("experience_years"):
            structure_items.append(f"Experiencia: {ai_data.get('experience_years')} años")
        if ai_data.get("last_role"):
            structure_items.append(f"Último Rol: {ai_data.get('last_role')}")
        if ai_data.get("summary"):
            structure_items.append("Resumen detectado")
            
        recommendations = []
        if not keywords:
            recommendations.append("No se detectaron habilidades técnicas claras.")
        if len(keywords) < 5:
            recommendations.append("Agrega más habilidades técnicas específicas.")
        if not ai_data.get("experience_years"):
            recommendations.append("No se detectó claramente los años de experiencia.")

        return {
            "filename": filename,
            "keywords": keywords,
            "format": ext.upper(),
            "structure": ", ".join(structure_items) if structure_items else "Estructura básica",
            "recommendations": recommendations,
            "ai_extracted": ai_data # Pass raw AI data if we want to show it in frontend later
        }

    # Fallback to Regex / Simple logic if AI fails or no key
    keywords = []
    target_keywords = ["python", "react", "fastapi", "sql", "docker", "aws", "javascript", "html", "css"]
    
    lower_text = text.lower()
    
    for kw in target_keywords:
        if kw in lower_text:
            keywords.append(kw.capitalize())

    structure = []
    target_sections = ["experiencia", "experience", "educación", "education", "skills", "habilidades", "summary", "resumen"]
    
    for section in target_sections:
        if section in lower_text:
            structure.append(section.capitalize())

    recommendations = [
        "Agrega más keywords relevantes." if len(keywords) < 3 else "Buen uso de keywords.",
        "Incluye sección de experiencia." if not any(s in lower_text for s in ["experiencia", "experience"]) else "",
        "Incluye un resumen profesional." if not any(s in lower_text for s in ["summary", "resumen"]) else ""
    ]
    
    # Limpiar recomendaciones vacías
    recommendations = [r for r in recommendations if r]

    return {
        "filename": filename,
        "keywords": keywords or ["(Ninguna keyword detectada)"],
        "format": ext.upper(),
        "structure": f"Secciones detectadas: {', '.join(structure) if structure else '(Ninguna)'}",
        "recommendations": recommendations,
        "ai_extracted": None
    }

