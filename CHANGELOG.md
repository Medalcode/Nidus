# Changelog

Todas las mejoras notables del proyecto se documentan en este archivo.

## [2.0.0] - 2026-01-09

### ✨ Agregado

#### PWA (Progressive Web App)

- ✅ Service Worker para funcionamiento offline
- ✅ Web App Manifest con metadata completa
- ✅ Iconos SVG personalizados (192x192 y 512x512)
- ✅ Instalable como aplicación nativa
- ✅ Shortcuts de app para acceso rápido

#### Modo Oscuro/Claro

- ✅ Sistema de temas con CSS Variables
- ✅ Toggle visual en la esquina superior derecha
- ✅ Persistencia de preferencia en localStorage
- ✅ Transiciones suaves entre temas
- ✅ Soporte para tema claro y oscuro

#### Internacionalización (i18n)

- ✅ Sistema de traducciones con Context API
- ✅ Soporte para Español e Inglés
- ✅ Toggle de idioma con indicador visual
- ✅ Persistencia de preferencia de idioma
- ✅ Más de 50 strings traducidos

#### Mejoras de Funcionalidad

- ✅ Exportar datos del tablero a JSON
- ✅ Importar datos desde archivo JSON
- ✅ Mejor manejo de errores con mensajes específicos
- ✅ Timeouts en todas las llamadas a API
- ✅ Feedback visual al copiar texto

#### Accesibilidad

- ✅ ARIA labels en todos los controles interactivos
- ✅ Roles semánticos (alert, region)
- ✅ Labels asociados correctamente con inputs
- ✅ Navegación por teclado mejorada

#### Testing (Setup Básico)

- ✅ Configuración de Vitest
- ✅ React Testing Library setup
- ✅ Test de ejemplo para App component
- ✅ Scripts npm para ejecutar tests

#### Documentación

- ✅ README ampliado con nuevas características
- ✅ Archivo TESTING.md con guía de tests
- ✅ .env.example con variables de entorno
- ✅ Configuración de VS Code recomendada
- ✅ Roadmap actualizado

### 🐛 Corregido

- ✅ Error de timeout en requests del backend (agregado timeout=10s)
- ✅ Manejo de excepciones mejorado con `from e`
- ✅ Variable `selectedJob` no definida en JobBoard
- ✅ Mejor manejo de errores en CVOptimizer (401, 429, timeout)

### 🎨 Mejorado

- ✅ SEO con meta tags completas (Open Graph, Twitter Cards)
- ✅ Favicon actualizado con icono personalizado
- ✅ .gitignore mejorado con Python y env files
- ✅ Prettier config para consistencia de código
- ✅ CSS con variables para temas
- ✅ index.html con lang="es" y mejor metadata

### 📦 Dependencias Agregadas (Opcionales)

Para tests (instalar manualmente si se desea):

- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- @vitest/ui
- vitest
- jsdom

## [1.0.0] - Versión Inicial

- Tablero Kanban con drag & drop
- Optimizador de CV con IA (Groq/Llama 3)
- Simulador de entrevistas
- Analytics y métricas
- Scraper de ofertas (RemoteOK)
- Backend con FastAPI
- Frontend con React + Vite
