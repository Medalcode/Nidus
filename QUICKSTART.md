# 🚀 Nidius Suite - Quick Start

## Instalación Rápida

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd Nidius

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local y agregar tu Groq API Key

# 5. Ejecutar backend (Terminal 1)
python backend/main.py

# 6. Ejecutar frontend (Terminal 2)
npm run dev
```

## Funcionalidades Principales

### ✅ Ya Implementadas

- ✅ **PWA** - Instalable y funciona offline
- ✅ **Modo Oscuro/Claro** - Toggle en esquina superior derecha
- ✅ **Multiidioma** - Español e Inglés
- ✅ **Tablero Kanban** - Con exportar/importar datos
- ✅ **Optimizador de CV** - Con IA (Groq/Llama 3)
- ✅ **Simulador de Entrevistas** - Roleplay con IA
- ✅ **Analytics** - Métricas y gráficos
- ✅ **Accesibilidad** - ARIA labels completos

### 🧪 Testing (Opcional)

Para instalar dependencias de testing:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui vitest jsdom
```

Ejecutar tests:

```bash
npm test
```

Ver guía completa en [TESTING.md](TESTING.md)

## 📱 Instalar como PWA

1. Abre la app en Chrome/Edge
2. Busca el icono "Instalar" en la barra de direcciones
3. Haz clic para instalar
4. ¡Disfruta de la app nativa!

## 🌓 Cambiar Tema

Haz clic en el icono de sol/luna en la esquina superior derecha.

## 🌍 Cambiar Idioma

Haz clic en el botón ES/EN en la esquina superior derecha.

## 📊 Exportar/Importar Datos

En el Tablero Kanban:

- **Exportar**: Icono de descarga
- **Importar**: Icono de nube

## 🎯 Configurar API Key

1. Ve a [console.groq.com](https://console.groq.com)
2. Crea una cuenta gratis
3. Genera una API Key
4. En la app: Tablero > Configuración > Pega tu API Key

## 📚 Documentación

- [README.md](README.md) - Documentación completa
- [CHANGELOG.md](CHANGELOG.md) - Historial de cambios
- [TESTING.md](TESTING.md) - Guía de testing

## 🐛 ¿Problemas?

1. Verifica que el backend esté corriendo en `localhost:8080`
2. Verifica que el frontend esté corriendo en `localhost:5173`
3. Asegúrate de tener una Groq API Key configurada
4. Revisa la consola del navegador para errores

## 🤝 Contribuir

Las contribuciones son bienvenidas. Ver [README.md](README.md#contribuir) para más detalles.
