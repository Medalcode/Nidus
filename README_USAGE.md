# 🚀 Nidus - CV-Driven Job Application System

## ✨ Sistema de Automatización con IA v2.1

Sistema completo para automatizar postulaciones con inteligencia artificial. Sube tu CV, genera perfiles optimizados y deja que la IA encuentre los mejores matches.

---

## 🎯 Flujo de Usuario Completo

### 1. **Autenticación**

- Regístrate o inicia sesión desde cualquier vista
- JWT tokens para seguridad
- Sesión persistente

### 2. **CV Upload** 📄

- Sube tu CV en formato PDF o TXT (máximo 5MB)
- Drag & drop o selector de archivos
- Extracción automática con IA (Groq/Llama 3.3 70B)
- Preview de datos extraídos

### 3. **Profile Generator** 🎨

- Selecciona hasta 3 tipos de perfiles:
  - 🎨 **Frontend**: React, Vue, Angular, UI/UX
  - ⚙️ **Backend**: Python, Node.js, APIs, Databases
  - 🔧 **Fullstack**: MERN, Django, etc.
  - 🚀 **DevOps**: Docker, K8s, CI/CD
- Generación con IA (20-30 segundos)
- Skills optimizados según tipo
- Resumen profesional personalizado

### 4. **Job Scraping** 🔍

_(El backend scrapeará automáticamente o manualmente con el botón)_

- Scraping de LinkedIn, Indeed, etc.
- Análisis de descripción y skills
- Almacenamiento en base de datos

### 5. **AI Matching** 🤖

_(Automático después del scraping)_

- Análisis de cada trabajo vs tus perfiles
- Puntaje de match (0-100)
- Razonamiento detallado
- Skill matching (matched/missing/bonus)

### 6. **Approval Queue** ✅

- Cola de trabajos filtrados por score mínimo
- Tarjetas con información completa
- Color-coding por nivel de match:

  - 🔥 **85+**: Excelente (verde)
  - ✨ **75-84**: Muy Bueno (azul)
  - 👍 **65-74**: Bueno (morado)
  - ⭐ **60-64**: Aceptable (naranja)

- Acciones:
  - ✓ **Aprobar**: Marca para aplicación
  - ✗ **Rechazar**: Descarta el match
  - 👁️ **Detalles**: Modal con info completa

### 7. **Auto-Application** 🎯

_(Futuro - Playwright automation)_

- Aplicación automática a trabajos aprobados
- Seguimiento de estado

---

## 🛠️ Stack Técnico

### Backend

- **FastAPI**: REST API
- **SQLAlchemy + SQLite**: Base de datos
- **Groq API**: Llama 3.3 70B (extracción y matching)
- **Playwright**: Browser automation (futuro)
- **Python 3.12**: pyenv

### Frontend

- **React 19.2**: UI Components
- **Vite 7.2**: Build tool
- **Tailwind CSS**: Styling
- **Lucide React**: Iconos

---

## 📦 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/Medalcode/Nidus.git
cd Nidus
```

### 2. Backend Setup

```bash
# Instalar Python 3.12 con pyenv
pyenv install 3.12
pyenv local 3.12

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cat > .env << EOF
DATABASE_URL=sqlite:///./nidus.db
SECRET_KEY=$(openssl rand -hex 32)
GROQ_API_KEY=tu_clave_groq_aqui
EOF
```

**IMPORTANTE**: Obtén tu API key de Groq en https://console.groq.com/

### 3. Frontend Setup

```bash
npm install
```

### 4. Inicializar Base de Datos

```bash
# Desde backend/
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
```

---

## 🚀 Uso Diario

### Opción A: Script Automático

```bash
./start_dev.sh
```

Inicia backend (puerto 8000) y frontend (puerto 5173) automáticamente.

### Opción B: Manual

**Terminal 1 - Backend:**

```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

**Acceder:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Docs interactivos: http://localhost:8000/docs

---

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### CV Management

- `POST /api/cv/upload` - Subir CV
- `POST /api/cv/extract` - Extraer datos con IA
- `POST /api/cv/generate-profiles` - Generar perfiles
- `GET /api/cv/profiles` - Listar perfiles
- `GET /api/cv/data` - Ver datos extraídos

### Job Matching

- `POST /api/matches/analyze-job/{job_id}` - Analizar match
- `GET /api/matches/queue?min_score=70` - Cola de aprobación
- `PUT /api/matches/{id}/decide` - Aprobar/rechazar
- `GET /api/matches/stats` - Estadísticas

### Jobs

- `GET /api/jobs` - Listar trabajos
- `POST /api/jobs` - Crear trabajo
- `GET /api/jobs/{id}` - Detalles
- `PUT /api/jobs/{id}` - Actualizar
- `DELETE /api/jobs/{id}` - Eliminar

Ver documentación completa: [README_CV_WORKFLOW.md](README_CV_WORKFLOW.md)

---

## 🧪 Testing

### Test E2E Automatizado

```bash
./scripts/test_cv_workflow.sh
```

Prueba completo:

1. Registro de usuario
2. Login
3. Upload CV
4. Extracción IA
5. Generación de perfiles
6. Scraping de jobs
7. Matching AI
8. Aprobación de matches

### Test Manual

```bash
# Verificar backend
curl http://localhost:8000/health

# Test con usuario existente
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

---

## 📁 Estructura del Proyecto

```
Nidus/
├── backend/
│   ├── main.py              # Entry point FastAPI
│   ├── database.py          # SQLAlchemy config
│   ├── models.py            # Database models
│   ├── routes_auth.py       # Auth endpoints
│   ├── routes_cv.py         # CV endpoints
│   ├── routes_matching.py   # Matching endpoints
│   └── routes_jobs.py       # Jobs endpoints
├── src/
│   ├── App.jsx              # Main React app
│   ├── components/
│   │   ├── Auth.jsx         # Login/Register modal
│   │   ├── CVUpload.jsx     # Step 1: Upload CV
│   │   ├── ProfileGenerator.jsx  # Step 2: Generate profiles
│   │   ├── ApprovalQueue.jsx     # Step 3: Approve matches
│   │   ├── JobBoard.jsx     # Kanban board
│   │   ├── Analytics.jsx    # Stats dashboard
│   │   ├── CVOptimizer.jsx  # AI CV analyzer
│   │   └── InterviewSimulator.jsx  # Practice interviews
│   └── utils/
│       └── api.js           # API client
├── scripts/
│   └── test_cv_workflow.sh  # E2E testing
├── README_CV_WORKFLOW.md     # API documentation
├── STATUS.md                 # Current status & roadmap
└── start_dev.sh              # Development starter
```

---

## 🎨 Componentes UI

### CVUpload

- Drag & drop file upload
- File validation (PDF/TXT, 5MB max)
- AI extraction progress
- Data preview (personal info, skills, experience)

### ProfileGenerator

- Selección de tipos de perfil
- Generación con IA (loading spinner)
- Preview de perfiles generados
- Toggle active/inactive
- Navigation to approval queue

### ApprovalQueue

- Grid de match cards
- Score color-coding
- Filter by min score
- Approve/Reject/Details buttons
- Detailed match modal
- Real-time updates

---

## 🔧 Configuración Avanzada

### Groq API (Recomendado)

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

**Ventajas:**

- Velocidad ultrarrápida (500+ tokens/s)
- Contexto de 128k tokens
- API gratuita con rate limits generosos

### OpenAI (Alternativa)

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

### Scraping Configuration

```env
SCRAPER_ENABLED=true
SCRAPER_INTERVAL=3600  # 1 hora
SCRAPER_SITES=linkedin,indeed,remoteok
```

---

## 🐛 Troubleshooting

### Error: "Invalid authentication credentials"

- Verifica que el token JWT esté en localStorage
- Reloguea desde el botón "Ingresar"

### Error: "Groq API key not found"

- Configura `GROQ_API_KEY` en `.env`
- Reinicia el backend

### Error: "File too large"

- Máximo 5MB para CVs
- Comprime el PDF o usa TXT

### Frontend no carga componentes

```bash
npm install
npm run dev
```

### Backend no inicia

```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📈 Roadmap

### ✅ v2.1 (Actual)

- CV-driven automation system
- AI profile generation
- Job matching con Groq
- Approval queue UI

### 🚧 v2.2 (En desarrollo)

- [ ] Auto-application con Playwright
- [ ] Cover letter generation
- [ ] Email notifications
- [ ] Stats dashboard improvements

### 🔮 v3.0 (Futuro)

- [ ] Multi-platform scraping (LinkedIn, Indeed, etc.)
- [ ] Browser extension
- [ ] Mobile app
- [ ] Team collaboration

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una branch: `git checkout -b feature/nueva-feature`
3. Commit cambios: `git commit -m 'Add: nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 🙏 Agradecimientos

- **Groq**: API ultrarrápida de Llama 3.3
- **FastAPI**: Framework backend moderno
- **React**: UI library
- **Community**: Por feedback y contribuciones

---

## 📞 Soporte

- **Issues**: https://github.com/Medalcode/Nidus/issues
- **Discussions**: https://github.com/Medalcode/Nidus/discussions
- **Email**: medalcode@example.com

---

## 🌟 Star History

Si te gusta el proyecto, ¡dale una ⭐ en GitHub!

---

**Made with ❤️ by MedalCode**
