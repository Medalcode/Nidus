# Nidius Suite 🚀

**Nidius Suite** es una plataforma Open Source diseñada para revolucionar tu búsqueda de empleo. Reemplaza las costosas herramientas SaaS con alternativas gratuitas, privadas y potenciadas por IA.

![Nidius Suite](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Docker](https://img.shields.io/badge/Deploy-Cloud%20Run-blueviolet)

## 🌟 Características Principales

### 1. 📋 Tablero Kanban de Postulaciones

Organiza tu búsqueda de empleo visualmente.

- **Estados**: Por Aplicar, Aplicado, Entrevista, Oferta, Rechazado.
- **Importación**: Trae ofertas desde portales web (RemoteOK, etc.) automáticamente.
- **Persistencia**: Tus datos se guardan en tu navegador (LocalStorage).

### 2. 🧠 Analizador de CV con IA

Optimiza tu currículum para pasar los filtros ATS.

- **Sube tu PDF**: Extrae el texto automáticamente.
- **Análisis Profundo**: Recibe una puntuación (0-100) y feedback crítico.
- **Reescritura**: Obtén una versión mejorada de tu CV al instante usando Llama 3.

### 3. 🎤 Simulador de Entrevistas

Practica antes de la entrevista real.

- **Roleplay**: La IA actúa como el reclutador de la empresa específica a la que aplicaste.
- **Feedback**: Recibe consejos sobre tus respuestas en tiempo real.

### 4. 📊 Analytics

Toma decisiones basadas en datos.

- **Métricas**: Tasa de conversión, embudo de contratación y actividad.

## 🛠️ Stack Tecnológico

- **Frontend**: React + Vite (Glassmorphism UI).
- **Backend**: Python (FastAPI).
- **IA**: Groq API (Llama 3 70B) + PDF.js.
- **Despliegue**: Docker + Google Cloud Run.
- **Estilos**: CSS Puro (Variables, Animaciones).

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio**

   ```bash
   git clone <repo-url>
   cd Nidius
   ```

2. **Backend (Python)**

   ```bash
   pip install -r requirements.txt
   python backend/main.py
   ```

3. **Frontend (Node.js)**
   ```bash
   npm install
   npm run dev
   ```

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado.

```bash
# Construir la imagen
docker build -t nidius-suite .

# Correr el contenedor
docker run -p 8080:8080 -e PORT=8080 nidius-suite
```

## ☁️ Google Cloud Run

Despliegue en un comando:

```bash
gcloud run deploy nidius-suite --source . --region us-central1 --allow-unauthenticated
```

## 📝 Licencia

MIT License - Úsala, modifícala y consigue ese trabajo.
