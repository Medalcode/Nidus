# Nidus - CV-Driven Job Application Automation 🚀

**Automatiza tu búsqueda de empleo con IA**. Sube tu CV, genera perfiles optimizados, y deja que Nidus encuentre, analice y aplique a trabajos por ti.

![Status](https://img.shields.io/badge/Status-Beta-yellow)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![React](https://img.shields.io/badge/React-19-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

---

## 🎯 ¿Qué hace Nidus?

<<<<<<< Updated upstream
Organiza tu búsqueda de empleo visualmente.

- **Estados**: Por Aplicar, Aplicado, Entrevista, Oferta, Rechazado.
- **Importación**: Trae ofertas desde portales web (RemoteOK, etc.) automáticamente.
- **Exportar/Importar**: Haz respaldo de tus datos en formato JSON.
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

### 5. 🌓 Modo Oscuro/Claro

- **Toggle fácil**: Cambia entre tema oscuro y claro con un clic.
- **Persistencia**: Tu preferencia se guarda automáticamente.

### 6. 🌍 Multiidioma (i18n)

- **Español e Inglés**: Interfaz completamente traducida.
- **Cambio instantáneo**: Alterna entre idiomas sin recargar.

### 7. 📱 Progressive Web App (PWA)

- **Instalable**: Instala la app en tu dispositivo como app nativa.
- **Offline**: Funciona sin conexión una vez cargada.
- **Notificaciones**: (Próximamente) Recibe alertas de nuevas ofertas.

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite (Glassmorphism UI).
- **Backend**: Python (FastAPI).
- **IA**: Groq API (Llama 3 70B) + PDF.js.
- **PWA**: Service Workers + Web App Manifest.
- **i18n**: Sistema de traducciones con Context API.
- **Despliegue**: Docker + Google Cloud Run.
- **Estilos**: CSS Puro (Variables, Animaciones, Temas).

## 🚀 Instalación y Uso Local

## 🚀 Instalación y Uso Local

### Prerrequisitos

- **Node.js** 18+ y npm
- **Python** 3.10+
- **Groq API Key** (gratis en [console.groq.com](https://console.groq.com))

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd Nidius
```

### 2. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local y añade tu Groq API Key
```

### 3. Backend (Python)

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python backend/main.py
```

El backend estará disponible en `http://localhost:8080`

### 4. Frontend (Node.js)

En otra terminal:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 5. Configurar API Key en la aplicación

1. Abre la aplicación en el navegador
2. Ve a **Tablero** → **Configuración** (icono de engranaje)
3. Ingresa tu Groq API Key
4. ¡Listo! Ya puedes usar todas las funcionalidades de IA

## 📦 Exportar e Importar Datos

Tus postulaciones se guardan en el navegador (LocalStorage). Para hacer backup:

- **Exportar**: Haz clic en el icono de descarga en el Tablero
- **Importar**: Haz clic en el icono de nube para cargar un JSON previo

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado.

```bash
# Construir la imagen
docker build -t nidius-suite .

# Correr el contenedor
docker run -p 8080:8080 -e PORT=8080 nidius-suite
=======
```
1. Subes tu CV (PDF/TXT)
2. IA extrae: skills, experiencia, educación
3. Genera 3 perfiles (Frontend/Backend/Fullstack)
4. Scraper busca trabajos automáticamente
5. IA calcula match score (0-100) para cada job
6. Revisas y apruebas en cola de aprobación
7. Bot aplica automáticamente con el perfil correcto
>>>>>>> Stashed changes
```

### Ventajas vs Aplicar Manualmente
- ⏱️ **Ahorra 95% del tiempo**: De 30min/aplicación a 2min/aprobación
- 🎯 **Mejor targeting**: IA selecciona el perfil óptimo por job
- 📊 **Data-driven**: Scores numéricos + reasoning detallado
- 🤖 **Escalable**: Revisa 50+ jobs en el tiempo de aplicar a 1
- 📝 **Logs completos**: Screenshots + detalles de cada aplicación

---

## 🚀 Quick Start

### 1. Iniciar Sistema (Automático)
```bash
./start_dev.sh
```

<<<<<<< Updated upstream
## 🛠️ Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Build para producción
npm run preview  # Vista previa del build
npm run lint     # Linter de código
```

## ✨ Características Avanzadas

### PWA (Progressive Web App)

La aplicación es instalable y funciona offline:

1. Visita la app en tu navegador
2. Busca el ícono de "Instalar" en la barra de direcciones
3. Haz clic para instalar como aplicación nativa
4. ¡Disfruta de la app sin conexión!

### Modo Oscuro/Claro

- Haz clic en el ícono de sol/luna en la esquina superior derecha
- Tu preferencia se guarda automáticamente
- El tema se aplica instantáneamente

### Cambio de Idioma

- Haz clic en el botón de idioma (ES/EN)
- La interfaz completa cambia de inmediato
- Soporta Español e Inglés

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - Úsala, modifícala y consigue ese trabajo.

## 🌟 Roadmap

- [x] Tablero Kanban con drag & drop
- [x] Optimizador de CV con IA
- [x] Simulador de entrevistas
- [x] Analytics y métricas
- [x] PWA - Instalable y offline
- [x] Modo oscuro/claro
- [x] Multiidioma (ES/EN)
- [x] Exportar/Importar datos
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Integración con LinkedIn API
- [ ] Auto-aplicación a ofertas
- [ ] Soporte para más portales de empleo
- [ ] Notificaciones push
- [ ] Sincronización en la nube (opcional)
- [ ] Más idiomas (FR, DE, PT)

## 💡 Créditos

Desarrollado con ❤️ para ayudar a la comunidad a conseguir mejores oportunidades laborales.
=======
### 2. Configurar API Key (Gratis)
```bash
# Obtén tu key gratis en: https://console.groq.com
# Edita .env:
GROQ_API_KEY=gsk_tu_key_aqui
```

### 3. Usar la App
```
http://localhost:5173  →  Register  →  Upload CV  →  ¡Listo!
```

---

## 📖 Documentación Completa

| Archivo | Contenido |
|---------|-----------|
| **[README_CV_WORKFLOW.md](README_CV_WORKFLOW.md)** | 📘 Guía completa de API + ejemplos curl |
| **[scripts/test_cv_workflow.sh](scripts/test_cv_workflow.sh)** | 🧪 Test end-to-end automático |
| **API Docs** | 📚 http://localhost:8000/docs (Swagger) |

---

## 🎨 Características

### ✅ Implementado (v2.0 - Enero 2026)

#### Backend
- ✅ **CV Management**
  - Upload CV (PDF/TXT)
  - AI extraction con Groq (Llama 3.3 70B)
  - Structured data: personal_info, skills, experience, education
  
- ✅ **Multi-Profile System**
  - Genera 3 perfiles: Frontend, Backend, Fullstack
  - Cada perfil optimizado para su job type
  - Tailored skills, summary, match keywords
  
- ✅ **AI Job Matching**
  - Match score 0-100 por job × profile
  - Reasoning detallado del score
  - Skill gap analysis (matched/missing/bonus)
  - Recomendación del mejor perfil
  
- ✅ **Approval Queue**
  - Cola de matches pendientes (>60 score)
  - Approve/Reject workflow
  - Stats dashboard
  
- ✅ **Database Models**
  - CVData, CVProfile, JobMatch, Job
  - Relaciones correctas con foreign keys
  - Timestamps y status tracking

- ✅ **Authentication**
  - JWT con bcrypt
  - User registration/login
  - Protected endpoints

- ✅ **Job Scraping**
  - RemoteOK, LinkedIn (con limitaciones)
  - Extracción: title, company, link, description
  - Storage con IDs únicos

- ✅ **Application Bot**
  - Playwright automation
  - Screenshot logging
  - Multi-step form support
  - CV file upload

### ⏳ En Progreso

- ⏳ **UI Refactor**
  - Onboarding flow (CV upload)
  - Approval queue dashboard
  - Profile manager
  - Stats visualization

### 📋 Por Hacer

- 📋 **Background Scraper**
  - Cron job automático
  - Auto-matching on scrape
  - Notificaciones de nuevos matches

- 📋 **Enhanced Bot**
  - Selección automática de perfil
  - Cover letter generation
  - Multiple application platforms

- 📋 **Analytics**
  - Match rate por perfil
  - Success rate por empresa
  - Timeline de aplicaciones

---

## 🏗️ Arquitectura

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Backend** | FastAPI, SQLAlchemy, Python 3.12 |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **AI/LLM** | Groq (Llama 3.3 70B) - Free tier |
| **Automation** | Playwright (Chromium) |
| **Auth** | JWT + bcrypt |

### Database Schema

```sql
users_auth
  ├── id, email, hashed_password

cv_data
  ├── user_id (FK)
  └── personal_info, skills, experience, education (JSON)

cv_profiles (3 por usuario)
  ├── cv_data_id (FK)
  ├── profile_type (frontend/backend/fullstack)
  └── summary, tailored_skills, match_keywords (JSON)

jobs
  ├── user_id (FK)
  ├── title, company, link, description
  └── required_skills, required_experience (JSON)

job_matches
  ├── job_id (FK), cv_profile_id (FK)
  ├── match_score (0-100)
  ├── match_reasoning, skill_match_details (JSON)
  └── status (pending_review/user_approved/applied)

application_logs
  ├── job_match_id (FK)
  └── status, bot_logs, screenshots (JSON)
```

### Flujo de Datos

```
┌─────────┐     ┌──────────┐     ┌───────────┐
│ Usuario │────▶│ Frontend │────▶│  Backend  │
└─────────┘     └──────────┘     └─────┬─────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
              ┌──────────┐       ┌─────────┐      ┌──────────┐
              │ Groq API │       │   DB    │      │ Playwright│
              │(AI Match)│       │(SQLite) │      │   (Bot)   │
              └──────────┘       └─────────┘      └──────────┘
```

---

## 🧪 Testing

### Test Automático Completo
```bash
chmod +x scripts/test_cv_workflow.sh
./scripts/test_cv_workflow.sh
```

Esto ejecuta:
1. ✅ Register user
2. ✅ Login (get JWT)
3. ✅ Upload CV
4. ✅ Extract data (AI)
5. ✅ Generate 3 profiles (AI)
6. ✅ Scrape jobs
7. ✅ Analyze matches (AI)
8. ✅ Get approval queue
9. ✅ Approve match
10. ✅ Get stats

### Tests Unitarios
```bash
source venv/bin/activate
pytest backend/tests/ -v
```

Cobertura:
- ✅ Auth (register, login)
- ✅ Jobs CRUD
- ✅ User profiles
- ✅ Error handling

---

## 📊 API Endpoints

### CV Management (`/api/cv`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/upload` | Sube CV (PDF/TXT) |
| POST | `/extract` | Extrae datos con AI |
| POST | `/generate-profiles` | Genera 3 perfiles |
| GET | `/profiles` | Lista perfiles |
| GET | `/data` | Ver datos extraídos |

### Job Matching (`/api/matches`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/analyze-job/{job_id}` | Calcula matches |
| GET | `/queue?min_score=70` | Cola aprobación |
| PUT | `/{match_id}/decide` | Approve/reject |
| GET | `/stats` | Estadísticas |

### Jobs (`/api/jobs`, `/api/scraper`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/jobs/` | Lista trabajos |
| POST | `/scraper/scrape` | Scrape remoto |
| POST | `/agent/apply/{job_id}` | Aplica con bot |

**Documentación completa**: http://localhost:8000/docs

---

## 🔧 Configuración

### Requisitos
- Python 3.12+
- Node.js 18+
- 1GB RAM mínimo
- Chrome/Chromium (para Playwright)

### Variables de Entorno (`.env`)

```bash
# AI API Key (requerido para CV extraction)
GROQ_API_KEY=gsk_your_key_here  # Get free at console.groq.com

# Authentication
JWT_SECRET_KEY=your-secret-key  # Generate: openssl rand -hex 32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200

# Database
DATABASE_URL=sqlite:///./nidus.db
```

### Instalación Manual

```bash
# 1. Clone repo
git clone <repo-url>
cd Nidus

# 2. Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Frontend
npm install

# 4. Configure .env
cp .env.example .env
# Edit .env with your keys

# 5. Start
./start_dev.sh
```

---

## 🐛 Troubleshooting

### "GROQ_API_KEY not configured"
```bash
# Get free API key
1. Go to: https://console.groq.com
2. Register/Login
3. Create API Key
4. Add to .env: GROQ_API_KEY=gsk_...
```

### Backend no inicia
```bash
# Check logs
tail -f /tmp/nidus_backend.log

# Kill existing process
pkill -f uvicorn
lsof -ti:8000 | xargs kill -9
```

### Frontend no inicia
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check logs
tail -f /tmp/nidus_frontend.log
```

### Database issues
```bash
# Reset (WARNING: deletes all data)
rm nidus.db
python -m uvicorn backend.main:app --reload
```

---

## 📁 Estructura del Proyecto

```
Nidus/
├── backend/
│   ├── main.py                 # FastAPI app + routes
│   ├── models.py               # SQLAlchemy models
│   ├── routes_cv.py            # CV management endpoints
│   ├── routes_matching.py      # AI matching endpoints
│   ├── agent.py                # Playwright bot
│   ├── database.py             # DB connection
│   ├── auth.py                 # JWT helpers
│   └── tests/                  # Pytest tests
│       ├── test_auth.py
│       ├── test_jobs.py
│       └── test_users.py
├── src/
│   ├── App.jsx                 # React main component
│   ├── components/             # UI components
│   │   ├── JobBoard.jsx        # Job listing (legacy)
│   │   ├── CVOptimizer.jsx
│   │   └── ...
│   └── main.jsx                # React entry point
├── scripts/
│   └── test_cv_workflow.sh     # E2E test script
├── docs/
│   └── (documentation files)
├── start_dev.sh                # Development starter
├── README_CV_WORKFLOW.md       # API guide
├── requirements.txt            # Python deps
├── package.json                # Node deps
└── .env                        # Config (git ignored)
```

---

## 📈 Roadmap

### v2.1 (Feb 2026)
- [ ] UI refactor completo
- [ ] Onboarding flow
- [ ] Approval queue dashboard
- [ ] Profile manager

### v2.2 (Mar 2026)
- [ ] Background scraper (cron)
- [ ] Auto-matching on scrape
- [ ] Email notifications

### v2.3 (Abr 2026)
- [ ] Cover letter generation
- [ ] Multi-platform support (Indeed, Glassdoor)
- [ ] Analytics dashboard

### v3.0 (Q2 2026)
- [ ] Multi-tenant SaaS
- [ ] Premium features
- [ ] Mobile app

---

## 🤝 Contribuir

### Setup Development
```bash
git clone <repo>
cd Nidus
./start_dev.sh
```

### Agregar Features
1. Fork repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open PR

### Code Style
- **Python**: PEP 8, type hints, docstrings
- **JavaScript**: ESLint + Prettier
- **Commits**: Conventional Commits

---

## 📝 Changelog

### v2.0.0 (Enero 2026)
- 🎉 **Major refactor**: CV-driven automation
- ✅ CV upload + AI extraction
- ✅ Multi-profile system (3 variations)
- ✅ AI job matching (scores 0-100)
- ✅ Approval queue workflow
- ✅ Enhanced database models
- ✅ New API endpoints

### v1.0.0 (Pre-refactor)
- Basic auth + job board
- Manual job entry (Kanban)
- Single profile per user
- Simple Playwright bot

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Docs**: `/docs` folder + `README_CV_WORKFLOW.md`
- **API Reference**: http://localhost:8000/docs
- **Logs**: `/tmp/nidus_*.log`

---

## ⭐ Créditos

**Tecnologías**:
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [Groq](https://groq.com/) - AI inference
- [Playwright](https://playwright.dev/) - Browser automation

**Inspiración**: Simplificar la búsqueda de empleo con IA accesible.

---

<div align="center">

**Made with ❤️ by the Nidus Team**

[⬆ Back to Top](#nidus---cv-driven-job-application-automation-)

</div>
>>>>>>> Stashed changes
