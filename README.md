# Wardrobe.AI 👗✨

**Tu asistente personal de moda impulsado por IA**

Una aplicación móvil inteligente que combina un armario digital con un asistente de IA para gestionar tu vestuario y generar outfits personalizados.

> 🎨 **Nueva funcionalidad**: Procesamiento de imágenes 100% en el navegador con IA (remoción de fondo, enderezamiento automático, normalización). Sin servidores, totalmente privado y gratuito. Ver [docs/IMAGE_PROCESSING_FRONTEND.md](docs/IMAGE_PROCESSING_FRONTEND.md)

---

## 🎯 MVP - Funcionalidades Principales

### 1. 👕 Armario Personal Digital

- **Añadir prendas por foto**: Sube una foto, la IA extrae la prenda en 2D y autocompleta información
- **Importar desde tiendas**: Pega URL de Zara, Bershka, H&M, etc. y se extrae automáticamente
- **Entrada manual**: Sube imagen desde galería y completa formulario
- **Información por prenda**: Categoría, color, temporada, material, tags, etc.
- **Filtros y organización**: Por categoría, color, temporada

### 2. 💬 Chatbot de Recomendaciones con IA

- **Conversación natural**: Habla con tu asistente de moda personal
- **Contexto inteligente**: Entiende clima, ocasión, estilo
- **Recomendaciones personalizadas**: Solo sugiere prendas de tu armario
- **Ejemplos de uso**:
  - "Hoy salgo con una chica, hace fresco, ¿qué me pongo?"
  - "Con esta prenda [imagen], ¿qué combina para una tarde de amigos?"

### 3. ✨ Generador de Outfits Automático

- **Generación instantánea**: Sin necesidad de chatear
- **Filtros múltiples**: Temporada, ocasión, clima, prenda específica, estilo
- **Múltiples opciones**: Regenera hasta encontrar el outfit perfecto
- **Edición manual**: Cambia prendas individuales del outfit generado

### 4. 💾 Outfits Guardados

- Guarda tus combinaciones favoritas
- Organiza por carpetas y tags
- Acceso rápido a tus looks más usados

---

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI**: React + TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Estado**: Zustand

### Backend

- **API Routes**: Next.js API Routes
- **Base de datos**: (Por definir: Supabase / PostgreSQL)
- **Storage**: (Por definir: AWS S3 / Cloudinary)

### IA y ML

- **Chatbot**: OpenAI GPT-4 / Claude API
- **Procesamiento de imágenes**:
  - Eliminación de fondo: Rembg / Remove.bg API
  - Clasificación: Vision AI
- **Web Scraping**: Puppeteer / Cheerio
- **Generador de outfits**: Algoritmo personalizado + IA

---

## 📱 Estructura del Proyecto

```
Wardrobe.AI/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Dashboard principal
│   ├── auth/                # Autenticación
│   ├── closet/              # Armario personal
│   ├── chat/                # Chatbot IA
│   ├── create/              # Generador de outfits
│   ├── profile/             # Perfil de usuario
│   └── api/                 # API Routes
│       ├── outfits/         # CRUD outfits
│       └── scrape-product/  # Scraping tiendas
├── components/              # Componentes React
│   ├── AddItemModal.tsx    # Modal añadir prenda
│   ├── ClothingItem.tsx    # Card de prenda
│   ├── OutfitCard.tsx      # Card de outfit
│   └── SlotMachineGenerator.tsx  # Generador visual
├── lib/                     # Utilidades y lógica
│   └── fashion/            # Sistema de moda
│       ├── outfitGenerator.ts
│       ├── webScraper.ts
│       └── aiExtractor.ts
├── types/                   # TypeScript types
│   ├── clothing.ts
│   ├── outfit.ts
│   └── user.ts
├── services/               # Servicios externos
│   └── backgroundRemoval.ts
└── python/                 # Python server
    └── bg_removal_server.py
```

---

## 🚀 Instalación y Setup

### Requisitos Previos

- Node.js 18+
- npm o pnpm
- Python 3.8+ (para eliminación de fondo)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd Wardrobe.AI

# Instalar dependencias Node.js
npm install

# Instalar dependencias Python
cd python
pip install -r requirements.txt
cd ..

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves de API
```

### Variables de Entorno Necesarias

```env
# OpenAI / Claude API
OPENAI_API_KEY=tu_clave_aqui
# o
ANTHROPIC_API_KEY=tu_clave_aqui

# Base de datos (cuando se implemente)
DATABASE_URL=postgresql://...

# Storage (cuando se implemente)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
```

### Ejecutar en Desarrollo

```bash
# Solo necesitas esto - todo funciona en el navegador
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

**Nota**: El procesamiento de imágenes (remoción de fondo, enderezamiento, etc.) ahora funciona 100% en el navegador usando IA con WebAssembly. No se requiere servidor Python.

---

## 📋 Roadmap del MVP

### Fase 1: Core Infrastructure ✅

- [x] Setup de Next.js + TypeScript
- [x] Estructura de carpetas
- [x] Sistema de tipos
- [ ] Autenticación básica

### Fase 2: Armario Personal 🔄

- [ ] CRUD de prendas
- [ ] Upload de imágenes
- [ ] Integración eliminación de fondo
- [ ] Scraping de tiendas (Zara, Bershka, H&M)
- [ ] Filtros y búsqueda

### Fase 3: IA y Chatbot 📅

- [ ] Integración con GPT-4/Claude
- [ ] Sistema de contexto (armario del usuario)
- [ ] Interfaz de chat
- [ ] Análisis de imágenes en conversación

### Fase 4: Generador de Outfits 📅

- [ ] Algoritmo de generación
- [ ] Filtros avanzados
- [ ] Sistema de guardado
- [ ] Edición manual de outfits

### Fase 5: Testing y Refinamiento 📅

- [ ] Testing con usuarios
- [ ] Optimización de rendimiento
- [ ] Ajustes de UX/UI
- [ ] Bug fixes

---

## 🎨 Paleta de Colores

```css
/* Light Mode */
--brand-pink: #FF6B9D
--brand-pink-dark: #FF5588
--background: #FAFAFA
--foreground: #1A1A1A

/* Dark Mode */
--brand-pink: #FF6B9D
--brand-pink-dark: #FF5588
--background: #0A0A0A
--foreground: #FAFAFA
```

---

## 📝 Documentación Adicional

- [MVP Definition](MVP_DEFINITION.md) - Definición completa del MVP
- [Fashion Data Pipeline](docs/FASHION_DATA_PIPELINE.md) - Sistema de datos de moda
- [Outfit Generator](docs/OUTFIT_GENERATOR.md) - Algoritmo de generación
- [Scraping System](docs/SCRAPING_SYSTEM.md) - Sistema de web scraping

---

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Contribuciones, sugerencias y feedback son bienvenidos.

---

## 📄 Licencia

[Por definir]

---

**Versión**: MVP 1.0  
**Última actualización**: 3 de enero de 2026
