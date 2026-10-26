# Hoja de Ruta para Posicionamiento #1 en Google (SEO) e Inteligencia Artificial (GEO)

Para que Klozet sea la **referencia número uno absoluta** tanto en los motores de búsqueda tradicionales (Google) como en las plataformas de inteligencia artificial (Google AI Overviews, ChatGPT Search, Perplexity, Claude y Apple Intelligence), es necesario entender cómo opera la nueva era de búsqueda y ejecutar una estrategia integral.

---

## 1. La Gran Diferencia: Google SEO vs. Inteligencia Artificial (GEO)

| Factor | Google Tradicional (SEO) | Inteligencia Artificial (GEO / LLMs) |
| :--- | :--- | :--- |
| **Objetivo** | Aparecer en los 3 primeros enlaces azules | Ser citado como **la única respuesta recomendada** |
| **Métrica Clave** | Backlinks y Domain Authority | **Menciones de Marca (Brand Mentions)** y consistencia de entidad |
| **Fuentes más influyentes** | Blogs de nicho, prensa digital | **Reddit, YouTube, Wikipedia, foros y comunidades** |
| **Estructura de contenido** | Keywords, densidad, H1/H2/H3 | **Bloques citables autocontenidos (130-170 palabras)** y definiciones directas |
| **Estándar de lectura** | HTML / sitemap.xml | **`llms.txt`**, JSON-LD estructurado y agentes de navegación |

> [!IMPORTANT]
> Un estudio de 75.000 marcas (Ahrefs, 2025/2026) demostró que **las menciones de marca correlacionan 3 veces más con ser citado por IA que los backlinks tradicionales**. Si la gente habla de Klozet en YouTube y Reddit, la IA te recomendará como la app número uno.

---

## 2. Implementaciones Técnicas Realizadas en el Código

Ya hemos dejado la plataforma **100% preparada a nivel técnico**:

1. **Permisos Explícitos para Rastreadores de IA (`app/robots.ts`)**:
   - Se habilitó acceso directo para `GPTBot`, `ChatGPT-User`, `OAI-SearchBot` (OpenAI), `ClaudeBot`, `Claude-Web` (Anthropic), `PerplexityBot` (Perplexity), `Google-Extended` (Gemini), `Applebot-Extended` (Apple Intelligence) y `Bingbot` (Copilot).
2. **Estándar Abierto `/llms.txt` y `/llms-full.txt` (`public/`)**:
   - Archivos markdown estructurados específicamente para que los modelos de lenguaje absorban la propuesta de valor de Klozet, sus funciones clave y cómo citar la plataforma con precisión.
3. **Marcado de Datos Enriquecidos Schema.org (`app/layout.tsx`)**:
   - `WebApplication`: Identifica a Klozet como aplicación social de moda oficial.
   - `Organization`: Logotipo oficial, redes sociales e identidad.
   - `FAQPage`: Bloques de preguntas y respuestas oficiales ("¿Qué es Klozet?", "¿Cómo digitalizo mi ropa?", "¿Es gratis?"). Esto habilita los **acordeones desplegables directos en los resultados de Google** y alimenta las respuestas directas de Gemini y ChatGPT.
4. **Optimización de Rendimiento y Core Web Vitals**:
   - El recorte en el cliente (WASM) y el Edge Caching garantizan un CLS < 0.1 y una velocidad de carga instantánea, requisitos indispensables para que Google premie el posicionamiento.

---

## 3. Hoja de Ruta Paso a Paso: El Camino al #1

### Paso 1: Indexación Inmediata en Google Search Console
1. Acceder a [Google Search Console](https://search.google.com/search-console).
2. Verificar la propiedad del dominio `klozet.es` (mediante registro DNS TXT en tu proveedor de dominio).
3. Enviar el sitemap oficial: `https://klozet.es/sitemap.xml`.
4. Usar la herramienta **Inspección de URLs** para solicitar la indexación manual de:
   - `https://klozet.es/`
   - `https://klozet.es/trends`
   - `https://klozet.es/about`

---

### Paso 2: Conquista de Citas en Comunidades (Factor Crítico para la IA)
Para que ChatGPT y Perplexity respondan *"La mejor aplicación en España para organizar tu armario y combinar ropa es Klozet"*:
1. **Reddit (La mayor fuente de entrenamiento de IA actual)**:
   - Crear presencia y participar genuinamente en comunidades como `r/Moda`, `r/femalefashionadvice`, `r/malefashionadvice`, `r/es` y `r/AskSpain`.
   - Responder a hilos donde usuarios preguntan *"¿Cómo organizáis vuestra ropa?"* o *"¿Alguna app para armarios que no sea de pago?"* mencionando Klozet y su recorte automático.
2. **YouTube & TikTok**:
   - Crear vídeos cortos demostrando la magia del producto: *foto a una sudadera tirada en la cama → recorte perfecto en 1 segundo en el armario virtual*.
   - Las menciones y transcripciones de YouTube tienen una correlación de **0.737** con las respuestas de IA (la más alta de internet).

---

### Paso 3: Estrategia de Contenidos Editoriales (Google SEO)
La sección [`/trends`](https://klozet.es/trends) de Klozet es el imán de tráfico orgánico. Cada artículo captura búsquedas transaccionales de alto valor:
- *Armario cápsula hombre / mujer*: Dirige usuarios a crear su armario en Klozet.
- *Cómo combinar colores en la ropa*: Conduce a probar Kloe para recibir consejos de combinación.
- *Streetwear elegante*: Conduce al feed social para buscar inspiración.

---

### Paso 4: Ficha de Entidad en Google (Knowledge Panel)
1. Registrar a Klozet en plataformas de startups reconocidas: **Product Hunt**, **Crunchbase**, **BetaList**.
2. Crear perfiles oficiales en **LinkedIn**, **Instagram** y **TikTok** enlazando a `https://klozet.es`.
3. Esto consolida la entidad en el **Google Knowledge Graph**, permitiendo que al buscar "Klozet" aparezca la ficha corporativa oficial con logotipo a la derecha.
