# 🚀 Nidus CV-Driven Automation Workflow

## 🎯 Visión del Sistema

Nidus es un sistema automatizado de postulación a empleos que:
1. **Extrae** datos estructurados de tu CV usando IA
2. **Genera** 1-3 perfiles personalizados (Frontend/Backend/Fullstack)
3. **Escanea** ofertas de trabajo automáticamente
4. **Calcula** matches IA entre trabajos y tus perfiles
5. **Te permite aprobar** qué trabajos aplicar
6. **Aplica automáticamente** con el perfil correcto

---

## 📋 Flujo Completo

```
┌─────────────┐
│  1. Upload  │  Subir CV (PDF/TXT)
│     CV      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. Extract │  IA extrae: skills, experience, education, etc.
│    Data     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. Generate│  IA crea 3 perfiles optimizados:
│   Profiles  │  - Frontend Developer (React/TypeScript)
└──────┬──────┘  - Backend Developer (Python/Node.js)
       │         - Fullstack Developer (MERN/Django)
       ▼
┌─────────────┐
│  4. Auto    │  Scraper encuentra trabajos (background job)
│   Scrape    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. AI      │  IA calcula match score (0-100) para cada
│   Match     │  combinación job × profile
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  6. Approval│  Revisas matches >70 y apruebas/rechazas
│    Queue    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  7. Auto    │  Bot aplica con el perfil correcto + logs
│    Apply    │
└─────────────┘
```

---

## 🔧 API Endpoints

### **CV Management** (`/api/cv`)

#### 1️⃣ Subir CV
```bash
POST /api/cv/upload
Content-Type: multipart/form-data

file: tu_cv.txt (o .pdf)
```

**Respuesta:**
```json
{
  "id": 1,
  "raw_text": "John Doe\nSoftware Engineer...",
  "message": "CV uploaded successfully. Use /extract to parse it with AI."
}
```

---

#### 2️⃣ Extraer Datos con IA
```bash
POST /api/cv/extract
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "message": "CV data extracted successfully",
  "data": {
    "personal_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "linkedin": "linkedin.com/in/johndoe",
      "github": "github.com/johndoe",
      "location": "San Francisco, CA"
    },
    "skills": ["React", "Python", "Docker", "PostgreSQL", "FastAPI"],
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Senior Developer",
        "duration": "2020 - Present",
        "description": "Led development of microservices...",
        "achievements": ["Reduced latency by 40%", "Mentored 5 developers"]
      }
    ],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "institution": "Stanford University",
        "year": "2018"
      }
    ]
  }
}
```

---

#### 3️⃣ Generar Perfiles Personalizados
```bash
POST /api/cv/generate-profiles
Content-Type: application/json

{
  "profile_types": ["frontend", "backend", "fullstack"]
}
```

**Respuesta:**
```json
{
  "message": "Generated 3 profiles",
  "profiles": [
    "Senior Frontend Developer (React/TypeScript Specialist)",
    "Backend Engineer (Python/FastAPI Expert)",
    "Fullstack Developer (MERN Stack)"
  ]
}
```

---

#### 4️⃣ Ver Perfiles Generados
```bash
GET /api/cv/profiles
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "profile_type": "frontend",
    "profile_name": "Senior Frontend Developer (React/TypeScript Specialist)",
    "summary": "Passionate frontend developer with 5+ years building modern web apps...",
    "tailored_skills": ["React", "TypeScript", "Redux", "Webpack", "Jest"],
    "is_active": true,
    "auto_apply": false
  }
]
```

---

### **Job Matching** (`/api/matches`)

#### 5️⃣ Analizar Match de un Job
```bash
POST /api/matches/analyze-job/job_12345
```

**Respuesta:**
```json
{
  "message": "Analyzed 3 profiles",
  "best_match": {
    "profile": "Senior Frontend Developer (React/TypeScript Specialist)",
    "score": 87
  },
  "all_matches": [
    {"profile": "Frontend Developer", "score": 87},
    {"profile": "Fullstack Developer", "score": 72},
    {"profile": "Backend Developer", "score": 45}
  ]
}
```

---

#### 6️⃣ Ver Cola de Aprobación
```bash
GET /api/matches/queue?min_score=70
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "job_id": "job_12345",
    "job_title": "Senior React Developer",
    "company": "TechCorp",
    "profile_name": "Frontend Developer (React)",
    "match_score": 87,
    "match_reasoning": "Strong match: candidate has 5 years React experience...",
    "skill_match_details": {
      "matched": ["React", "TypeScript", "Redux"],
      "missing": ["GraphQL"],
      "bonus": ["Jest", "Cypress"]
    },
    "experience_fit": "Perfect",
    "is_recommended": true,
    "status": "pending_review"
  }
]
```

---

#### 7️⃣ Aprobar/Rechazar Match
```bash
PUT /api/matches/1/decide
Content-Type: application/json

{
  "decision": "approve"  // o "reject"
}
```

**Respuesta:**
```json
{
  "message": "Approved! Job will be queued for automated application...",
  "match_id": 1,
  "new_status": "user_approved"
}
```

---

#### 8️⃣ Ver Estadísticas
```bash
GET /api/matches/stats
```

**Respuesta:**
```json
{
  "total_jobs": 25,
  "pending_review": 8,
  "approved": 12,
  "rejected": 3,
  "applied": 10,
  "avg_match_score": 73.5
}
```

---

## 🧪 Ejemplo de Uso Completo

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secure123", "full_name": "John Doe"}'

# 2. Login y obtener token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secure123"}' \
  | jq -r '.access_token')

# 3. Subir CV
curl -X POST http://localhost:8000/api/cv/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@mi_cv.txt"

# 4. Extraer datos con IA
curl -X POST http://localhost:8000/api/cv/extract \
  -H "Authorization: Bearer $TOKEN"

# 5. Generar 3 perfiles
curl -X POST http://localhost:8000/api/cv/generate-profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_types": ["frontend", "backend", "fullstack"]}'

# 6. Ver perfiles generados
curl -X GET http://localhost:8000/api/cv/profiles \
  -H "Authorization: Bearer $TOKEN"

# 7. Scrapear trabajos (manual por ahora)
curl -X POST http://localhost:8000/api/scraper/scrape \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source": "remoteok", "keyword": "react", "limit": 10}'

# 8. Analizar match de un job
curl -X POST http://localhost:8000/api/matches/analyze-job/job_12345 \
  -H "Authorization: Bearer $TOKEN"

# 9. Ver cola de aprobación (matches >70)
curl -X GET http://localhost:8000/api/matches/queue?min_score=70 \
  -H "Authorization: Bearer $TOKEN"

# 10. Aprobar un match
curl -X PUT http://localhost:8000/api/matches/1/decide \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision": "approve"}'

# 11. Ver estadísticas
curl -X GET http://localhost:8000/api/matches/stats \
  -H "Authorization: Bearer $TOKEN"

# 12. Aplicar automáticamente (bot)
curl -X POST http://localhost:8000/api/agent/apply/job_12345 \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚙️ Configuración Requerida

### 1. GROQ API Key
Obtén tu key gratuita en https://console.groq.com

```bash
# .env
GROQ_API_KEY=gsk_your_actual_key_here
```

### 2. JWT Secret
```bash
# .env
JWT_SECRET_KEY=your-super-secret-key-change-in-production
```

---

## 🎨 UI (Próximamente)

La UI refactorizada tendrá:

1. **Onboarding Flow**
   - Upload CV (drag & drop)
   - Vista previa de datos extraídos
   - Edición de perfiles generados

2. **Dashboard Principal**
   - Cola de aprobación (cards con score)
   - Filtros: score mínimo, tipo de perfil, empresa
   - Quick approve/reject buttons

3. **Gestor de Perfiles**
   - Ver/editar 3 perfiles
   - Toggle active/inactive
   - Enable/disable auto-apply

4. **Panel de Automatización**
   - Estadísticas en tiempo real
   - Gráficos de matches
   - Timeline de aplicaciones

---

## 🔄 Diferencias vs Sistema Anterior

| Anterior | Nuevo (CV-Driven) |
|----------|-------------------|
| Usuario crea jobs manualmente | Scraper automático en background |
| Kanban (wishlist → applied) | Cola de aprobación (pending → approved → applied) |
| 1 perfil global | 3 perfiles personalizados por job type |
| Sin matching IA | Match score 0-100 + reasoning |
| Aplica con mismo perfil siempre | Selecciona mejor perfil por job |
| Usuario decide qué aplicar | IA recomienda + usuario aprueba |

---

## 🚧 Estado Actual

✅ **Fase 1: Backend** (Completado)
- Modelos: CVData, CVProfile, JobMatch
- Endpoints: CV upload/extract/generate-profiles
- Endpoints: Matching analyze/queue/decide/stats

⏳ **Fase 2: UI** (En progreso)
- Onboarding flow
- Approval queue dashboard
- Profile manager

⏳ **Fase 3: Automatización** (Pendiente)
- Background scraper (cron job)
- Auto-matching on scrape
- Bot con selección de perfil

⏳ **Fase 4: Migración** (Pendiente)
- Script de migración de datos existentes
- Backward compatibility

---

## 📚 Recursos

- **API Docs**: http://localhost:8000/docs
- **Groq Console**: https://console.groq.com
- **Playwright Docs**: https://playwright.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**Última actualización**: 9 de enero de 2026
