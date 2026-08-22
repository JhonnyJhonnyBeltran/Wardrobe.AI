# Contexto del Proyecto - Wardrobe.AI

Este archivo sirve como fuente suprema de verdad para el proyecto Wardrobe.AI.

## Descripción
Wardrobe.AI es una plataforma de moda impulsada por IA que permite a los usuarios gestionar su armario, recibir consejos de estilo y generar outfits automáticos.

## Arquitectura
- **Frontend**: Next.js (App Router)
- **Estado**: Zustand
- **Backend/Base de Datos**: Supabase
- **Estilos**: CSS nativo y Framer Motion para animaciones.

## Reglas y Convenciones
- Mantener una estética premium y moderna.
- **Identidad Visual y Cohesión**: Mantener siempre la cohesión visual entre todas las pantallas de la aplicación. Antes de crear o modificar componentes, **añade un paso en tu proceso para revisar la identidad visual general** (ej. usa los mismos componentes como `OutfitCard` para mostrar outfits, mantén los estilos, márgenes, bordes y botones consistentes).
- Evitar placeholders en el código final.
- **Siempre comprobar que el código funciona y compila correctamente (ej. `npm run build`) antes de hacer commit y subirlo al repositorio remoto.**
- **No utilizar funciones nativas del navegador como `alert()` o `confirm()`. Utilizar siempre modales HTML/React o divs en la interfaz.**
- Documentar cambios significativos aquí o en archivos dedicados dentro de `./Obsidian`.

## Reglas de Agente (Antigravity)
- **Registro de Memoria (Bitácora Obligatoria)**: NUNCA asumas cosas a ciegas que puedan romper el código existente. Tienes prohibido sobreescribir o "cargarte" lógica sin apuntar lo que haces. Cuando hagas cambios complejos, repasa siempre qué has hecho y asegúrate de probar su impacto colateral. Usa tu propia memoria para garantizar la estabilidad.


## Onboarding
- El flujo de inicio rápido para nuevos usuarios está en `/onboarding/preferences` y consta de 3 pasos optimizados sin emojis ni textos informales:
  1. **Edad:** Selector deslizable interactivo (`age` numérico con cálculo automático de `age_range`).
  2. **Catálogo de Género:** Mujer, Hombre o Unisex/Mixto.
  3. **Estilos:** Catálogo extenso de 32 estilos con fotografías editoriales de personas reales que se adaptan dinámicamente según el género elegido (fotos de hombres si eligió hombre, mujeres si eligió mujer, o combinación equilibrada si eligió unisex).
- Al finalizar, se guarda en `profiles` actualizando `age`, `age_range`, `gender`, `preferred_styles`, `visual_style_preferences` y `style_completed = true`.
- Script SQL para la base de datos en `sql/onboarding_styles_and_age.sql`.

## Motor de Recomendaciones (Search)
- La pantalla de Búsqueda (`/search`) muestra por defecto los posts exploratorios ordenados por un algoritmo de afinidad multicriterio:
  - **Likes:** Ponderación base de popularidad.
  - **Morfología y Colorimetría:** Puntuación extra si coincide con el perfil del usuario.
  - **Afinidad de Estilos:** Coincidencia de etiquetas `style_ids` con `preferredStyles`.
  - **Afinidad de Edad:** Puntuación adicional según la cercanía de edad entre el usuario que busca y el autor del post (`age` y `age_range`), priorizando publicaciones de personas en rangos de edad similares.

## Funciones Premium (Roadmap)
- Existe una estrategia documentada para implementar un Asistente IA Personal como funcionalidad estrella. Ver [premium_ai_feature.md](./premium_ai_feature.md).

## Pendientes para Lanzamiento a Producción
- **Landing Page Pública (`app/page.tsx`)**: Crear una página de inicio real en lugar de redirigir directamente al login. Es un requisito obligatorio para Google.
- **Páginas Legales**: Redactar y publicar Términos de Servicio y Política de Privacidad.
- **Verificación de Google Cloud**: 
  - Registrar el dominio `klozet.es` en Google Search Console.
  - Solicitar y pasar el proceso de Verificación de Aplicación OAuth para eliminar la pantalla de "App no verificada" (Requiere la Landing Page y páginas legales).

## Arquitectura de Sesión y Auth (v2 - Agosto 2026)
- **Singleton Supabase Client** (`lib/supabase/client.ts`): El cliente se persiste en `window._klozetSupabaseClient` para evitar múltiples instancias GoTrue. En SSR se crea un cliente temporal (sin singleton).
- **UserStore** (`store/userStore.tsx`): 
  - Hidratación instantánea desde `localStorage` (`wardrobe_user_profile`) → `isLoading = false` inmediato si hay caché.
  - `hadCachedUserRef` controla si había sesión en caché para evitar redirects falsos.
  - `isLoading` sólo se activa en usuarios genuinamente nuevos (sin caché y sin `userIdRef`).
  - El perfil se obtiene de `profiles` (principal) con fallback a `users` (legacy) y fallback por email.
- **AuthGuard** (`components/AuthGuard.tsx`):
  - Si `user` existe, renderiza `{children}` inmediatamente.
  - Si no hay `user` y había caché: grace period de 3 segundos antes de redirigir (da tiempo al token refresh).
  - Si no hay `user` y no había caché: redirige a `/auth` inmediatamente.
- **Onboarding Google**: El callback `/auth/callback/route.ts` redirige a `/onboarding/username` si el perfil no tiene `username`. La página `/onboarding/username` verifica disponibilidad en tiempo real.
- **Username check en /profile/settings/personal**: Verificación debounced con indicador visual (verde/rojo). No permite guardar si el username está cogido.

- **Nueva Ruta de Outfits por Perfil (`/profile/[id]/outfit/[outfitId]`)**: Ruta contextual que vincula el look al perfil del creador (`@username` o `UUID`), cargando el usuario, el outfit, todas las prendas (`clothing_items`) interactivas y la sección *"Aparece en"* con acceso directo a posts.
- **Detalle de Outfit Directo (`/outfit/[id]`)**: Soporte y fallback directo para enlaces existentes.
- **Feed y Notificaciones en Móvil**: Eliminada la animación de movimiento/shimmer del skeleton en móvil para evitar saltos y vibraciones visuales molestas.
- **Likes en Búsqueda (`/search`)**: Consulta de likes del usuario sincronizada con Supabase para marcar con corazón rosa (`isLiked`) las publicaciones a las que el usuario ya dio like.
- **Motor de Recomendaciones Dinámico por Likes (`/search`)**: Extrae en tiempo real los estilos de los últimos 30 posts a los que el usuario dio like y aplica un multiplicador de afinidad dinámica (+2.5 a +8 pts extra) que se suma a las preferencias del perfil (+3 pts), morfología (+5), colorimetría (+5) y edad (+2 a +6).
- **Banner Inteligente de Gustos Detectados (`DiscoveredStyleBanner.tsx`)**: Banner con estética de glassmorphism premium (`backdrop-blur-xl`, bordes y sombras suaves idénticas al sistema de diseño de la app) que detecta estilos emergentes en el historial de likes del usuario y ofrece un botón de 1-toque para añadirlo instantáneamente a sus estilos favoritos del perfil.
- **Etiquetado de Estilos en Publicaciones (`/create-post`)**: Selector multi-etiqueta que permite asociar uno o varios estilos (ej: `y2k`, `techwear`, `streetwear`) a cada post, pre-cargando los estilos del usuario o del outfit vinculado y persistiendo `style_ids TEXT[]` en Supabase.
- **Gestión y Eliminación de Carpetas (`/profile` & `/api/save-folders`)**: Modal de confirmación con aviso explícito (*"Todas las publicaciones guardadas en esta carpeta se borrarán definitivamente de tus guardados"*). Al confirmar, la API elimina en cascada las asociaciones en `save_folder_items`, las publicaciones guardadas correspondientes en `saves` y la carpeta en `save_folders`.
- **Eliminación Total de Cuenta (`/api/user/delete`)**: Eliminación completa en cascada de comentarios, likes, guardados, carpetas, follows, notificaciones, mensajes, conversaciones vacías, outfits, prendas del armario, fotos en Storage (`avatars`, `clothing-images`), perfil en base de datos y registro de autenticación en `auth.users`.
- **Asistente y Estilista Kloe (`/closet/kloe` & `/api/closy/chat`)**: 
  - **Identidad de Marca**: Personaje e icono mascota oficial `kloe-avatar.png` (personaje rosa en forma de "K" con ojos expresivos), renderizado como icono flotante transparente sin burbujas ni fondos añadidos. Tono natural, humano y cercano, eliminando lenguaje técnico o robótico.
  - **Acceso desde Armario (`/closet`)**: Botón oficial nombrado *"Crear con IA"* con icono de mascota e indicador visual sutil, más banner orgánico contextual de recomendación.
  - **Animaciones Avanzadas de Chat**:
    - Animación flotante/pulsante del avatar de Kloe durante el pensamiento.
    - 3 puntos de carga con rebote elástico progresivo y textos dinámicos rotativos (*"Pensando en tu estilo..."*, *"Analizando las prendas de tu armario..."*, *"Buscando la combinación perfecta..."*).
    - Entrada con física spring elástica de los mensajes enviados del usuario y de las respuestas de Kloe.
  - **Ubicación y Navbar Activo**: Vive en la ruta `/closet/kloe`, manteniendo el icono central del Armario (`closet`) activo en el TabBar inferior y en la barra lateral (con redirección transparente desde `/closet/klosy` y `/closy`).
  - **Análisis Visual Multimodal de Fotos de Prendas**: Kloe descarga y analiza directamente las fotografías reales de las prendas del armario del usuario a través de los modelos de visión de Gemini (`gemini-3.6-flash`). Si una prenda tiene un nombre genérico o incorrecto en la base de datos, Kloe observa la foto directamente e identifica el color real, corte, estampados y logos.
  - **Directorio de Conversaciones (Máximo 5)**: Historial persistente en cliente que permite guardar, alternar y borrar hasta 5 conversaciones independientes con Kloe.
  - **Montaje Directo en el Lienzo (`/create?itemIds=...`)**: Kloe ofrece el botón *"Montar y editar en el lienzo"*, cargando automáticamente las prendas recomendadas en los slots correspondientes (`top`, `bottom`, `shoes`, etc.) y posicionándolas en el canvas interactivo.
  - **Razonamiento Situacional y Detección de Prendas Clave**: Kloe analiza la prenda exacta que el usuario quiere combinar, la sitúa como ancla del look y compone el resto del outfit de forma dinámica.

---

## 🤖 Kloe AI - Asistente y Estilista Inteligente Personal (Roadmap & Arquitectura)

### 1. Visión y Propósito
**Kloe** es la asistente conversacional integrada en Wardrobe.AI. Su objetivo es recomendar outfits completos y combinaciones de prendas reales del armario del usuario según la ocasión, el clima, el estilo deseado o dudas de moda cotidianas.

### 2. Modelo de IA Económico y Gratuito
- **Modelo recomendado**: **Google Gemini 2.0 Flash / 1.5 Flash** (vía Google AI Studio API o SDK oficial `@google/genai`).
  - **Ventaja de coste**: Tier gratuito generoso (15 RPM / 1M tokens/minuto / 1,500 RPD gratuitas en Google AI Studio sin coste).
  - **Capacidad de contexto**: Ventana de contexto masiva (1M+ tokens), lo que permite indexar el armario entero del usuario con todas sus propiedades JSON en cada prompt sin truncar datos.
  - **Alternativa de respaldo**: Groq con LLaMA-3.3-70B-Versatile o DeepSeek-V3 por su altísima velocidad y coste prácticamente nulo ($0.10/1M tokens).

### 3. Seguridad, Rate Limiting y Motor de Respuestas Rápidas Zero-Token
- **Autenticación Obligatoria**: El endpoint `/api/closy/chat` valida la sesión del usuario mediante token de Supabase (`auth.getUser()`). Peticiones anónimas o sin sesión son bloqueadas (`401 Unauthorized`).
- **Motor de Respuestas Rápidas Zero-Token (`lib/closy/fastResponses.ts`)**:
  - Intercepta automáticamente cortesías, saludos, agradecimientos, confirmaciones simples ("vale", "ok", "genial"), despedidas ("adiós", "chao") y elogios.
  - **Ahorro total de tokens y coste**: No llama a la API de Gemini ni indexa el contexto de imágenes de la base de datos para frases de cortesía simples (consumo de 0 tokens LLM, 0 coste y latencia inmediata < 5ms).
  - Incluye biblioteca con **+25 respuestas dinámicas en personaje**, variaciones aleatorias para no sonar robótico y botones sugeridos de seguimiento.
  - Si el mensaje incluye una petición real de moda (ej: *"gracias, ¿cómo puedo combinar mis botas?"*), el motor detecta la intención y lo transfiere automáticamente a Gemini.
- **Rate Limiting por Usuario / IP**:
  - Implementación con ventana deslizante y presupuesto de tokens (`15 req/min IP`, `8 req/min Usuario`, `40 req/día`, `60.000 tokens/día`).
  - Bloqueo y headers de respuesta `X-RateLimit-Remaining` y `Retry-After` para evitar abusos.
- **Sanitización y Guardrails**: Validación de longitud máxima de prompt (500 caracteres por mensaje) y filtrado de inyecciones de sistema.

### 4. Indexación de Datos del Usuario (System Context)
En cada conversación, el backend alimenta a CloSy con:
1. **Prendas del armario (`clothing_items`)**: ID, nombre, categoría (top, bottom, shoes, jacket, accessories), color, hex, marca, estación, tejido y URL de imagen.
2. **Outfits existentes (`outfits` + `outfit_items`)**: Combinaciones previas que el usuario ya ha armado o guardado.
3. **Preferencias del perfil (`profiles`)**: Estilos preferidos (`preferred_styles`), morfología corporal (`body_shape`), colorimetría (`season_palette`), género y edad.

### 5. Formato de Salida y UI Interactiva
- **Respuesta Conversacional**: Explicación estilística experta y estructurada de por qué combina el look.
- **JSON de Outfit Estructurado**: Klosy devuelve un payload con los `clothing_item_ids` exactos elegidos de su armario.
- **Renderizado Visual en el Chat**: La UI de `/closet/klosy` renderiza tarjetas interactivas de las prendas recomendadas y el botón *"Montar y editar en el lienzo"*, cargando las prendas en `/create` listas para mover y escalar.
- **Programación de Outfits en Calendario (`scheduled_for`)**: El usuario puede asignar una fecha específica en el calendario tanto al crear o editar un look en `/create` (con selector de fecha nativo en móvil y escritorio) como al pedirle a Klosy looks para una fecha concreta (`/create?scheduledDate=YYYY-MM-DD`).

---

## 💳 Modelo de Negocio, Monetización y Arquitectura Stripe

### 1. Modelo Freemium y Suscripción Kloe Pro
- **Plan Free (Gratuito)**:
  - Armario con hasta 30 prendas.
  - Consultas de prueba diarias con Kloe.
  - Creación y montaje de outfits en lienzo interactivo.
- **Plan Kloe Pro (2,99 € / mes [IVA incl.] o 24,99 € / año [IVA incl.])**:
  - Consultas y estilismo ilimitado con Kloe con análisis multimodal de fotos.
  - Armario ilimitado y categorización con IA.
  - Programación ilimitada en el Calendario de Outfits.
  - **Desglose Fiscal y Unitario por Usuario (Mensual 2,99 €)**:
    - PVP Cobrado al Usuario: **2,99 €**
    - Impuestos (21% IVA España): **- 0,52 €** (Base Imponible Neta: 2,47 €)
    - Comisión Pasarela Stripe (1,4% + 0,25 €): **- 0,29 €**
    - Coste IA Gemini Flash (40 consultas/mes con Zero-Token Caching): **- 0,012 €**
    - Coste Infraestructura / Supabase: **- 0,01 €**
    - **Beneficio Neto Limpio:** **2,16 € / mes por usuario activo** (> 72% de margen neto tras impuestos y comisiones).

### 2. Disparadores Orgánicos In-App (Estilo Duolingo)
- **Banner en `/closet`**: *"¿Qué me pongo hoy? Pídele a Kloe que te arme un look con tu ropa en segundos"*.
- **Banner en `/create`**: *"¿Quieres que Kloe te ayude? Combina tus prendas con IA en segundos"*.
- **Control de Acceso en `/closet/kloe`**:
  - Badge visual de estado `PRO` / `FREE · Pro` en la cabecera.
  - Switch de activación directa (Turn ON / Turn OFF) en `/profile/settings` para alternar el estado Premium de forma instantánea.

### 3. Arquitectura de Integración con Stripe y Base de Datos
- **Esquema de Base de Datos (`public.profiles`)**:
  - `is_premium BOOLEAN DEFAULT false`: Estado activo de suscripción.
  - `subscription_tier TEXT DEFAULT 'free'`: Nivel de servicio (`free` o `premium`).
  - `subscription_plan TEXT DEFAULT 'none'`: Tipo de plan (`monthly` o `yearly`).
  - `subscription_status TEXT DEFAULT 'inactive'`: Estado del pago (`active`, `canceled`, `past_due`, `inactive`).
  - `subscription_period_end TIMESTAMPTZ`: Fecha de renovación o expiración del plan.
  - `stripe_customer_id TEXT`, `stripe_subscription_id TEXT`, `stripe_price_id TEXT`.
  - **Vista SQL de Monitoreo (`public.v_user_subscriptions`)**: Permite consultar qué usuarios están pagando, si son anuales o mensuales y cuándo renuevan.
- **Acceso Exclusivo para Ethan**:
  - El usuario Ethan cuenta con suscripción **Kloe Pro Vitalicia Activa** por defecto en base de datos y cliente (`userStore.tsx`), mientras que todos los demás usuarios inician en el plan Free hasta contratar en Stripe.
- **Stripe Checkout Sessions (`/api/stripe/checkout`)**:
  - Creación de sesión de suscripción vinculada al `user_id` de Supabase en `client_reference_id` y `customer_email`.
  - Soporte automático para Apple Pay, Google Pay y Tarjetas con cifrado SSL.
- **Stripe Webhooks (`/api/webhooks/stripe`)**:
  - `checkout.session.completed` / `customer.subscription.created`: Recupera el plan exacto (`monthly` o `yearly`), fecha de expiración y actualiza `profiles` con Service Role de Supabase.
  - `customer.subscription.deleted` / `customer.subscription.updated`: Si el usuario cancela o expira el pago, actualiza el estado a `subscription_tier = 'free'` y `is_premium = false`.
- **Inspección de Inspiración y Looks Guardados**:
  - Kloe indexa las publicaciones guardadas del usuario (`saves` $\rightarrow$ `posts`) y analiza sus fotografías para que el usuario pueda pedir recrear o combinar looks a partir de sus fotos guardadas.

---

## 🔍 Estrategia de SEO & Posicionamiento en Google

### 1. Palabras Clave Principales y Posicionamiento
- **Palabra Clave Primaria**: `Closet` / `Klozet` / `Genera outfits con inteligencia artificial` / `Red social de moda`.
- **Estructura del Título SEO**: `Closet & Klozet | Genera Outfits con Inteligencia Artificial & Red Social de Moda`.
- **Meta Descripción Optimizada**: `Klozet es la red social de moda y armario virtual inteligente número 1. Digitaliza tu ropa, genera outfits perfectos con inteligencia artificial, comparte tu estilo con la comunidad y recibe estilismo 24/7 con tu asesora IA Kloe.`

### 2. Infraestructura Técnica de Indexación
- **JSON-LD Schema (`app/layout.tsx`)**: Esquema de datos estructurados para Google Knowledge Graph (`WebApplication`, `Organization`, `WebSite`, `AggregateRating: 4.9`, `SearchAction`).
- **Sitemap Dinámico (`app/sitemap.ts` $\rightarrow$ `/sitemap.xml`)**: Genera el mapa XML indexable para rastreadores web.
- **Control de Robots (`app/robots.ts` $\rightarrow$ `/robots.txt`)**: Permite indexar páginas públicas (Feed, Search, Outfits, Perfiles) y bloquea rutas privadas.
- **Manifest PWA (`public/manifest.json`)**: Configuración optimizada para instalación móvil y categorización en buscadores.


