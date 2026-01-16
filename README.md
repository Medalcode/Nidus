# ATS Visual - Pruebas de CV

Este proyecto es un sistema ATS (Applicant Tracking System) minimalista para subir, analizar y obtener recomendaciones sobre CVs. Permite subir archivos PDF, DOCX y TXT, analizar keywords, formato y estructura, mostrar recomendaciones visuales y exportar el análisis en PDF personalizado. Incluye soporte multi-idioma y una interfaz moderna con drag & drop.

## Estructura
- **backend/**: API FastAPI para subir, analizar y exportar CVs (almacenamiento en memoria).
- **frontend/**: React app con UI visual, drag & drop, feedback y exportación PDF.

## Uso
1. Ejecuta el backend (FastAPI).
2. Ejecuta el frontend (React).
3. Sube tu CV, revisa el análisis y exporta el resultado en PDF.

## Características
- Subida de CV por drag & drop
- Análisis de keywords, formato y estructura
- Recomendaciones para mejorar el CV
- Exportación de análisis en PDF personalizado (logo, colores)
- Soporte multi-idioma (español, inglés)
- Sin autenticación, datos solo en memoria

---


## Mejoras implementadas (2026)
- Feedback visual y manejo de errores en frontend
- Validación de tipo y tamaño de archivo en frontend y backend
- Loader/spinner durante análisis
- Extracción real de texto de PDF/DOCX/TXT en backend
- Análisis de keywords y secciones reales
- Logging y manejo robusto de errores en backend
- Dockerfile multi-stage listo para Cloud Run

## Despliegue en Google Cloud Run
1. Construye la imagen Docker:
	```
	docker build -t gcr.io/PROYECTO_ID/ats-visual .
	```
2. Sube la imagen a Google Container Registry:
	```
	docker push gcr.io/PROYECTO_ID/ats-visual
	```
3. Despliega en Cloud Run:
	```
	gcloud run deploy ats-visual --image gcr.io/PROYECTO_ID/ats-visual --platform managed --region us-central1 --allow-unauthenticated --port 8080
	```

## Cómo contribuir

## Cómo contribuir
1. Clona el repositorio y navega a la carpeta del proyecto.
2. Instala dependencias en `backend/` y `frontend/`.
3. Ejecuta ambos servidores en paralelo.
4. Si encuentras errores, revisa la estructura de carpetas y rutas.

---
---
Desarrollado para pruebas rápidas, visualización de resultados y despliegue cloud.
