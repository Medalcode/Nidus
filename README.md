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
```

## ☁️ Google Cloud Run

Despliegue en un comando:

```bash
gcloud run deploy nidius-suite --source . --region us-central1 --allow-unauthenticated
```

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
