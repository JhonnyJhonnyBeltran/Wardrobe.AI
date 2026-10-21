# DOCUMENTO DE CONTEXTO ESTRATÉGICO Y TÉCNICO - KLOZET

## 1. Visión General del Proyecto

Klozet (klozet.es) no es solo un "armario virtual". Es una red social de moda con una estética premium ("quiet luxury", inspirada en Pinterest e Instagram) que integra un armario digital y un asistente de IA llamado Kloe. 

El valor principal de la app no reside únicamente en organizar ropa, sino en la validación social y en ser una herramienta de creación de contenido para que los usuarios (y creadoras de contenido) puedan exportar sus outfits a plataformas como Instagram.

**Tech Stack Principal:** Vercel (Frontend), Supabase / PostgreSQL (Backend/BBDD), Google Cloud / Gemini API (IA multimodal).

**Modelo de Negocio Actual:** Freemium. 8 usos diarios de IA gratis, luego plan premium de 2,99€/mes.

---

## 2. Puntos de Dolor (Cuellos de Botella Críticos)

### A. Riesgo de Quiebra por Costes de IA (El mayor peligro)
* **Problema:** El modelo multimodal de Gemini consume muchos tokens al analizar imágenes. Si ofrecemos 8 llamadas gratuitas diarias y escalamos a 1000 usuarios gratuitos, el coste de Google Cloud anulará por completo los ingresos de los pocos usuarios premium (2,99€).
* **Impacto Técnico:** Estamos subsidiando a los usuarios gratuitos con nuestro propio bolsillo.

### B. Límites de Infraestructura (Vercel & Supabase)
* **Problema:** Un feed social tipo "masonry" con miles de fotos en alta resolución de outfits y prendas consumirá el ancho de banda y almacenamiento del tier gratuito/hobby de Vercel y Supabase muy rápido.

### C. El Infierno del Onboarding (Fricción del usuario)
* **Problema:** Subir fotos de prendas, quitar fondos y categorizar da pereza. Si la app exige esto como primer paso, el 90% de los usuarios abandonará.

### D. El Síndrome de la Red Social Vacía (Cold Start)
* **Problema:** Si un usuario entra y el feed no tiene contenido curado, no hay incentivo para interactuar, dar likes o crear outfits.

---

## 3. Plan de Acción y Requisitos de Desarrollo

### Prioridad 1: Blindar la Infraestructura y Costes (Backend)
1. **Control estricto de cuotas en Backend:** La limitación de usos gratuitos de IA DEBE estar en el backend (PostgreSQL / Supabase persistente), nunca en memoria volátil de Vercel. Aplicar cuotas tanto a Kloe Chat como a `POST /api/analyze-clothing`.
2. **Caché de Imágenes/IA (Evitar llamadas duplicadas):** Hash SHA-256 de imagen para guardar resultados previos de análisis en base de datos. Si una imagen ya fue analizada, devolver el análisis desde caché en 2ms con coste $0 de Gemini.
3. **Optimización Agresiva en Frontend:** Compresión de imágenes en el navegador del cliente antes de subir la foto a Supabase o mandarla a Gemini (máx 800px, JPEG/WebP <80KB).
4. **Delegar IA de bajo coste:** Quitar fondos en el cliente local con `@imgly/background-removal`, reservando Gemini exclusivamente para clasificación semántica imprescindible.

### Prioridad 2: Herramienta de Creadores (Viralidad y Exportación)
1. **Exportación nativa a IG Stories (Frontend):** Funcionalidad mediante `html2canvas` para descargar cualquier post u outfit en alta resolución en formatos 9:16 (Stories/Reels) y 4:5 (Feed vertical de Instagram).
2. **Marca de agua elegante:** Inclusión sutil y estética ("Curated on Klozet" / `@klozet.es`) para generar viralidad orgánica gratuita.

### Prioridad 3: UX de "Kloe" (El Asistente)
1. **Integración profunda de contexto:** Kloe acepta como input de contexto prendas del armario propio y posts guardados del feed.
2. **Call to Action directo:** Cuando Kloe genera un outfit en el chat, renderizar botones interactivos nativos ("Guardar en armario" y "Publicar en el feed").

### Prioridad 4: Preparación para Nuevo Modelo de Negocio (Afiliados)
1. **Arquitectura de Afiliados:** Campos `affiliate_url`, `brand_domain`, `purchase_price` y `shop_url` en la base de datos para enlazar prendas con tiendas externas (Amazon, Awin, Zara, Inditex) y monetizar con comisiones "Shop the Look / Shop the Vibe".
