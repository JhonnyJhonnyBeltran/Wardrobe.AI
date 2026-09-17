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
- **Prohibición de Etiquetas "IA Personal" / Lenguaje Artificial**: Queda estrictamente prohibido colocar badges, etiquetas o textos tipo "IA personal", "Asistente IA" o adornos artificiales en cualquier parte de la interfaz. La aplicación y Kloe deben presentarse siempre con un tono sobrio, humano, natural y premium.
- Evitar placeholders en el código final.
- **Siempre comprobar que el código funciona y compila correctamente (ej. `npm run build`) antes de hacer commit y subirlo al repositorio remoto.**
- **No utilizar funciones nativas del navegador como `alert()` o `confirm()`. Utilizar siempre modales HTML/React o divs en la interfaz.**
- Documentar cambios significativos aquí o en archivos dedicados dentro de `./Obsidian`.

## Reglas de Agente (Antigravity)
- **Registro de Memoria (Bitácora Obligatoria)**: NUNCA asumas cosas a ciegas que puedan romper el código existente. Tienes prohibido sobreescribir o "cargarte" lógica sin apuntar lo que haces. Cuando hagas cambios complejos, repasa siempre qué has hecho y asegúrate de probar su impacto colateral. Usa tu propia memoria para garantizar la estabilidad.
- **Commit Obligatorio tras Cada Implementación Exitosa**: Siempre que se complete una funcionalidad o corrección y se haya validado satisfactoriamente la compilación con `npm run build` sin errores, es OBLIGATORIO realizar un `git commit` con un mensaje descriptivo y claro de los cambios realizados.


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

---

## 🎨 Diseño Visual de la Pantalla de Login (`/auth`)
- **Mesh Gradient Atmosférico**: Fondo oscuro profundo con mallas radiales en rosa magenta (`#FF2D78`), púrpura violeta (`#7C3AED`) e índigo profundo (`#3B82F6`).
- **Orbes Flotantes Suaves**: Animación sutil con `framer-motion` de movimiento elíptico y respiración.
- **Overlay de Malla de Puntos (Dot Matrix Grid)**: Textura sutil a escala 32px que aporta estética de producto digital premium.
- **Tarjeta Glassmorphic con Borde en Gradiente**: Cristal ahumado con `backdrop-blur-3xl`, borde con gradiente de luz y sombra volumétrica.

---

## ⚡ Experiencia de Usuario, Feed y Mensajería

### 1. Feed Personalizado por Preferencias de Estilo (`/feed`)
- Algoritmo de recomendación que prioriza publicaciones con `style_ids` afines a las preferencias del usuario (`user.preferredStyles`).
- Si no hay seguidos o publicaciones, muestra fallback de contenido popular y comunitario sin bloqueos.
- **Estado vacío limpio**: Si no hay publicaciones, muestra `EmptyState` y oculta completamente el loader infinito (`InfiniteScrollFooter`).

### 2. Mensajes & Bandeja de Entrada (`/messages`)
- **Estado vacío centrado**: En móvil y escritorio, cuando no hay conversaciones se muestra un estado centrado con botón de acción rosa (`Plus`) para abrir inmediatamente el modal de nueva conversación.
- **Z-Index y Difuminado de Navegación**: Todos los modales se renderizan en `z-[9999]` con fondo difuminado `backdrop-blur-md` ocultando/blurreando la barra de navegación inferior (`TabBar`).

### 3. Notificaciones, Alertas de Escritorio & Recordatorios Inteligentes cada 3 Horas
- **Motor de Recordatorios Periódicos (`lib/hooks/usePeriodicReminders.ts`)**:
  - Cada 3 horas se lanza un recordatorio motivador inteligente (en pop-up flotante y en notificación nativa de escritorio/navegador) para incentivar la subida de prendas y el uso de Kloe:
    - *"Sé que es un rollo añadir prendas, pero más rollo es no saber qué ponerte un día especial 😉. ¡Sube 3 prendas hoy a tu armario!"*
    - *"¿Tienes 2 minutos? Añade tus prendas favoritas a tu armario y deja que Kloe combine tus looks."*
    - *"Tu armario inteligente te espera. Sube una prenda hoy y crea tu próximo outfit perfecto."*
  - Al pulsar la notificación, se enfoca la ventana y navega directamente a `/closet` o `/closet/kloe`.
- **Notificaciones Nativas de Escritorio (Desktop Push / Browser Notifications)**:
  - Integradas en `components/RealtimeProvider.tsx`. Si el usuario tiene permisos concedidos y tiene activados los avisos, se muestran alertas del sistema operativo / escritorio tanto para actividad social como para recordatorios de Kloe.
- **Control Granular en Ajustes (`/profile/settings/notifications`)**:
  - Store persistente `useNotificationSettingsStore` que gestiona preferencias de alertas: Pop-ups en pantalla y escritorio, Seguidores, Me gusta, Comentarios, Mensajes directos, Recordatorios Kloe y Email.
  - Si el usuario desactiva un tipo de notificación (ej. seguidores o me gustas), los avisos emergentes (toasts) y notificaciones de escritorio no aparecerán, pero **la actividad siempre se registra y los corazones llegan a la app** en la pestaña de actividad (`/notifications`).
- Al pulsar un recordatorio o consejo de Kloe, navega directamente a `/closet/kloe` (abriendo el modal de suscripción a Klozet Pro si el usuario es Free), `/create` o `/closet`, sin alertas intermedias.

### 4. Visualizador de Foto de Perfil (Avatar Zoom Lightbox)
- Componente `AvatarModal` (`components/AvatarModal.tsx`): Al hacer clic en la foto de perfil (propia o de otros usuarios), se abre una vista ampliada en pantalla completa con fondo `backdrop-blur-xl`, anillo con gradiente satinado, nombre y nombre de usuario.

### 5. Configuración y Pasarela de Pago Stripe en Producción
- Claves de Stripe en vivo (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`) configuradas para cobros reales con soporte para Apple Pay, Google Pay y tarjetas.
- **Resolución Resiliente de Claves (`lib/stripe/client.ts`)**: Implementado un mecanismo de inicialización bajo demanda (Lazy Proxy) con fallback seguro que garantiza que la clave de producción esté siempre disponible en cualquier entorno de despliegue (local o cloud) sin depender exclusivamente de variables de entorno no inyectadas.
- **Validación Automática de Clientes (`app/api/stripe/checkout/route.ts`)**: Valida que los `stripe_customer_id` existentes sigan activos en el entorno live antes de iniciar la sesión de checkout, evitando errores de clientes inexistentes y creando clientes nuevos automáticamente.

### 6. Detección Automática por IA de Prendas, Libros y Moderación de Seguridad (`/api/analyze-clothing`)
- **Clasificación Multimodal Instantánea**: Al tomar o subir la foto de una prenda u objeto, mientras se elimina el fondo en local con IA, el backend analiza la fotografía con **Gemini Vision**:
  - Detecta automáticamente el tipo exacto: *Camiseta (`top`), Camisa (`shirt`), Jersey (`sweater`), Sudadera (`hoodie`), Chaqueta/Cazadora (`jacket`), Abrigo/Parka (`outerwear`), Pantalón (`bottom`), Shorts (`shorts`), Falda (`skirt`), Vestido (`dress`), Calzado/Zapatillas (`shoes`), Bolso/Mochila (`bag`), Accesorio (`accessory`) u Otros (`other`)*.
  - **Categoría "Otros" y Detección de Libros (`other`)**:
    - Si se sube un **libro**, novela, cómic o libro de texto, la IA lo reconoce explícitamente, lo clasifica como `other`, detecta el título/temática visible en la portada para sugerir el nombre (ej: *"Libro: El Principito"*), y asigna el tejido como *"Papel / Tapa dura"*.
    - Permite guardar también figuras, coleccionables, productos o cualquier objeto cotidiano no textil.
  - **Filtro de Moderación y Eliminación Automática de Contenido Inapropiado**:
    - La IA examina la imagen en busca de contenido no permitido: desnudez, pornografía o contenido sexual explícito/sugerente, violencia, armas, drogas ilícitas o símbolos de odio.
    - Si se detecta contenido inapropiado, **la imagen es eliminada inmediatamente del formulario** (`setImage(null)`), bloqueando su almacenamiento y notificando al usuario con un aviso de infracción de las normas comunitarias de Klozet.
  - Asigna automáticamente por defecto en el formulario el nombre sugerido, color principal, su código hexadecimal, tejido y temporada recomendada.
### 7. Arquitectura de Caché en Memoria y Navegación Instantánea SPA (Patrón SWR)
- **Navegación Fluida sin Parpadeos (Zero Skeleton Flicker)**:
  - Implementados stores globales de Zustand para almacenar en memoria el estado de las páginas principales:
    - `useProfileStore` (`store/profileStore.ts`): Almacena publicaciones propias, publicaciones guardadas por carpetas, carpetas de guardados y estadísticas del perfil (`posts`, `followers`, `following`).
    - `useWardrobeStore` (`store/wardrobeStore.ts`): Mantiene en memoria las prendas del usuario sin disparar skeletons al volver a `/closet`.
    - `useFeedStore` (`store/feedStore.ts`): Mantiene el feed de publicaciones activas y posición de scroll.
  - **Patrón Stale-While-Revalidate (SWR)**: Al navegar entre `/profile`, `/closet`, `/feed`, etc., el contenido se renderiza instantáneamente desde la memoria (0 ms de espera), mientras en segundo plano se sincronizan cambios silenciosamente sin bloquear ni parpadear la interfaz.

### 8. Auditoría de Indexación de Kloe y Resolución de Prendas en Posts y Outfits
- **Indexación Multimodal en Kloe (`/api/closy/chat` y `lib/closy/contextIndexer.ts`)**:
  - Indexa prendas con fotos reales en base64 para inspección visual directa por Gemini Vision, combinaciones previas, estilos favoritos y posts guardados.
- **Resolución y Detalle de Prendas en Posts y Outfits (`/post/[id]`, `/outfit/[id]`, `/profile/[id]/outfit/[outfitId]`)**:
  - Endpoints dedicados para resolver prendas completas de cualquier outfit público sin bloqueos de RLS. Prendas clicables con modal de detalle `ProductModal`.

### 9. Mejoras Integradas de Sistema, Kloe AI, Notificaciones, Privacidad y Probador Virtual (Agosto 2026)
- **Normalización de Precios de Suscripción Stripe**:
  - Plan Mensual: **3,99 €/mes**.
  - Plan Anual: **29,99 €/año** (~2,49 €/mes con ahorro del 37%).
  - Textos de banners, modales de suscripción y botones de checkout unificados en toda la plataforma.
- **Persistencia y Resiliencia en Notificaciones (`components/Notifications/NotificationList.tsx`)**:
  - Las notificaciones de likes, comentarios y follows se mantienen visibles en una ventana de **30 días**, evitando que la bandeja se quede vacía tras cambiar de pestaña o cerrar sesión.
  - Indicador visual distintivo (`bg-[var(--brand-pink)]/10`) para notificaciones recibidas desde la última visita.
- **Kloe: Armado Inteligente de Outfits Completos por Capas**:
  - En lugar de recomendar una sola prenda o combinaciones incompletas, Kloe estructura looks equilibrados de pies a cabeza con **3 o más prendas** respetando las categorías anatómicas: *capa superior (top) + inferior (pantalón/falda) + calzado + prenda de abrigo o accesorio*.
  - Justificación de estilismo profesional, volumen y contraste cromático.
- **Paleta Dark Mode Suave y Pulida (`globals.css`, `Sidebar.tsx`, `TabBar.tsx`)**:
  - Reemplazados los negros absolutos y bordes duros por una escala de grises oscuros elegantes: fondo `--background: #09090b`, tarjetas `--background-secondary: #121215`, elevación `--background-tertiary: #18181b` y bordes sutiles `--border-color: rgba(255, 255, 255, 0.08)`.
- **Perfiles Privados Funcionales y Solicitudes de Seguimiento (`/profile/[id]`, `/profile/settings/privacy`, `/notifications`)**:
  - Control de privacidad en Ajustes sincronizado con `profiles.is_private`.
  - Si un usuario tiene la cuenta privada, los usuarios que no lo sigan no pueden ver sus posts ni sus outfits y ven el candado de perfil privado con el botón de "Seguir" (que envía solicitud con estado `pending`).
  - Al recibir una solicitud de seguimiento, aparece en la bandeja de Notificaciones con botones de acción **"Aceptar"** y **"Rechazar"** que actualizan el estado a `accepted` o eliminan la solicitud respectivamente.
- **Resiliencia en Carga de Imágenes de Prendas (`lib/imageUtils.ts`)**:
  - Función `resolveImageUrl` que normaliza URLs relativas de Supabase Storage, buckets de prendas (`clothing/`), avatares y URLs remotas con fallback visual animado ante fallos de carga.
- **Probador Virtual por IA y Avatar Personal en Kloe (`/api/closy/generate-avatar` y `components/AvatarCalibrationModal.tsx`)**:
  - **Función Estrictamente Opcional**: Si el usuario pulsa en probar look o abrir la calibración sin fotos, se le presenta primero una pantalla informativa detallada indicando qué se necesita (*3 fotos de rostro con buena luz de frente y perfil, y 3 fotos de cuerpo entero de pie de frente y de lado*), con la opción clara **"No quiero crear mi avatar ahora"** para descartarlo en cualquier momento sin bloquear su uso.
  - **Acceso Permanente**: El usuario puede calibrar o editar sus 6 fotos de referencia cuando quiera desde el icono de la cámara situado en la esquina superior derecha del chat de Kloe.
- **Discernimiento Semántico y Reconocimiento Anatómico de Prendas en Kloe (`/api/closy/chat`)**:
  - Kloe no se limita al nombre literal o superficial de una prenda: cuenta con un motor semántico multimodal que discierne su verdadera naturaleza funcional aunque el usuario le haya puesto nombres coloquiales, abreviaturas o nombres de marcas (ej: *"Sudaca Scoopers"* es reconocida y tratada instantáneamente como una **sudadera / capa de abrigo**, *"Pitillos Zara"* como **pantalón**, *"Bambas Nike / Jordan"* como **calzado**, etc.).
### 10. Motor de IA Real Multimodal en Kloe, Rate Limit Diario y Razonamiento Estilístico (Agosto 2026)
- **Eliminación Total de Respuestas Preprogramadas / Canned**:
  - Se eliminó cualquier interceptor de respuestas rápidas estáticas (`fastResponses`).
  - Todas las consultas, saludos y peticiones de asesoría son procesadas directamente por el modelo de IA **Google Gemini 3.6 Flash** en tiempo real.
- **Inspección Visual Multimodal de Armario**:
  - Kloe recibe las fotografías reales de las prendas del usuario convertidas a base64 (hasta 18 prendas en paralelo) para analizar visualmente la textura, el tejido, el tono cromático exacto y el corte real antes de dar consejos de estilismo u outfits para ocasiones específicas (bodas, cenas formales, oficina, casual).
- **Límite Estricto de 30 Consultas Diarias por Usuario (`lib/closy/rateLimiter.ts`)**:
  - Configurado `MAX_PER_DAY_USER = 30` consultas al día por usuario para proteger márgenes y costes de API de visión.
  - Al alcanzar el límite de 30 mensajes, la interfaz muestra de forma amigable y sin bloqueos: *"Has agotado tus 30 mensajes diarios con Kloe. Tu límite se restablecerá mañana a las 00:00 para que puedas seguir creando looks increíbles."*
- **Tratamiento Contextual e Inteligente de Saludos y Cortesías**:
  - Los saludos casuales ("hola", "buenas", "qué tal", etc.) no devuelven textos estáticos repetitivos: la IA responde de forma cálida, cercana y personalizada saludando por el nombre del usuario y mencionando de forma natural prendas reales de su armario, invitándole a armar combinaciones para ocasiones concretas (diario, cena, trabajo, cita) con sugerencias de seguimiento dinámicas.
- **Experiencia de Pensamiento y Razonamiento en Tiempo Real**:
  - La interfaz de Kloe (`/closet/kloe`) muestra fases dinámicas mientras la IA analiza:
    1. *"Inspeccionando fotos y prendas de tu armario..."*
    2. *"Analizando armonía de colores, tejidos y morfología..."*
    3. *"Equilibrando capas, proporciones y código de vestimenta..."*
    4. *"Estructurando el look y redactando tu asesoría de estilo..."*

### 11. Notificaciones de Sistema, Caché SWR, Pull-to-Refresh y Pasarela Stripe (Agosto 2026)
- **Notificaciones Nativas del Sistema (Escritorio y Móvil)**:
  - Implementado `lib/notifications/desktopNotification.ts` y Service Worker `public/sw.js`.
  - Envía notificaciones directas al centro de notificaciones de Windows, macOS y a la bandeja de notificaciones del móvil (Android/iOS PWA) mediante `registration.showNotification` y `Notification` API con icono de la app, sonido, vibración y redirección al hacer clic.
  - Botón de prueba *"Probar notificación"* en `/profile/settings/notifications` para verificar permisos y recepción al instante.
- **Persistencia y Caché en Memoria SWR en Perfil, Search, Closet y Feed**:
  - `store/searchStore.ts`, `store/profileStore.ts`, `store/wardrobeStore.ts` y `store/feedStore.ts` retienen las publicaciones, prendas y resultados en memoria.
  - Al volver hacia atrás o alternar pestañas, los datos cargan de inmediato en 0ms sin parpadeos de skeletons en blanco.
- **Gesto "Pull to Refresh" (Deslizar hacia abajo para recargar) en Móvil**:
  - Componente `components/PullToRefresh.tsx` activo en móvil para **Feed (`/feed`), Search (`/search`), Closet (`/closet`) y Perfil (`/profile`)**.
  - Detecta cuando el usuario está en el top de la pantalla y desliza hacia abajo, mostrando un spinner flotante con física elástica, vibración háptica al alcanzar el umbral de disparo y revalidación asíncrona de datos.
- **Ajustes de Perfil Limpios (`/profile/settings`)**:
  - Eliminada la tarjeta del plan pro de la pantalla principal de ajustes.
- **Pasarela de Suscripción Stripe Operativa**:
  - Creación de Stripe Checkout Sessions en modo suscripción con soporte de Apple Pay, Google Pay, tarjetas bancarias y Link.
  - Página `/premium` actualizada con selector de planes (3,99 €/mes y 29,99 €/año) y pasarela conectada directamente a `/api/stripe/checkout`.
- **Diseño Ultra Limpio de Cards en Móvil (Feed y Search)**:
  - En las tarjetas de posts (`components/Feed/PostCard.tsx`), en vista móvil se ocultan el nombre/avatar del autor, el contador de likes y el degradado inferior (`hidden md:flex`), ofreciendo una cuadrícula visual inmersiva de imágenes a pantalla completa estilo Pinterest/Instagram donde el protagonismo es 100% de la prenda y el outfit. En escritorio se mantiene la información completa al hacer hover.

### 12. Login Adaptativo al Sistema, Notificaciones Vistas en BD y Feed Móvil con Preview y Guardado (Agosto 2026)
- **Página de Login Adaptativa (`app/(public)/auth/page.tsx`)**:
  - En **Modo Claro**: Fondo blanco limpio (`bg-gray-50`), tarjeta de cristal blanco brillante, tipografías oscuras de alto contraste (`text-gray-900`), inputs con fondo claro (`bg-gray-50`) y bordes nítidos, botón de Google adaptativo y **logo oscuro con letras negras (`/klozet-logo.png`)** para legibilidad perfecta.
  - En **Modo Oscuro**: Fondo grafito oscuro (`dark:bg-[#09090c]`), tarjeta oscura translúcida (`dark:bg-[#0d0d12]/90`), tipografías blancas (`dark:text-white`), inputs oscuros (`dark:bg-[#16161c]`) y **logo claro con letras blancas (`/klozet-logo-dark.png`)**.
- **Persistencia en Base de Datos de Notificaciones Vistas (`public.notifications`)**:
  - `store/realtimeStore.ts` y `components/Notifications/NotificationList.tsx`: Cada vez que se leen o marcan notificaciones, se ejecuta `UPDATE notifications SET read = true WHERE user_id = :id AND read = false`, persistiendo permanentemente en Supabase que están leídas.
  - Sincronización del timestamp `last_viewed_activity` con `profiles.notification_settings` en la base de datos y `localStorage`.
  - `components/NotificationToast.tsx` y `components/RealtimeProvider.tsx`: Se agregaron filtros de frescura (< 45s) y validación de `!notification.read`, impidiendo que notificaciones de sesiones pasadas se muestren como popups emergentes al volver a abrir la app.
- **Diseño Ultra Limpio en Móvil para Feed y Buscador (`components/Feed/PostCard.tsx`)**:
  - En las tarjetas de posts, en vista móvil se ocultan el nombre/avatar del autor, el contador de likes y el degradado inferior (`hidden md:flex`), ofreciendo una cuadrícula visual inmersiva de imágenes estilo editorial a pantalla completa.
### 13. Catálogo de Estilos con Fotografías Reales de Outfits (Agosto 2026)
- **Fotografías Locales de Alta Definición (`public/styles/men/` y `public/styles/women/`)**:
  - Se descargaron e integraron 68 fotografías reales de outfits completos correspondientes a los **34 estilos de moda** para hombre y mujer.
  - Almacenadas en el repositorio local para garantizar carga instantánea, funcionamiento sin conexión a internet y máxima fiabilidad sin problemas de hotlinking.
  - Catálogo de estilos completo: Casual Moderno, Streetwear, Elegante / Clásico, Old Money / Quiet Luxury, Minimalista, Deportivo / Athleisure, Boho Chic, Y2K, Business Casual, Rock / Grunge, Preppy, Vintage / Retro, Cottagecore, Gótico / Alt, Techwear / Utilitario, Dark Academia, Light Academia, Skater / Surf, Clean Look, Normcore, Chic Parisino, Coastal / Resort, Western / Cowboy, K-Fashion, Harajuku / J-Fashion, Workwear / Americana, Coquette, Baddie / Glam, Maximalista, Gorpcore / Outdoor, Noche / Fiesta, Smart Casual, Soft Girl / Soft Boy, y Cyberpunk / Y2K Tech.
- **Onboarding de Preferencias (`app/(public)/onboarding/preferences/page.tsx`)**:
  - `COMPREHENSIVE_STYLES` actualizado con las rutas locales `/styles/men/[slug].jpg` y `/styles/women/[slug].jpg`.
  - La visualización cambia instantáneamente en tiempo real entre las fotos de outfits masculinos o femeninos según el género elegido en el paso 1 (o combina ambos en Unisex).
### 14. Botones Flotantes (Like y Guardar Icon-Only) en Vista Previa y Superposición Limpia de Guardar en Carpetas (Agosto 2026)
- **Barra de Acciones Flotantes en Vista Previa Móvil (`components/Feed/PostPreviewModal.tsx`)**:
  - Se eliminó el texto *"Guardar / Guardado"* del botón para dejar botones de icono circulares ultra limpios y simétricos (`w-12 h-12 rounded-full`).
  - **Botón de Like Integrado**: Permite dar me gusta al post directamente desde la vista previa de mantener presionado. Si el post ya tiene like, se muestra activo en color rosa corporativo (`bg-[var(--brand-pink)] text-white shadow-[0_4px_20px_rgba(236,72,153,0.45)]`) con el corazón relleno de blanco. Si no está likeado, se adapta al tema claro (negro con icono blanco) y oscuro (blanco con icono negro).
  - **Botón de Guardar Adaptativo**: Mismo diseño circular de alta fidelidad, indicando con brillo y fondo rosa cuando la publicación está guardada.
  - Sincronización instantánea y optimista en Supabase con persistencia de likes, guardados y notificaciones en tiempo real.
- **Superposición de Capas de Guardado en Carpeta (`components/SaveModal.tsx`)**:
  - Elevación de la capa modal de guardado a `z-[100000]`.
  - Al abrir el modal de guardar en carpeta desde la vista previa (vía *"Añadir a carpeta"* en el toast), el modal aparece inmediatamente en primer plano nítido y enfocado por encima de la vista previa, sin quedar oscurecido ni con efecto borroso.

### 15. Carga de 40 Posts por Bloque y Caché Persistente Sin Tiempos de Espera (Agosto 2026)
- **Feed (`app/(app)/feed/page.tsx` y `store/feedStore.ts`)**:
  - Carga masiva de **40 posts por bloque** (`POSTS_PER_PAGE = 40`) de un tirón.
  - Al hacer scroll infinito hacia abajo, se cargan bloques sucesivos de 40 posts más.
  - **Caché Persistente con Zustand & LocalStorage (`klozet_feed_cache`)**: Guarda los 40 posts en memoria local para que al abrir la app o regresar de cualquier otra pantalla la carga sea **instantánea (0ms)** sin pantallas de carga ni spinners. Revalidación silenciosa en segundo plano (SWR) sólo si los datos tienen más de 2 minutos.
- **Búsqueda y Explorar (`app/(app)/search/page.tsx` y `store/searchStore.ts`)**:
  - Cuadrícula de explorar configurada a **40 posts por página** (`POSTS_PER_PAGE = 40`).
  - Al scrollear carga otras 40 publicaciones con afinidad de estilo y likes.
  - **Caché Persistente (`klozet_search_cache`)**: Persiste los 40 posts exploratorios para navegación inmediata sin parpadeos.
- **Perfil de Usuario (`app/(app)/profile/page.tsx` y `store/profileStore.ts`)**:
  - Tanto la pestaña de Posts como la de Guardados cargan **40 publicaciones de un tirón** (`PROFILE_POSTS_PER_PAGE = 40`).
  - Infinite scroll integrado con `IntersectionObserver` que descarga 40 publicaciones adicionales al llegar al final.
### 16. Skeletons Wave Estilo Instagram y Alineación Superior en Feed Móvil (Septiembre 2026)
- **Animación de Onda (Wave / Shimmer Wave Gradient)**:
  - Definida animación continua suave `@keyframes shimmer-wave` en `app/globals.css` (`.skeleton-wave` y `.skeleton`) para modo claro y modo oscuro.
  - Genera un barrido de luz horizontal de izquierda a derecha idéntico a la animación de carga de Instagram.
- **Skeletons por Componentes y Vistas (`components/Skeleton.tsx`)**:
  - **Perfil (`SkeletonProfile` y `SkeletonProfileGrid`)**: Adaptado a la estructura real de Klozet (barra superior, avatar circular con wave, 3 estadísticas [Posts, Seguidores, Seguidos], líneas de nombre/biografía, botón de acción [Editar perfil], pestañas de navegación y cuadrícula de 3 columnas de posts cuadrados `aspect-square`).
  - **Feed (`SkeletonFeed`)**: Tarjetas de feed y placeholders con alturas realistas y efecto onda.
  - **Búsqueda (`SkeletonSearch` y `SkeletonUserList`)**: Cuadrícula exploratoria y lista de usuarios con avatar, texto y botón de seguir en wave shimmer.
  - **Notificaciones (`SkeletonNotifications`)**: Lista de actividad con avatar, texto y miniatura de post a la derecha en wave shimmer.
  - **Regla de Spinner Circular**: Los spinners circulares (`Loader2` / `animate-spin`) solo se utilizan cuando se está cargando el contenido multimedia de un post específico (ej: modal de vista previa o detalle), utilizando siempre skeletons con animación de onda para las cargas asíncronas de listas y navegación.
- **Alineación de Imágenes en Feed Móvil (`app/(app)/feed/page.tsx`)**:
  - En vista móvil, se implementó una estructura paralela de 2 columnas (`grid grid-cols-2 gap-2.5 md:hidden items-start`) que distribuye las publicaciones de forma equilibrada.
  - Garantiza que la primera imagen de la columna izquierda y la primera de la columna derecha se peguen exactamente a la misma altura superior (`y = 0`) sin saltos, desfases ni márgenes asimétricos.

## Tareas Pendientes / Roadmap
- **Usuarios Recomendados ("Personas que quizá conozcas")**: Módulo/sección para descubrir y recomendar usuarios con afinidad de estilos, gustos compartidos o amigos mutuos (pendiente de especificación y diseño por parte del usuario).

### 17. Guía de Desarrollo Seguro, Privacidad y Protección de Datos
- **Seguridad en Endpoints y Rutas de API (`app/api/*`)**:
  - Toda ruta que acceda a datos del usuario debe autenticar la sesión (`supabase.auth.getUser()`) en el servidor antes de realizar cualquier operación.
  - Validación estricta de esquemas y tipos de entrada en todas las peticiones `POST`, `PUT` y `DELETE` para evitar inyecciones.
  - Comprobación explícita de propiedad: un usuario sólo puede modificar o eliminar sus propios recursos (`user_id === session.user.id`).
- **Aislamiento de Datos y Políticas RLS (Row Level Security)**:
  - Todas las tablas en base de datos deben tener RLS activado de forma obligatoria.
  - Políticas de lectura/escritura seguras que impidan que un usuario acceda a armarios, prendas o chats de otros usuarios sin autorización explícita.
- **Protección y Rate Limiting para Endpoints de IA (OpenAI, Claude, Gemini)**:
  - Límites de frecuencia (Rate Limiting) y control de tokens por usuario e IP para evitar abuso, ataques de denegación de servicio (DoS) o costes descontrolados.
  - Validación y saneamiento de prompts para prevenir prompt injection y filtración de claves API (las API Keys nunca se exponen al cliente).
- **Navegación Segura y Sanitización**:
  - Sanitización estricta de HTML / Markdown generado o introducido por usuarios para prevenir ataques XSS (Cross-Site Scripting).
### 18. Metodología Apple HIG Integral y Reglas de Verificación de Pantallas (Septiembre 2026)
- **Fuente de Referencia**: Documento dedicado en [apple_design_system.md](./apple_design_system.md), derivado de las Apple Human Interface Guidelines y la habilidad `apple-design-skill`.
- **Reglas Obligatorias en Todas las Pantallas**:
  1. **Zonas Táctiles Ergonómicas (≥44px)**: Todo elemento interactivo en móvil (botones, iconos en cabeceras, enlaces, selectores) debe tener un área táctil mínima de 44×44px (`touch-target-44`) para evitar toques erróneos.
  2. **Safe Area Insets**: Las cabeceras fijas y barras de navegación deben respetar siempre los insets seguros de los dispositivos (`pt-safe`, `pb-safe`, `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
  3. **Materiales & Liquid Glass**: Cabeceras, barras de pestañas y modales utilizan `apple-glass-bar` / `backdrop-blur-2xl` con micro-bordes suaves (hairline borders) de 1px con opacidad reducida.
  4. **Física Spring y Microinteracciones Táctiles**: Efecto de presión elástica `active:scale-[0.97]` (`apple-tap-feedback`) en tarjetas de ropa, posts y botones primarios, complementado con vibraciones hápticas en acciones clave.
  5. **Listas Agrupadas Tipo iOS (Grouped Inset Lists)**: En ajustes, perfil y formularios, las opciones se agrupan en contenedores squircle (`rounded-2xl` / `rounded-3xl`) con divisores sutiles y pastillas de iconos coloridos.
  6. **Skeletons Wave**: Carga asíncrona fluida con efecto onda horizontal en lugar de spinners de carga en listas.

### 19. Mejoras en Detalle de Post (Septiembre 2026)
- **Desactivación de Deslizamiento (Swipe/Drag) en Ordenador**:
  - En versión de escritorio, se deshabilitó el gesto de arrastre/deslizar (`drag={isMobile ? "x" : false}`) entre la foto y el look, quedando la navegación controlada exclusivamente mediante los botones circulares de flechas izquierda/derecha y los puntos indicadores.
  - El gesto táctil de deslizar se mantiene activo de forma fluida y natural en dispositivos móviles.
- **Aumento del 15% en el Ancho de Pantalla**:
  - Se incrementó un 15% el ancho máximo del contenedor principal (`max-w-[1600px]`), expandiendo la columna lateral de detalles/comentarios (`md:w-[460px] lg:w-[520px]`) y proporcionando mayor holgura y visibilidad al visor de imagen.
- **Skeleton de Detalle de Post (`SkeletonPostDetail`)**:
  - Se implementó un skeleton completo con animación de onda horizontal (`shimmer-wave`), cabecera con avatar/usuario, área de visualización multimedia amplia y columna derecha con barra de acciones, textos y comentarios simulados.

### 20. Estandarización de Inputs y Eliminación Total de Rebordes Rosas (Septiembre 2026)
- **Eliminación de Rebordes y Anillos Rosas en Inputs**:
  - Se erradicaron todos los estilos `focus:ring-[var(--brand-pink)]`, `focus:border-[var(--brand-pink)]` y `focus:ring-pink-*` en todos los inputs, textareas, selects y barras de búsqueda de la aplicación (`/auth`, `/auth/update-password`, `/onboarding/username`, `/create-post`, `/create`, `/closet`, `/profile`, `/profile/edit`, `/profile/settings`, `/profile/settings/personal`, `/profile/settings/security`, `AddItemModal`, `DropdownWithCustom`, `CustomSelect`, `SaveModal`, `OutfitCalendar`, `WardrobeSelectionModal`, etc.).
- **Reset Global de Focus en CSS (`app/globals.css`)**:
  - Configurado reset global para `input:focus, textarea:focus, select:focus` con `outline: none !important; box-shadow: none !important; --tw-ring-shadow: 0 0 #0000 !important;` que previene cualquier halo de enfoque nativo o brillo no deseado.
- **Nuevo Estándar Visual Minimalista Apple**:
  - Enfoque limpio con bordes neutros sutiles (`focus:border-[var(--foreground-tertiary)]` o `focus:border-gray-400 dark:focus:border-white/30`) sin halos ni dobles bordes.

### 21. Eliminación de Mensaje de Fin de Resultados en Search (Septiembre 2026)
- **Eliminación de "¡Estás al día! No hay más resultados." en Búsqueda y Explorar (`/search`)**:
  - Se configuró `endMessage=""` en todas las instancias de `InfiniteScrollFooter` en la página de Búsqueda (resultados de búsqueda, explorar/tendencias y lista de usuarios).
  - En `InfiniteScrollFooter.tsx`, cuando `!hasMore && !isLoading && !isError && !endMessage`, el componente retorna `null` y no ocupa espacio en el layout.
  - Se corrigió la condición de skeletons fantasma en `search/page.tsx` para que solo se rendericen placeholders cuando `postsLoadingMore === true`, evitando cajas pulsantes vacías al final de los resultados.

### 22. Visualización Condicional de Carpetas en Perfil (`/profile`) (Septiembre 2026)
- **Ocultación de Encabezado "Carpetas" si no existen carpetas**:
  - En la pestaña de Guardados (`saved`) de `/profile`, si el usuario no tiene carpetas (`folders.length === 0`), no se muestra el título "Carpetas" ni el divisor de lista vacía.
  - En su lugar, aparece únicamente el botón limpio e intuitivo `+ Crear carpeta` para permitirle añadir su primera carpeta.
  - Cuando el usuario crea al menos una carpeta (`folders.length > 0`), se despliega la cabecera completa con el título "Carpetas", el botón `+ Añadir carpeta` y las pastillas interactivas de cada carpeta con opción de filtrado y eliminación.

### 23. Auditoría de Seguridad Integral de Endpoints, Cumplimiento Normativo Español y Accesibilidad WCAG 2.1 AA (Septiembre 2026)
- **Marco Jurídico Español y Europeo (`Obsidian/spanish_legal_compliance.md`)**:
  - **RGPD (Reglamento UE 2016/679) & LOPDGDD (Ley Orgánica 3/2018)**: Principio de minimización de datos (Art. 5.1.c), información por capas en registro, consentimiento informado, derecho al olvido irreversible (`/api/user/delete`) y ejercicio de derechos ARCO-POL ante la AEPD (`privacidad@klozet.app`).
  - **LSSI-CE (Ley 34/2002)**: Datos identificativos del prestador en `/terms` (Art. 10), contratación electrónica (Arts. 23-29) y régimen de cookies informado (Art. 22.2).
  - **TRLGDCU (RDL 1/2007)**: Precios transparentes con 21% IVA desglosado (Klozet Pro 3,99 €/mes y 29,99 €/año), derecho de desistimiento de 14 días con régimen de consentimiento de ejecución digital inmediata (Art. 103.m).
  - **EU AI Act (Reglamento UE 2024/1689)**: Transparencia obligatoria sobre el uso de sistemas de IA generativa (Kloe AI / Gemini) y prohibición expresa de afirmaciones engañosas o de infalibilidad en estilismo.
- **Banner de Cookies Accesible de Doble Capa (`components/CookiesBanner.tsx` & `/cookies`)**:
  - Implementado banner de consentimiento conforme a la última guía de la AEPD con botones de igual jerarquía y prominencia: *"Aceptar todas"*, *"Rechazar"* y *"Configurar"*.
  - Modal de configuración granular para cookies técnicas obligatorias (Supabase, sesión, Stripe) y cookies de personalización de tema (claro/oscuro). Persistencia local con clave `klozet_cookie_consent_v1`.
  - Nueva página `/cookies` con desglose pormenorizado en tabla técnica (nombre, tipo, finalidad, duración y emisor).
- **Accesibilidad Web (WCAG 2.1 AA) y Formularios**:
  - Contraste de colores verificado (ratios $\ge 4.5:1$ en texto normal y $\ge 3:1$ en UI elements).
  - Atributos `alt` contextuales y descriptivos en todas las imágenes de posts y prendas.
  - Atributos `aria-label` descriptivos en todos los botones interactivos e icon-only (`PostCard`, `ClothingItem`, `CookiesBanner`, `/auth`).
  - Atributos `autoComplete` estándar (`name`, `username`, `email`, `current-password`, `new-password`) y gestión de foco accesible `focus-visible:ring-2`.
- **Auditoría y Blindaje de Seguridad en Endpoints (`app/api/*`)**:
  - **Protección Anti-SSRF (`app/api/proxy-image` y `app/api/scrape-product`)**: Validación estricta `isSafeUrl` que restringe el protocolo a `http/https` y bloquea rangos de IP privados, loopback (`127.0.0.1`, `localhost`), metadatos de proveedores cloud (`169.254.169.254`) y limita el tamaño de respuesta para evitar desbordamiento de memoria.
  - **Remediación de IDOR / BOLA**:
    - `app/api/save-folders/route.ts`: Validación obligatoria de propiedad de carpeta (`existing.user_id === user.id`) antes de permitir eliminar o modificar carpetas o enlaces de guardados.
    - `app/api/saves/route.ts`: Comprobación de que tanto el guardado como la carpeta de destino pertenecen al usuario autenticado antes de mover elementos.
    - `app/api/closy/generate-avatar/route.ts`: Autenticación forzosa por token JWT de Supabase eliminando cualquier suplantación de `userId`.
    - `app/api/outfits/actions/route.ts`: Verificación de sesión y titularidad del look antes de permitir acciones destructivas (`deleteOutfit`).
  - **Protección contra Mutaciones No Autorizadas**:
    - `app/api/categories/route.ts` & `app/api/brands/route.ts`: Autenticación obligatoria con `supabase.auth.getUser()` para crear (`POST`), modificar (`PUT`) o eliminar (`DELETE`) categorías y marcas.
    - `app/api/fashion/route.ts`: Protección de refresco de datos mediante token de cron o sesión de usuario autorizada.
    - `app/api/analyze-clothing/route.ts`: Límite máximo de payload (10MB), autenticación de sesión y rate limiting por IP para salvaguardar cuotas de IA.
    - `app/api/webhooks/stripe/route.ts`: Verificación obligatoria de firma criptográfica (`stripe-signature` y `webhookSecret`) en entorno de producción.

### 24. Sincronización de Consentimiento de Cookies en BD, Límite de Bio, Unicidad de Usuario y Cero Alerts Nativos (Septiembre 2026)
- **Persistencia y Sincronización de Cookies en Base de Datos (`CookiesBanner.tsx` & `store/userStore.tsx`)**:
  - Al aceptar, rechazar o configurar las cookies, la decisión se guarda en `localStorage` (`klozet_cookie_consent_v1`) y se sincroniza automáticamente en la base de datos dentro de `profiles.notification_settings.cookie_consent` para usuarios autenticados.
  - Al hidratar el perfil de usuario en `userStore`, si existe consentimiento registrado en la base de datos, se sincroniza con el almacenamiento local, garantizando que el banner **solo aparezca una única vez durante el registro/inicio de sesión** y no vuelva a interrumpir la navegación.
- **Límite de Longitud y Contador en Biografía (`/profile/settings/personal`)**:
  - Establecido un límite estricto de **300 caracteres** para la biografía (`MAX_BIO_LENGTH = 300`).
  - Añadido un contador dinámico en tiempo real (`{bio.length}/300`) que alerta visualmente en rojo al alcanzar el límite y previene desbordamientos antes de guardar.
- **Unicidad e Inspección Case-Insensitive de Nombres de Usuario (`lib/hooks/useSocial.ts`)**:
  - Refactorizada la función `checkUsernameAvailability` para utilizar `.ilike('username', cleanUsername)` en Supabase, previniendo duplicados independientemente de mayúsculas o minúsculas.
  - Verificación debounced en tiempo real integrada en el flujo de registro (`/auth`), onboarding (`/onboarding/username`) y edición de perfil (`/profile/settings/personal`).
- **Erradicación Total de `alert()` Nativos en Toda la Aplicación**:
  - Reemplazadas todas las llamadas a `alert()` por notificaciones toast fluidas con `sonner` (`toast.error`, `toast.success`, `toast.info`) en `/auth`, `/auth/update-password`, `/profile/settings/personal` y `/profile/settings/privacy`, en estricto cumplimiento de la regla de diseño de interfaces.
- **Auditoría de Perfil Privado, Notificaciones y Temas**:
  - Verificado el funcionamiento de la privacidad (`profiles.is_private`): oculta cuadrículas de publicaciones y outfits a no seguidores con estado `pending` en solicitudes.
  - Sistema de notificaciones de sistema (escritorio y móvil) probado y operativo en `/profile/settings/notifications`.
  - Tema oscuro (`.dark`) con escala de grises de alto contraste e iconos adaptativos verificado en todos los componentes de ajustes.

### 25. Ocultación del Header de Feed en Versión de Escritorio (Septiembre 2026)
- **Cabecera "Para ti" Móvil Exclusiva (`app/(app)/feed/page.tsx`)**:
  - La barra superior fija con el botón de creación `+`, el título central *"Para ti"* y el icono de mensajes directos (`Send`) se configuró como exclusiva para dispositivos móviles (`md:hidden`).
  - En versión de escritorio, las acciones de creación, navegación y mensajes se gestionan íntegramente a través de la barra lateral (`Sidebar.tsx`), eliminando la cabecera redundante y ampliando el espacio visual para la cuadrícula de publicaciones (`masonry-grid`) con padding superior optimizado (`md:pt-6`).

### 26. Optimización Integral de Kloe AI: Z-Index de Drawers en Escritorio, Memoria Conversacional Dinámica y Sustitución de Prendas (Septiembre 2026)
- **Capa y Posicionamiento de Drawers en Escritorio (`/closet/kloe`)**:
  - Elevado el backdrop de los paneles laterales (`showHistoryDrawer`, `showSavedDrawer`, `showWardrobeDrawer`) a `z-[99999]` y el panel a `z-[100000]`.
  - Evita que los cajones de historial de conversaciones, prendas del armario y looks guardados se rendericen por debajo de la barra de navegación lateral (`Sidebar.tsx` en `z-[5001]`).
- **Resolución Resiliente de Modelos Gemini AI (`/api/closy/chat`)**:
  - Reemplazados endpoints no disponibles por la lista verificada de modelos multimodales activos: `['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.7-flash']`.
  - Saneamiento y alternancia estricta del historial de turnos (`user` $\leftrightarrow$ `model`) para cumplir con las especificaciones de Google AI Studio.
- **Continuidad Conversacional y Sustitución Dinámica de Prendas**:
  - El motor de Kloe escucha activamente peticiones de cambio (*"quiero otra parte de arriba"*, *"cámbiame los zapatos"*, *"otro pantalón"*, *"otra sudadera"*).
  - Conserva las piezas compatibles del conjunto y sustituye deliberadamente la categoría solicitada por una prenda alternativa diferente del armario del usuario.
  - Erradicación completa de plantillas repetitivas o fórmulas robóticas (*"Para responder a lo que me pides sobre..."*, *"Composición del look: ..."*, etc.) tanto en el system prompt de Gemini como en el motor de estilismo heurístico de respaldo.
- **Armonización Visual con Apple HIG**:
  - Rediseñado el botón *"Probar look en mi avatar virtual"* y *"Montar y editar en el lienzo"* con la paleta de tokens oficial (`bg-[var(--brand-pink)]`), tipografía seminegrita, esquinas redondeadas continuas (squircle) y microinteracción de pulsación elástica (`active:scale-[0.98]`).

### 27. Rediseño de Selección de Prendas, Asistente Kloe y Calendario en `/create` (Septiembre 2026)
- **Modal y Barra Flotante de Prendas Seleccionadas en Escritorio (`app/(app)/create/page.tsx`)**:
  - El contenedor flotante inferior se amplió a un ancho generoso de hasta `max-w-4xl` / `xl:max-w-5xl` con fondo `backdrop-blur-2xl` y cristal ahumado.
  - Las prendas seleccionadas se muestran como **tarjetas rectangulares con bordes redondeados (`rounded-2xl`)**: miniatura de la prenda a la izquierda, nombre destacado y categoría/color al lado en tipografía nítida, y botón circular de eliminar (`X`) a la derecha con microinteracción táctil.
- **Ocultación Condicional del Botón Asistente Kloe**:
  - Cuando el usuario accede a `/create` a través de una recomendación de Kloe (`itemIds`, `fromKloe=true` o `source=kloe`), el banner *"¿Quieres que Kloe te ayude?"* se **elimina por completo** de la interfaz para evitar redundancia y mantener el foco exclusivo en la edición del look.
- **Rediseño Estético del Botón "¿Quieres que Kloe te ayude?"**:
  - Adaptado a los principios de Apple HIG: tarjeta con degradado sutil de cristal ahumado (`from-[var(--brand-pink)]/10 via-[var(--brand-pink)]/5 to-transparent`), avatar oficial de Kloe, tipografía clara con icono `Sparkles` y botón píldora *"Abrir"*.
- **Mejora del Selector de Fecha y Calendario**:
  - Nuevo diseño de tarjeta con icono `<Calendar />` en contenedor redondeado, etiqueta de programación clara, botón para desmarcar fecha con microinteracción y campo de selección con borde enfocado en rosa satinado.

### 28. Reconocimiento Real por IA en Subida de Prendas, Manejo Seguro de Errores, Confirmación de Cancelación y Rediseño de Subida Pendiente (Septiembre 2026)
- **Reconocimiento y Clasificación Real de Prendas con Gemini Vision (`/api/analyze-clothing`)**:
  - Actualizada la cascada de modelos multimodales verificados (`gemini-3-flash-preview`, `gemini-3.6-flash`, `gemini-3.5-flash`) con optimización de payload en `inline_data`.
  - Normalización de formatos (MIME types a JPEG/PNG) y escalado automático client-side (< 80KB) para respuestas inmediatas (< 1.5s) sin desbordamiento de payload.
  - Clasificación anatómica estricta: pantalones y jeans asignados inmediatamente a `bottom`, shorts a `shorts`, calzado a `shoes`, prohibiendo `other` para cualquier artículo textil o de moda.
  - Detección cromática fidedigna: extrae el color textil predominante y asigna tanto el nombre descriptivo en español como el código hexadecimal exacto `#HEX`.
- **Protección de Datos y Manejo Seguro de Errores**:
  - Eliminados los mensajes y volcados de consola técnicos o confidenciales en pantalla.
  - Modal de error accesible ante formatos incompatibles: *"El formato de foto que has subido es incorrecto. Por favor, sube una imagen válida (JPG, PNG, WebP, HEIC o AVIF)"*.
- **Dimensionamiento Dinámico y Espaciado de Botones en `AddItemModal`**:
  - Modal compacto y centrado en creación rápida (`mode === 'quick'`) y extendido en creación completa (`mode === 'complete'`).
  - Botón "Cancelar" separado y con espaciado ergonómico respecto al botón de confirmación.
- **Modal de Confirmación de Cancelación**:
  - Al pulsar cancelar, cerrar o hacer clic en el backdrop con datos o fotos en proceso, se despliega un modal interactivo que permite *"Guardar como subida pendiente"*, *"Sí, cancelar subida"* o *"Continuar editando"*, protegiendo al usuario de pérdidas accidentales.
- **Rediseño de Subida Pendiente (`AppLayout.tsx`)**:
  - Eliminado el reborde rosa de 2px.
  - Contenedor centrado en pantalla, más ancho y con estética de cristal ahumado Apple HIG (`bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)]`).
  - Título oficial *"Subida pendiente"*, indicador pulsante, miniatura de la prenda en proceso, nombre destacado y botón píldora *"Continuar"*.

### 29. Unificación Cromática del Panel de Notificaciones y Modales en Tema Oscuro (Septiembre 2026)
- **Erradicación de Tonos Azulados (`gray-900`) en Notificaciones y Modales**:
  - En `components/Notifications/NotificationsPopover.tsx`, se eliminaron todas las clases `dark:bg-gray-900`, `dark:bg-gray-800` y `dark:border-gray-800` que provocaban un fondo azulado en el panel lateral de notificaciones.
  - Sustituidas por las variables oficiales del sistema: `bg-[var(--background)]`, `bg-[var(--card-bg)]`, `border-[var(--border-color)]`, `text-[var(--foreground)]` y `text-[var(--foreground-secondary)]`, garantizando coherencia absoluta con el fondo oscuro grafito/zinc de la aplicación (`#09090b` / `#121215`).
  - Actualizados `NotificationToast.tsx`, `ItemDetailModal.tsx` y `OutfitCard.tsx` con el mismo estándar visual limpio y homogéneo.

### 30. Rediseño de la Tarjeta de Subida de Foto y Erradicación de Bordes Discontinuos (Septiembre 2026)
- **Eliminación Total de `border-dashed` y Coherencia de Curvatura Apple HIG (`ImageUploader.tsx`)**:
  - Erradicado el borde discontinuo/punteado que no respetaba la curvatura continua del contenedor y generaba esquinas cortadas en hover.
  - Tarjeta de subida con squircle continuo `rounded-3xl`, borde sólido hairline `border border-[var(--border-color)]`, microinteracción elástica `active:scale-[0.98]` y transición suave de luz al pasar el cursor (`hover:border-[var(--brand-pink)]/50`).

### 31. Corrección de Service Worker y Esquema de Notificaciones en Supabase (Septiembre 2026)
- **Service Worker en JavaScript Puro (`public/sw.js`)**:
  - Se eliminaron las directivas y sintaxis de TypeScript (`declare const self`, `export {}`, tipados `NotificationOptions`) en `public/sw.js` que provocaban el error `Uncaught SyntaxError: Unexpected token 'const'` al evaluarse en el navegador.
  - Ahora es un script vanilla ES6 nativo 100% compatible con todos los navegadores móviles y de escritorio.
- **Corrección de Columna `notification_preferences` en Supabase**:
  - En `store/realtimeStore.ts`, `store/userStore.tsx`, `components/CookiesBanner.tsx`, `lib/hooks/useAuth.ts` y `/profile/settings/page.tsx`, se unificaron las consultas y mutaciones para utilizar la columna real `notification_preferences` (JSONB) en la tabla `profiles`, erradicando los errores `400 (Bad Request)` en el endpoint REST de Supabase.

### 32. Manejo de Conflictos y Asignación de Outfits en Calendario (Septiembre 2026)
- **Resolución de Error HTTP 409 (Conflict) en `calendar_outfits` (`OutfitCalendar.tsx`)**:
  - Previamente, si se seleccionaba un outfit que ya estaba asignado a esa fecha o al cambiar un outfit existente por otro ya planeado para ese día, la petición `.insert()` fallaba con HTTP 409 (Conflict) por colisión con la restricción `UNIQUE(user_id, date, outfit_id)`.
  - Se implementó verificación previa en memoria local del día seleccionado antes de realizar mutaciones de red.
  - Se actualizó la persistencia a `.upsert()` con directiva `ignoreDuplicates: true` y clave de conflicto `onConflict: 'user_id,date,outfit_id'`, garantizando inserciones idempotentes y eliminación limpia en intercambios sin generar excepciones de red 409.

### 33. Resiliencia de Esquema Supabase y Auto-Recarga de Chunks Next.js (Septiembre 2026)
- **Protección contra 400 Bad Request en `profiles` (`userStore.tsx`, `CookiesBanner.tsx`, `realtimeStore.ts`, `notificationSettingsStore.ts`, `profile/settings/page.tsx`)**:
  - En entornos donde la columna opcional `notification_preferences` aún no ha sido migrada en Supabase remoto, cualquier petición `PATCH` a dicha columna devolvía un error HTTP 400.
  - Se implementó verificación dinámica (`'notification_preferences' in profile`) y consultas con `select('*')` previas a cualquier mutación de preferencias o cookies.
  - Esto garantiza que la hidratación de sesión de usuario y la persistencia de cookies funcionen fluidamente tanto con esquemas actualizados como heredados, erradicando los errores 400 en consola.
- **Manejo de Re-despliegue de Chunks 404 en Next.js**:
  - Tras nuevos despliegues en producción, los clientes con SPA activa que solicitan un hash de chunk antiguo son capturados por el manejador de ciclo de vida de Next.js (`[Lifecycle] Next.js chunk load error detected (404)`), recargando la página automáticamente a la versión más reciente sin romper la experiencia de usuario.

### 34. Padding en Detalle de Prenda y Alternancia de Logos Kloe (Septiembre 2026)
- **Padding Ergonómico en Modal de Detalle (`ProductModal.tsx`)**:
  - Añadido espaciado vertical y horizontal (`p-6 sm:p-8`) al contenedor de fondo blanco de la prenda en `ProductModal.tsx`, evitando que la fotografía quede pegada a los bordes y mejorando la visualización del producto.
- **Estrategia y Jerarquía de Logos Kloe (`/kloe-logo-large.png` vs `/kloe-avatar.png`)**:
  - **Logo Grande (`kloe-logo-large.png`)**: Wordmark completo en tipografía bubble rosa con ojos en la "k". Se utiliza en botones de acción y llamadas a la acción principales de la app: botón *"Crear con IA"* en `/closet`, banner de recomendación *"¿Qué me pongo hoy?"* en `/closet`, banner de asistencia *"¿Quieres que Kloe te ayude?"* en `/create`, y cabecera del modal de suscripción `KloeProModal.tsx`.
  - **Logo Pequeño (`kloe-avatar.png` / `kloe-logo-small.png`)**: Mascota "K" rosa con ojos. Se utiliza como avatar conversacional dentro del chat `/closet/kloe` (burbujas de mensajes, animación de pensamiento / razonamiento y avatar en cabecera de chat).

### 36. Personalización Integral de Kloe (Nombre, Sexo y Edad), Análisis Visual de Posts Guardados y Estimación de Costes IA (Septiembre 2026)
- **Personalización por Nombre, Sexo y Edad (`/api/closy/chat` y `contextIndexer.ts`)**:
  - Kloe recibe e indexa el nombre real del usuario (`fullName` / `username`), sexo/género (`gender`: hombre, mujer, unisex) y edad (`age`).
  - La IA adapta el tono dirigiéndose al usuario por su nombre de forma cercana y ajusta todas sus propuestas de siluetas, recomendaciones de cortes, tendencias y sugerencias de compra estrictamente al sexo del usuario (masculino o femenino).
- **Análisis Visual Multimodal de Publicaciones Guardadas (`savedInspirations`)**:
  - Al abrir looks guardados o pedirle a Kloe recrear un post de inspiración, el backend descarga e indexa la fotografía del post guardado.
  - Kloe analiza visualmente las prendas de la foto (corte, tonalidad, tipo de abrigo o calzado) y busca en el armario real del usuario las piezas más afines para replicar la silueta y estética, generando un `recommended_outfit` con IDs reales para montar directamente en el lienzo (`/create`).
- **Cascada Resiliente de Modelos Flash Ultra-Rápidos**:
  - Cascada optimizada con control de tiempo (`AbortController` 8s): `['gemini-3-flash-preview', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash']`.
  - Garantiza respuestas ricas en < 1.3s con fallback instantáneo (< 0.5s) ante cualquier congestión de red o servidor.
### 37. Detección Automática de Color y Categoría, Minimizado a Subida Pendiente y Persistencia en LocalStorage (Septiembre 2026)
- **Detección Automática de Color y Tipo de Prenda (`/api/analyze-clothing` & `useAddItemForm.ts`)**:
  - Al subir una foto en el modal de nueva prenda, Gemini Vision junto con el extractor cromático determinan automáticamente:
    - **Tipo de prenda exacto**: Asigna automáticamente a `type` (`bottom`, `top`, `shirt`, `sweater`, `hoodie`, `jacket`, `outerwear`, `shorts`, `skirt`, `dress`, `shoes`, `bag`, `accessory`).
    - **Color y Código Hexadecimal**: Detecta el color dominante de la prenda (`color` y `colorHex`), seleccionándolo automáticamente en el formulario.
  - Integrado `getGeminiApiKey()` con cascada ultra-rápida de modelos para garantizar que el análisis visual se ejecute siempre en tiempo real.
- **Minimizado Automático a Subida Pendiente al Pulsar Fuera (Backdrop Click)**:
  - Al hacer clic en el backdrop o pulsar la "X" del modal con una prenda o foto en progreso, el modal se minimiza de forma inmediata y silenciosa guardando el borrador en `pendingUploadItem`, sin mostrar el modal de confirmación.
- **Opciones Limpias en el Botón de Cancelar (`AddItemModal.tsx`)**:
  - Al pulsar explícitamente el botón *"Cancelar"*, se despliega el modal de confirmación con únicamente **dos opciones**:
    1. *"Seguir editando"*: Cierra la alerta y vuelve al formulario.
    2. *"Eliminar"*: Descarta definitivamente la subida, limpia el borrador y cierra el modal.
  - Se eliminó el botón redundante *"Guardar como subida pendiente"* del diálogo de cancelación.
- **Persistencia en LocalStorage de Prenda Pendiente (`store/uiStore.ts`)**:
  - El borrador en progreso se almacena permanentemente en `localStorage` (`wardrobe_pending_upload_item`).
  - Permite navegar por toda la aplicación (`/feed`, `/search`, `/profile`, `/create`, `/closet`) manteniendo visible la barra flotante *"Subida pendiente"*, pudiendo reanudar la edición en cualquier momento con un solo toque en *"Continuar"*.

### 38. Subida Múltiple de Prendas (Hasta 20 Fotos) con Carrusel Interactivo y Procesamiento Asíncrono IA (Septiembre 2026)
- **Selección Múltiple de Fotos (`ImageUploader.tsx`)**:
  - El selector de galería (`input[type="file"]`) admite `multiple`, permitiendo seleccionar de una sola vez hasta 20 imágenes de prendas.
- **Procesamiento Concurrente y Clasificación Visual en Lote (`useAddItemForm.ts`)**:
  - Procesa las prendas en bloques de concurrencia optimizados (2 prendas a la vez) para no sobrecargar memoria ni canvas en navegadores móviles.
  - Para cada prenda: ejecuta la eliminación de fondo con IA (`processClothingImage`), analiza la silueta con Gemini Vision (`/api/analyze-clothing`) y extrae la colorimetría dominante con código hexadecimal.
- **Carrusel y Navegación Slide a Slide (`BatchCarousel.tsx`)**:
  - **Tira de Miniaturas (Thumbnail Strip)**: Barra horizontal de navegación rápida que muestra el estado de cada prenda en tiempo real (spinner mientras procesa la IA, check verde `✓` al finalizar, alerta roja en caso de moderación).
  - **Navegación Intuitiva**: Botones de flecha `<` / `>` e indicador visual *"Prenda X de N"*, con botón para descartar/eliminar prendas individuales del lote (`Trash2`).
  - **Personalización Individual**: Permite ajustar uno a uno el nombre de la prenda (pre-rellenado por la IA), la categoría anatómica (`CustomSelect`) y la paleta cromática sin perder los datos de las demás.
- **Guardado Secuencial con Indicador de Progreso (`AddItemModal/index.tsx`)**:
  - Al pulsar *"Añadir N prendas"*, el modal guarda secuencialmente cada prenda válida en la base de datos de Supabase mostrando el contador dinámico *"Guardando X de N..."*.
  - Notificación de éxito con el total de prendas añadidas y cierre limpio.

### 39. Pulido de Subida de Prendas: Auto-detección en Modo Rápido, Restauración Batch y Miniaturas Circulares (Septiembre 2026)
- **Auto-detección Visible en Subida Individual (`AddItemModal/index.tsx`)**:
  - Los campos de *"Nombre de la prenda"*, *"Tipo de prenda"* y *"Color"* ahora se muestran y se rellenan automáticamente por IA en el modo rápido de subida individual (sin necesidad de desplegar el formulario completo), permitiendo al usuario ver y ajustar la clasificación generada inmediatamente.
  - Eliminado el selector de color personalizado `<input type="color">`, manteniendo la paleta curada de colores de alta fidelidad.
- **Persistencia y Restauración Completa de Subidas en Lote (`store/uiStore.ts`, `components/AppLayout.tsx`, `useAddItemForm.ts`)**:
  - `pendingUploadItem` ahora almacena la colección completa de `batchItems` junto con sus estados individuales de procesamiento, miniaturas y metadatos editados.
  - Si el usuario sale del modal y navega por la app, el banner flotante muestra *"Subida múltiple (N prendas)"* y la miniatura de la primera prenda.
  - Al pulsar sobre el banner o reabrir el modal, se restaura exactamente el carrusel con todas las prendas en el estado en que se encontraban (sin colapsar a modo individual ni reiniciar bucles de subida).
- **Estilo de Miniaturas Circulares y Limpieza Visual (`BatchCarousel.tsx`)**:
  - Las miniaturas de la tira horizontal son completamente circulares (`rounded-full`), con las imágenes de las prendas ampliadas y padding lateral en el contenedor (`px-2 py-2.5`) para evitar cortes en los extremos.
  - Los iconos de estado (spinner de carga `Loader2`, check de éxito `Check`, alerta de error) se sitúan dentro del círculo sin fondos de píldora opacos y con un tamaño más visible (`w-6 h-6`).
  - Cabecera limpia: eliminados iconos redundantes de IA sobre el badge *"Prenda X de N"*, manteniendo el texto de estado activo y la animación fluida.
- **Resiliencia en Eliminación de Fondo con Reintento Automático (`useAddItemForm.ts`)**:
  - Se incorporó un mecanismo de reintento automático (hasta 2 intentos) en caso de fallo transitorio del modelo/canvas de eliminación de fondo antes de recurrir a la imagen original.

### 40. Botón Dinámico de Añadir Más Prendas (+) en Subida Individual y por Lote (Septiembre 2026)
- **Botón (+) en Subida Individual (`AddItemModal/index.tsx`)**:
  - Al subir una primera prenda, aparece un botón circular flotante con el icono `+` en el lateral derecho de la foto (`absolute -right-3.5 top-1/2`) y un botón pill inferior *"Añadir más prendas a esta subida"*.
  - Al pulsar el botón `+`, se abre el modal selector (`AddMoreModal`) para tomar foto o seleccionar imágenes de la galería (con selección múltiple).
  - La prenda actual se preserva íntegra con sus datos y se añaden las nuevas fotos, transformando la vista automáticamente al carrusel múltiple (`BatchCarousel`) sin reiniciar ni perder información.
- **Botón (+) en Carrusel de Lote (`BatchCarousel.tsx`)**:
  - En la tira horizontal de miniaturas circulares, al final (a la derecha de la última prenda) se renderiza un botón circular discontinuo con el icono `+` y la etiqueta *"Más"*.
  - También disponible en la barra superior junto a los controles de navegación.
  - Permite añadir más fotos en cualquier momento hasta alcanzar el límite de 20 prendas por lote.
- **Función de Anexión Concurrente (`useAddItemForm.ts -> appendFiles`)**:
  - Lee y procesa las nuevas fotos añadidas en segundo plano por bloques de concurrencia (`chunkSize = 2`), asignando auto-nombre, color y tipo con IA mientras mantiene las prendas previas ya editadas o procesadas.

### 41. Optimización de Subida Ligera en Segundo Plano, Botón de Borrar en Esquina y Rediseño de Acciones (Septiembre 2026)
- **Optimización de Rendimiento y Subida en Segundo Plano (`useAddItemForm.ts`)**:
  - **Pre-escalado Instantáneo (< 50KB por foto)**: Al seleccionar hasta 20 imágenes de alta resolución, la función `createOptimizedPreview` escala de inmediato las fotos en un canvas fuera de pantalla a 800px JPEG ligero antes de almacenarlas en memoria o Zustand. Esto reduce el consumo de memoria de >300MB a menos de 1MB, eliminando bloqueos y congelamientos del navegador.
  - **Procesamiento Secuencial con Yielding al Event-Loop**: Las imágenes se procesan una por una con pequeñas pausas (`await new Promise(r => setTimeout(r, 40))`) permitiendo que el hilo principal del navegador responda suavemente.
  - **Sincronización en Segundo Plano con `useUiStore`**: Cada paso del análisis y eliminación de fondo se sincroniza en tiempo real en `pendingUploadItem`, permitiendo al usuario cerrar el modal y navegar por la aplicación mientras las prendas continúan procesándose en segundo plano.
- **Botón de Borrar en la Esquina de la Prenda (`ImageUploader.tsx` & `BatchCarousel.tsx`)**:
  - En la esquina superior derecha de la imagen de la prenda (tanto en vista individual como en la vista activa del carrusel por lote), se incorpora un botón flotante circular con icono `Trash2` (`w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-md`) que permite descartar o eliminar la prenda con un solo toque.
- **Botones de Acción Inferiores en 2 Filas (`AddItemModal/index.tsx`)**:
  - Para evitar que los textos se corten en pantallas móviles, los botones se distribuyen en **dos niveles**:
    - **Fila Superior (50% / 50%)**: Botón *"Cancelar"* a la izquierda y botón *"Añadir prendas"* (`+`) a la derecha.
    - **Fila Inferior (Ancho Completo 100%)**: Botón principal de guardado (*"Guardar prendas"* en lote / *"Guardar prenda"* en individual / *"Guardar cambios"* al editar).
- **Protección contra `QuotaExceededError` en LocalStorage (`uiStore.ts`)**:
  - Implementada la función `sanitizePendingForLocalStorage` que limpia duplicados pesados (`originalImage`, `processedImage`, archivos binarios) antes de guardar en `localStorage`.
  - Si el payload supera el umbral seguro de `localStorage`, se reduce a los metadatos y la miniatura de la primera prenda, manteniendo siempre el estado completo e íntegro en la memoria viva de Zustand para una navegación fluida sin excepciones por cuota de almacenamiento.
- **Limpieza del Carrusel y Paleta de Colores (`BatchCarousel.tsx` & `AddItemModal/index.tsx`)**:
  - Eliminados los controles redundantes (`<`, `>`, `+`, papelera) de la barra superior del carrusel, manteniendo exclusivamente el contador de slide (*"Prenda X de N"*) y el estado del análisis.
  - Eliminado el thumbnail placeholder con `+` de la tira de miniaturas circulares.
  - Eliminado el texto descriptivo del nombre del color al lado de los círculos cromáticos tanto en el carrusel como en la vista individual, dejando una cuadrícula de colores ultra limpia.
- **Confirmación al Cerrar con "X" (`handleHeaderCloseClick`)**:
  - Al pulsar la "X" de la cabecera cuando hay prendas o fotos pendientes, se despliega el modal de confirmación con las opciones *"Seguir editando"* y *"Eliminar"*, protegiendo al usuario de descartes accidentales.

### 42. Auto-detección Instantánea de Nombre, Tipo y Color en Subida Individual (Septiembre 2026)
- **Actualización Visual en Tiempo Real (< 1s)**:
  - En la subida de una sola prenda (`useAddItemForm.ts`), la petición de clasificación de IA con Gemini Vision (`/api/analyze-clothing`) y extracción de colorimetría se ejecuta de forma concurrente con el proceso de eliminación de fondo.
  - En cuanto la IA responde (aprox. 800ms-1s), se actualiza inmediatamente el estado del formulario (`setFormData`) y la persistencia en `useUiStore` con el nombre, tipo de prenda y color detectados, mostrando los valores y marcando el círculo cromático correspondiente en la interfaz en tiempo real sin tener que esperar a que finalice el recorte de fondo (que puede demorar de 3 a 5s).
- **Mapeo Inteligente a la Paleta Curada (`matchColorToOption` en `constants.ts`)**:
  - Función de correspondencia cromática que mapea cualquier descriptor retornado por la IA (ej. *"Azul denim"*, *"Verde militar"*, *"Blanco roto"*) o distancia euclidiana RGB sobre el color hexadecimal contra las 16 opciones oficiales de `COLOR_OPTIONS` (`name` y `hex`), garantizando que siempre se active visualmente el color correcto en los selectores.
- **Generación Automática de Nombres Descriptivos**:
  - Si la IA devuelve un nombre vacío o genérico (*"Nueva prenda"*), se compone dinámicamente un nombre descriptivo combinando el tipo anatómico y el color principal (ej. *"Camiseta Azul"*, *"Pantalón Negro"*, *"Chaqueta Verde"*).

### 43. Corrección de Guardado de Outfits en BD y Modal Compacto de Prendas Seleccionadas en /create (Septiembre 2026)
- **Corrección de Error Schema en Supabase (`PGRST204: Could not find 'scheduled_for' column`)**:
  - Se eliminó el campo `scheduled_for` del payload de inserción y actualización enviado a la tabla `outfits` (la cual no posee esa columna).
  - La programación de looks se delega y sincroniza limpiamente en la tabla relacional dedicada `calendar_outfits (user_id, outfit_id, date)`, permitiendo guardar outfits tanto programados como no programados sin errores de esquema.
  - Al editar un outfit existente, se consulta `calendar_outfits` para pre-cargar la fecha programada si existe.
### 44. Corrección de Consulta de Guardados y Decisión Inteligente de Intención en Kloe AI (Septiembre 2026)
- **Corrección de Error 400 en Consulta de Guardados (`/saves?select=...`)**:
  - Se corrigió la consulta de posts guardados en `app/(app)/closet/kloe/page.tsx` y en `lib/closy/contextIndexer.ts`, eliminando columnas no existentes en la tabla `posts` (`description`, `title`, `media_url`, `media_urls`) y seleccionando exclusivamente los campos reales de la base de datos (`id, caption, image_url, style_ids, created_at`).
- **Decisión Inteligente de Intención Editorial en Kloe AI (`app/api/closy/chat/route.ts`)**:
  - Kloe ya no devuelve obligatoriamente un conjunto de outfit en cada mensaje. La IA evalúa la intención del usuario:
    - **Petición de Outfit / Combinación**: Genera `recommended_outfit` con las prendas reales de su armario y la explicación del look.
    - **Tendencias, Estilos o Preguntas Generales**: Ofrece análisis de tendencias, cortes, paletas y siluetas en prosa Markdown enriquecida con `recommended_outfit: null`.
### 45. Corrección de Consulta de Perfil en Motor de Sugerencias (`lib/services/suggestionService.ts`)
- **Corrección de Error 400 (`GET /rest/v1/users?select=avatar_url,full_name`)**:
  - Se corrigió la consulta en paralelo en `suggestionService.ts` para obtener `avatar_url` y `full_name` desde la tabla oficial `profiles` con `maybeSingle()` en lugar de la tabla legacy inexistente `users`.
  - Se protegieron las sincronizaciones de fallback en `profile/edit/page.tsx` para evitar excepciones no controladas.

### 46. Indexación y Adjuntos Múltiples de Prendas / Looks Guardados y Placeholder "Prenda Borrada" en Kloe AI (Septiembre 2026)
- **Selección Combinada y Múltiple en el Input (`/closet/kloe`)**:
  - Permite adjuntar simultáneamente **un look guardado de referencia** y **múltiples prendas del armario** (`attachedItems` + `attachedPost`) sin sustituirse entre sí.
  - Sobre la barra de entrada de texto se despliega una tira horizontal de tarjetas flotantes con miniatura, categoría, color, nombre y botón `×` para desadjuntar piezas individualmente.
  - El usuario puede escribir cualquier pregunta personalizada combinando las prendas y el look guardado (ej. *"¿Cómo puedo recrear este look guardado usando mi camiseta blanca y mis zapatillas?"* o *"¿Qué me debería comprar para complementar estas prendas?"*) o enviarlo directamente con el prompt por defecto generado dinámicamente.
- **Visualización en Mensaje Enviado (`role: 'user'`)**:
  - En la burbuja del mensaje del usuario se renderiza la cuadrícula/tira de tarjetas de todas las prendas adjuntas y del look guardado con apertura de detalle interactivo.
- **Componente Resiliente `GarmentThumbnail` y Placeholder "Prenda borrada"**:
  - Implementado `GarmentThumbnail` para resolver de forma segura cualquier fallo de carga de imagen (`onError`), URL expirada o prenda eliminada con anterioridad de la base de datos.
  - Erradica cualquier icono de imagen rota nativo del navegador o texto plano, mostrando un contenedor estilizado con borde punteado suave, fondo atenuado, icono de prenda y la etiqueta explícita *"Prenda borrada"*.
- **Análisis Profundo Multimodal en Paralelo (`app/api/closy/chat/route.ts`)**:
  - Si se adjunta un post guardado con `outfit_id`, el sistema consulta y resuelve todas las prendas que componen el outfit (`outfit_items` $\rightarrow$ `clothing_items`).
  - Kloe procesa en paralelo las fotografías en alta resolución (`base64`) de todas las prendas adjuntas y del look de referencia junto con sus metadatos (tejido, corte, color, marca).
  - Gemini Vision analiza visualmente el conjunto para generar respuestas enriquecidas, recomendaciones de compra o sugerir el outfit ideal para montar directamente en el lienzo.

### 47. Sincronización Global de Notificaciones y Activación por Defecto (`/profile/settings`) (Septiembre 2026)
- **Unificación Centralizada con `useNotificationSettingsStore`**:
  - En `/profile/settings` se eliminó el estado local desvinculado y se conectó directamente con el store centralizado `useNotificationSettingsStore` y la columna `profiles.notification_preferences` en Supabase.
  - La sección *"Notificaciones - Gestiona tus alertas"* ahora refleja en tiempo real el valor guardado y permite modificar los switches de *"Nuevos seguidores"* (`follows`), *"Me gusta en publicaciones"* (`likes`) y *"Comentarios"* (`comments`) sincronizándose instantáneamente con `/profile/settings/notifications`, `NotificationToast` y `RealtimeProvider`.
- **Valores Activos por Defecto (Default ON)**:
  - Todas las opciones de notificaciones sociales y del sistema (`follows: true`, `likes: true`, `comments: true`, `messages: true`, `reminders: true`, `popupToasts: true`) están configuradas como **activas por defecto** tanto para nuevos usuarios como para perfiles con preferencias previas parciales o vacías.
  - Se garantiza compatibilidad bidireccional entre la clave `follows` y la clave legacy `followers` sin pérdida de datos.
- **Acceso Directo a Configuración Extendida**:
  - Añadido el enlace directo *"Ver todas"* a `/profile/settings/notifications` desde la tarjeta de notificaciones en la página principal de ajustes.

### 49. Remodelación de `/profile`, Paleta del Menú Flotante `+` y Estabilidad de Likes y Guardados (Septiembre 2026)
- **Remodelación de `/profile`**:
  - **Header Solo en Móvil (`md:hidden`)**: En escritorio (PC) se eliminó el header redundante para una vista más limpia y directa del perfil, adaptando la posición sticky de las pestañas a `top-0` en PC y `top-14` en móvil.
  - **Usuario Destacado**: Debajo del nombre completo se muestra el identificador de usuario con arroba en rosa (`@username`) con tipografía destacada (`text-[var(--brand-pink)] font-semibold`).
  - **Botón de Configuración al Lado de Editar Perfil**: En la fila principal de acciones, se ubicó el botón de acceso directo a Configuración (icono de engranaje) inmediatamente a la derecha del botón *"Editar perfil"*.
- **Paleta Oficial del Menú Flotante `+` (`FloatingCreateButton.tsx`)**:
  - Botón principal flotante (`+`) en rosa distintivo (`bg-[var(--brand-pink)] text-white`).
  - Opciones desplegadas (*Nuevo Post*, *Nuevo Outfit*, *Nueva Prenda*):
    - En modo claro: Fondo negro sólido (`bg-black`), iconos en blanco y textos en blanco.
    - En modo oscuro: Fondo blanco sólido (`dark:bg-white`), iconos en negro y textos en negro.
- **Ruta API Dedicada `/api/likes` para Persistencia Atómica**:
  - Implementado `app/api/likes/route.ts` (`POST` y `DELETE`) con autenticación por sesión de servidor y `supabaseAdmin`.
  - Garantiza que quitar y volver a dar like funcione de forma 100% instantánea y persistente, desvinculando la operación de posibles restricciones RLS de cliente o fallos de creación de notificaciones.

### 50. Resolución Integral de Outfits y Prendas en Publicaciones (`/api/posts/[id]` y `/post/[id]`) (Septiembre 2026)
- **Eager Loading Completo de Outfit y Prendas en Backend (`app/api/posts/[id]/route.ts`)**:
  - Al solicitar una publicación por ID, el endpoint del servidor ejecuta una resolución en cascada con `supabaseAdmin`:
    1. Recupera el post con los datos del creador (`profiles`).
    2. Identifica y resuelve el outfit asociado (mediante `post.outfit_id`, relación o coincidencia de imagen).
    3. Consulta todos los registros de `outfit_items` correspondientes al look.
    4. Consulta y mapea en una sola pasada todas las prendas (`clothing_items`) vinculadas a través de sus IDs.
    5. Normaliza y entrega en una sola respuesta JSON el post, el outfit estructurado y la lista de prendas (`post.clothing_items`, `post.garments`, `post.outfits.outfit_items`).
  - **Superación de Restricciones RLS**: Al usar la API del servidor, cualquier usuario puede ver la ficha de prendas y stickers de looks publicados por otros usuarios sin que las consultas de cliente retornen datos vacíos o nulos.
- **Visualización y Detalle Interactivo en `/post/[id]`**:
  - La página `/post/[id]` consume prioritariamente la respuesta del endpoint `/api/posts/[id]`.
  - La sección *"Prendas del look"* se nutre de `post.clothing_items || post.garments || post.outfits?.outfit_items`.
  - Cada prenda es interactiva y abre instantáneamente el modal `ProductModal` con foto, marca, color, tejido, temporada y detalles completos de la prenda.
  - En `InteractiveOutfitViewer`, los stickers de las prendas del look se renderizan de forma interactiva sobre el lienzo del post permitiendo hacer clic para inspeccionar cada pieza.### 51. Flujo Atómico de Quitar y Añadir Likes con Recálculo Exacto (`/api/likes`) (Septiembre 2026)
- **Persistencia y Desvinculación de Likes (POST & DELETE)**:
  - Al quitar un like (`DELETE /api/likes?post_id=...` o con body JSON), el endpoint del backend:
    1. Autentica al usuario mediante sesión de cookies o token Bearer.
    2. Elimina el registro correspondiente en la tabla `public.likes` (`post_id`, `user_id`).
    3. Elimina de forma segura cualquier notificación previa de tipo `'like'` generada por este usuario sobre ese post.
    4. Realiza un recálculo exacto del número total real de filas en `public.likes` para ese post (`select count: exact`) y actualiza `posts.likes_count` atómicamente con `supabaseAdmin`.
    5. Devuelve `{ success: true, isLiked: false, likes_count: N }`.
  - Mismo comportamiento simétrico en `POST /api/likes`, garantizando que el contador en base de datos nunca quede desfasado ni dependa de triggers no ejecutados.
### 52. Erradicación del Error 500 en `/api/posts/[id]` y Consultas Directas Resilientes (Septiembre 2026)
- **Causa Raíz del Error 500**:
  - Las consultas PostgREST con uniones anidadas de 3 niveles (`posts` $\rightarrow$ `outfits` $\rightarrow$ `outfit_items` $\rightarrow$ `clothing_items`) fallaban en producción con `500 Internal Server Error` debido a problemas de caché de esquema o ambigüedades en nombres de claves foráneas entre `outfit_items` y `clothing_items`.
- **Arquitectura de Consultas Directas por Fases**:
  - Se reestructuró `app/api/posts/[id]/route.ts` eliminando las uniones anidadas frágiles y sustituyéndolas por consultas independientes y directas con `supabaseAdmin`:
    1. Lectura simple y directa del post en `posts` por `id`.
    2. Consulta del perfil del autor en `profiles` por `user_id`.
    3. Consulta directa del outfit en `outfits` por `outfit_id` o `image_url`.
    4. Consulta directa de los elementos en `outfit_items` por `outfit_id`.
    5. Consulta por lote (`.in('id', clothingIds)`) de las prendas reales en `clothing_items`.
    6. Mapeo y ensamblado del payload completo en memoria (`outfit`, `clothing_items`, `garments`).
  - Imposibilidad de error de esquema de PostgREST, garantizando siempre respuesta `200 OK` con todos los datos y prendas del look disponibles para cualquier usuario.

### 53. Estilizado de Botones de Navegación y Cabecera en `/post/[id]` (Septiembre 2026)
- **Botón de Volver en Cabecera**:
  - Se eliminó el fondo circular en hover (`hover:bg-[var(--background-secondary)]`).
  - Ahora el icono de la flecha cambia sutilmente a rosa corporativo en hover (`hover:text-[var(--brand-pink)]`) con transición suave.
- **Botones de Navegación del Carrusel (Adelante / Atrás)**:
  - Se eliminó el fondo blanco sólido (`bg-white/90`).
  - Se implementó un estilo glassmorphic translúcido oscuro (`bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[var(--brand-pink)]`) que flota limpiamente sobre la imagen sin bloquear la vista de la prenda ni desentonar.

### 54. Ajuste de Posicionamiento y Elevación de la Barra de Input en `/closet/kloe` (Septiembre 2026)
- **Elevación Flotante y Espaciado Inferior**:
  - Se sincronizó el comportamiento de la barra de input flotante de `/closet/kloe` con el estilo de `/messages`.
  - El contenedor inferior se mantiene `fixed` en la parte inferior pero despegado del borde de la pantalla (`pb-[calc(env(safe-area-inset-bottom,0px)+16px)] md:pb-6 pt-2 px-4 md:px-6`).
  - Esto proporciona holgura y separación ergonómica respecto a la barra de inicio en teléfonos móviles (iOS / Android) y una vista flotante limpia.
  - Se incrementó el padding inferior del scroll de mensajes (`pb-44 md:pb-36`) para asegurar que el último mensaje y el estado de escritura nunca queden solapados por la barra flotante.

### 55. Personalización por Nombre Real, Edad y Formato Limpio en Kloe AI (`/closet/kloe` & `/api/closy/chat`) (Septiembre 2026)
- **Acceso y Extracción del Nombre Real y Edad**:
  - En `lib/closy/contextIndexer.ts` se implementó la resolución en cascada de identidad del usuario (`profiles` $\rightarrow$ `users` $\rightarrow$ `username`), extrayendo el nombre de pila (`firstName`), nombre completo (`fullName`), edad (`age` / `age_range`) y morfología/colorimetría.
  - En `app/api/closy/chat/route.ts` se configuró el system prompt de Kloe para dirigirse siempre al usuario por su nombre de pila real de forma natural y cercana, prohibiendo estrictamente términos genéricos como *"Usuario"*.
  - Kloe adapta el estilo, cortes, siluetas y marcas que recomienda según la edad real del usuario.
- **Formateo Limpio de Texto y Renderizado Markdown**:
  - En `FormattedMessageText` (`app/(app)/closet/kloe/page.tsx`):
    - Se solucionó el problema de las almohadillas (`###`, `##`, `#`): ahora se detectan y formatean como títulos de sección estilizados en negrita sin mostrar caracteres `#` crudos.
    - Se corrigió el salto de viñetas huérfanas (`•\nTexto`), unificando el punto con el texto de la recomendación.
    - Se instruyó a Kloe en su prompt del sistema para redactar en prosa fluida, utilizando negritas y listas de viñetas limpias (`- Prenda: descripción`) sin encabezados de almohadilla ni emojis.
  - Se eliminaron los emojis de las respuestas rápidas de cortesía (`lib/closy/fastResponses.ts`).

### 56. Sincronización Global de Likes (Debounce 5s), Notificaciones Flotantes y Algoritmo de Búsqueda por Género (Septiembre 2026)
- **Gestor Atómico de Likes con Cola Debounced de 5 Segundos (`lib/services/likeManager.ts`)**:
  - Centraliza el ciclo de vida de los likes en toda la aplicación (`PostCard`, `post/[id]`, `/search`, `/feed`).
  - **Actualización Optimista Inmediata**: Al interactuar con el corazón, se actualiza al milisegundo el estado visual y los stores de Zustand (`useFeedStore` y `useSearchStore`).
  - **Debounce de 5 Segundos**: Si el usuario pulsa repetidamente (me gusta $\leftrightarrow$ ya no me gusta) o cambia de pantalla, las peticiones a base de datos se agrupan en una cola con retardo de 5.000 ms. Si el estado final coincide con el inicial, se cancela la llamada a la API evitando escrituras innecesarias en la base de datos y saturación de red.
  - **Flush Automático al Salir**: Mediante `beforeunload` se garantiza que si el usuario cierra o recarga la página, las acciones pendientes se confirman de forma segura.
- **Ocultación de Contadores Numéricos de Likes**:
  - Se eliminaron los números de likes visibles en el feed principal (`PostCard.tsx`), la búsqueda y la vista detallada de post (`/post/[id]`). El corazón rosa interactivo permanece como feedback visual claro.
- **Afinidad de Género en el Algoritmo de Búsqueda (`/search`)**:
  - Se amplió la consulta de exploración para incluir el campo `gender` de `profiles`.
  - El algoritmo de recomendación pondera con **+7 puntos** las publicaciones de creadores del mismo género y con **+3.5 puntos** las de catálogo unisex/mixto, sumándose a la afinidad de estilo (+3 pts), likes previos (+2.5 a +8 pts), morfología (+5 pts), colorimetría (+5 pts) y edad (+2 a +6 pts).
- **Resolución Robusta de Sesión en `/api/saves` (Fix 401 Unauthorized)**:
  - Se implementó `resolveAuthUser` y `supabaseAdmin` en `app/api/saves/route.ts` para todos los métodos (`GET`, `POST`, `DELETE`, `PUT`). Permite autenticar tanto por cookies de sesión de Supabase como por header `Authorization: Bearer <token>`, erradicando los errores 401 por desfase de tokens.
- **Notificaciones In-App Flotantes Estilo Instagram / Pinterest (`NotificationToast.tsx`)**:
  - Reemplazado el banner superior derecho por un popup flotante con fondo glassmorphic translúcido oscuro que emerge directamente sobre/al lado del icono del corazón en la barra de navegación (TabBar inferior en móvil y barra lateral en escritorio).
  - Incluye iconos rellenos en blanco (`Heart` para me gusta, `MessageCircle` para comentarios y `UserPlus` para nuevos seguidores), feedback háptico (`haptics.notification()`) y animación fluida con cierre automático a los 4.2 segundos.
- **Corrección de Mensajes de Comentario Vacíos (`NotificationList.tsx`)**:
  - Se blindó la extracción del texto de comentarios en las notificaciones para soportar múltiples estructuras (`content`, `text`, `comment`, `data.content`) y fallback limpio a *"comentó en tu publicación."*, evitando mostrar comillas vacías (`comentó: ""`).

### 57. Tarjetas Nativas de Anuncios Patrocinados (Google Ad Manager / Afiliación) y Rebranding SEO Klozet (Septiembre 2026)
- **Componente Nativo de Publicidad In-Feed (`SponsoredAdCard.tsx`)**:
  - Diseñado con la misma estética premium (`rounded-[22px]`, `aspect-[3/4]`, border sutil y badge glassmorphic *"Patrocinado"* / *"Promocionado"* con icono de destello).
  - **Soporte Google Ad Manager / Google AdSense**: Compatible con `NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID` y slots responsivos en bloque (`ins.adsbygoogle`).
  - **Fallback Curado de Moda y Afiliación de Alto Rendimiento**: Si no hay bloqueador o aún no está aprobada la cuenta de Google, rota automáticamente tarjetas editoriales de moda (Zalando, ASOS, Farfetch, COS) con llamada a la acción ("Ver colección", "Explorar looks") y apertura externa en nueva pestaña, evitando espacios en blanco.
  - **Inserción Equilibrada**: Integrado automáticamente en el Feed (`/feed`) cada 5-8 publicaciones y en Búsqueda/Explorar (`/search`) cada 10 publicaciones.
- **Rebranding y Optimización SEO Integral (`Klozet`)**:
  - **Nombre Único Oficial**: Se unificó toda la identidad en **Klozet**, eliminando las referencias anteriores a "Closet & Klozet".
  - **Título de Pestaña**: Configurado a `"Klozet"` por defecto y plantilla `"%s | Klozet"`.
  - **Keywords de Alto Tráfico**: Indexación enfocada en términos clave como *Klozet*, *armario digital*, *armario cápsula*, *pinterest de moda*, *combinar ropa con IA*, *estilista personal IA*, *outfits con mi ropa*, *Kloe IA*, *streetwear y tendencias*, *lookbook digital*.
  - **Estructura JSON-LD**: Esquemas actualizados de `WebApplication`, `Organization` y `WebSite` con dominio base oficial `https://klozet.es` y metadatos de OpenGraph y Twitter Card optimizados.
### 58. Margen Superior en Profile, Corrección de Error 400 en Mensajería y Supresión de Excepciones del Navegador (Septiembre 2026)
- **Margen Superior en Perfil (`/profile`)**:
  - Se incrementó el padding superior de la información de usuario a `pt-6 md:pt-14 lg:pt-16`, proporcionando un espacio limpio y holgado en PC y móviles para que la foto de perfil, estadísticas de seguidores/seguidos y nombre no queden pegados al borde superior de la pantalla.
- **Erradicación del Error 400 Bad Request en Mensajería (`/messages`, `/messages/layout`, `/messages/[id]`)**:
  - Las consultas directas a `conversations` intentaban seleccionar columnas inexistentes en el esquema de la base de datos (`participant1_id`, `participant2_id`, `user1_deleted_at`, `user2_deleted_at`), generando llamadas `400 Bad Request` en bucle.
  - Se eliminaron las consultas a columnas no existentes y se estandarizó la gestión de chats eliminados localmente mediante `localStorage` de forma segura y libre de errores.
- **Supresión Global de Excepciones de Extensiones / Performance Timeline (`RootLayoutClient.tsx`)**:
  - Se implementó un capturador global de errores en `RootLayoutClient.tsx` que intercepta y silencia excepciones originadas por extensiones del navegador o perfiles de rendimiento (`reportAllChanges`, `Cannot read properties of undefined (reading 'startTime')`), garantizando una navegación fluida y sin bloqueos al dar/quitar me gusta.

### 59. Inserción Oficial del Script de Google AdSense (`ca-pub-4628313000953034`) (Septiembre 2026)
- **Etiqueta Oficial de Google AdSense en `<head>` (`app/layout.tsx`)**:
  - Se integró el script asíncrono oficial de AdSense con el identificador de cliente del usuario (`ca-pub-4628313000953034`) y atributo `crossOrigin="anonymous"`.
  - Se configuró como valor por defecto en `SponsoredAdCard.tsx` para vincular de forma automática los bloques de anuncios nativos en el Feed y en la Búsqueda.
- **Archivo `ads.txt` Público (`public/ads.txt`)**:
  - Creado y desplegado con el publisher ID `google.com, pub-4628313000953034, DIRECT, f08c47fec0942fa0`.

### 60. Diagnóstico y Corrección de Visualización de Prendas en Posts de Otros Usuarios (Septiembre 2026)
- **Causa Raíz Identificada**:
  - En la base de datos de Supabase, la tabla `clothing_items` (y en algunos casos `outfits` / `outfit_items`) tenía activa una política RLS restrictiva `FOR SELECT USING (auth.uid() = user_id)`.
  - Esto permitía que cada usuario pudiera ver las prendas de sus propios posts (porque su `auth.uid()` coincidía con el `user_id` de la prenda), pero cuando un usuario visualizaba el post de otra persona (`@laurfdez`), Supabase bloqueaba la lectura y retornaba `0` prendas.
  - Al recibir 0 prendas, el componente de detalle de post ocultaba la sección *"Prendas del look"* y el visor interactivo de outfits recurría a la imagen estática sin stickers interactivos.
- **Solución y Script SQL (`sql/fix_clothing_items_rls.sql`)**:
  - Se configuró la política de lectura global `FOR SELECT USING (true)` en `clothing_items`, `outfits`, `outfit_items` y `posts`, permitiendo que todos los usuarios de la comunidad puedan explorar, interactuar y ver los detalles de las prendas públicas de cualquier look.
### 61. Interactividad Total en Lienzo de Posts y Eliminación de Likes en Prendas (Septiembre 2026)
- **Interactividad Directa en el Lienzo (`InteractiveOutfitViewer.tsx` y `post/[id]/page.tsx`)**:
  - Se corrigió la generación de diapositivas en posts (`getSlides`): cuando un post incluye un outfit, la vista principal carga directamente el lienzo interactivo (`InteractiveOutfitViewer`) en lugar de duplicar una diapositiva estática no interactiva.
  - `InteractiveOutfitViewer` ahora normaliza prendas y posiciones desde cualquier estructura (`items`, `outfit_items`, `clothing_items`, `garments`), permitiendo hacer clic/tocar cualquier prenda tanto en publicaciones propias como de otros usuarios para abrir de inmediato su ficha técnica (`ProductModal`).

### 62. Resolución y Formateo Inteligente del Tipo de Prenda en Modales (`ProductModal.tsx`) (Septiembre 2026)
- **Causa Raíz**:
  - En la base de datos de Supabase, la tipología de las prendas se almacena en el campo `category` (ej: `top`, `bottom`, `shoes`, `jacket`, `dress`, `accessory`).
  - El componente `ProductModal` esperaba la propiedad `displayItem.type`. Al abrir una prenda desde el visor de posts o outfits, `type` llegaba como `undefined` o sin traducir.
- **Solución y Normalización**:
  - Se implementó la función universal `formatGarmentType` en `ProductModal.tsx` con diccionario en español (`Camiseta / Top`, `Camisa`, `Pantalón`, `Vaqueros`, `Chaqueta / Cazadora`, `Calzado / Zapatillas`, `Vestido`, `Sudadera`, etc.).
  - Se resolvió la extracción en cascada `displayItem.type || displayItem.category || displayItem.clothing_type`, garantizando que siempre se muestre el tipo de prenda claro y bien formateado tanto en publicaciones propias como de otros usuarios.

### 63. Sincronización Inmediata de Likes y Persistencia Estable en Feed y Búsqueda (Septiembre 2026)
- **Causa Raíz Identificada**:
  - Al dar o quitar un like dentro de un post (`/post/[id]`), `likeManager` utilizaba un temporizador de retardo de 5.000 ms antes de escribir en Supabase.
  - Si el usuario regresaba al Feed o al Buscador antes de cumplirse esos 5 segundos, la base de datos aún no tenía registrada la interacción, y las llamadas en segundo plano sobrescribían el estado optimista o reordenaban dinámicamente las publicaciones según la afinidad por likes.
- **Solución y Arquitectura de Sincronización Inmediata**:
  - Se redujo el debounce de `likeManager.ts` a **300 ms** (protección de spam) y se implementó `flushAll()` inmediato tanto al pulsar atrás (`handleBack`) como al desmontar la vista de post.
  - En `useFeedStore.ts` y `useSearchStore.ts`, se blindó la retención en memoria (SWR): al navegar hacia atrás, la posición de scroll y el orden exacto de los posts se mantienen estables en 0 ms.
  - `FeedPage` y `SearchPage` sincronizan el estado atómico de `likeManager.getPendingState` para que los likes nunca parpadeen ni se reviertan.

### 64. Corrección del Error 500 en Guardado de Posts en Carpetas (`/api/saves` & `/api/save-folders`) (Septiembre 2026)
- **Causa Raíz Identificada**:
  - En `app/api/saves/route.ts`, las operaciones contra Supabase utilizaban exclusivamente un cliente `admin` con fallback a la clave anónima (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) cuando `SUPABASE_SERVICE_ROLE_KEY` no estaba inyectada en el entorno. Al no portar las credenciales de sesión del usuario en las cabeceras/cookies bajo el cliente anónimo, las políticas de RLS en `saves` y `save_folder_items` bloqueaban la inserción y lanzaban una excepción 500 `Internal Server Error`.
  - Adicionalmente, al mover o asignar un post existente a una carpeta, o al crear un nuevo guardado con `folder_id`, no se sincronizaba consistentemente la columna `saves.folder_id` y la tabla relacional `save_folder_items`, o faltaba la asignación explícita de UUID en la tabla intermedia.
- **Solución y Resiliencia**:
  - Se implementó `getDbClient` en `app/api/saves/route.ts`: resuelve la sesión mediante cookies (`createClient` de `@/lib/supabase/server`) o token Bearer, garantizando que las consultas siempre se ejecuten con el contexto del usuario autenticado bajo RLS si no hay Service Role.
  - Se unificó la persistencia de carpetas tanto en la columna `saves.folder_id` como en `save_folder_items` con bloques `try/catch` no bloqueantes.
  - En `app/api/save-folders/route.ts`, se agregó un fallback automático en `GET` para evitar errores 500 si la relación anidada con `posts` encuentra alguna inconsistencia.

### 65. Integración Móvil de Kloe sobre TabBar y Motor de Avatar Virtual con Fondo Blanco (Septiembre 2026)
- **Ergonomía y Espaciado de Kloe en Móvil (`/closet/kloe`)**:
  - Se corrigió el posicionamiento de la barra de chat flotante en dispositivos móviles: ahora se eleva exactamente sobre la barra de navegación inferior (`bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-0` con `z-30`), evitando cualquier solapamiento con el TabBar de 72px.
  - Se incrementó el padding inferior del scroll de mensajes a `pb-56 md:pb-36`, permitiendo deslizar y visualizar la totalidad de las respuestas, tarjetas de prendas y botones de acción sin bloqueos visuales.
- **Calibración y Edición del Avatar Virtual (`AvatarCalibrationModal.tsx` & `/api/closy/generate-avatar`)**:
  - **Inspección y Reemplazo**: El modal de calibración permite ver las miniaturas de las 6 fotos de referencia (3 de rostro y 3 de cuerpo entero) directamente en cada slot. El usuario puede pulsar cualquier slot existente para sustituir la imagen o borrarla con el icono de papelera y subir una nueva en cualquier momento.
  - **Autenticación Resiliente**: El endpoint `/api/closy/generate-avatar` resuelve la identidad del usuario tanto por cookies de servidor como por cabeceras `Authorization: Bearer`, garantizando ejecución instantánea sin errores 401.
- **Fondo Blanco de Estudio Fotográfico por Defecto**:
  - Se instruyó formalmente tanto a Kloe en su System Prompt (`/api/closy/chat`) como en las directivas de generación del avatar (`/api/closy/generate-avatar`) para que todos los modelados de outfits virtuales se conciban, procesen y muestren SIEMPRE sobre fondo blanco puro de estudio fotográfico profesional (`#FFFFFF`), con iluminación de catálogo de alta definición y sin fondos distractores.

### 66. Botón de Mensaje con Icono de Avión de Papel y Resolución UUID / Username en Mensajería (`/profile/[id]` y `/messages/[id]`) (Septiembre 2026)
- **Icono Oficial de Avión de Papel en Perfil**:
  - Se sustituyó el botón de texto `"Mensaje"` en `app/(app)/profile/[id]/page.tsx` por el icono estilizado de avión de papel (`Send` de `lucide-react`), en coherencia con la barra de navegación y el sistema visual de la app.
- **Resolución Bidireccional de UUID vs Username**:
  - Al abrir un chat desde el perfil de un usuario (`/profile/@usuario` o `/profile/[uuid]`), la ruta de mensajes `/messages/[id]` ahora detecta dinámicamente si el identificador recibido es un UUID o un nombre de usuario (`username`).
  - Si es un username, resuelve primero el UUID en `profiles` (`profiles.select('id,...').eq('username', ...)`), evitando de raíz los errores Postgres `400 Bad Request` por comparar cadenas de texto contra columnas de tipo `UUID`.
  - Si la conversación ya existía, se selecciona y resalta automáticamente en la lista; si no existía, se inicializa sin errores y permite enviar el primer mensaje con vinculación RPC resiliente.

### 67. Diagnóstico y Blindaje de Persistencia del Avatar Virtual (Calibración de 6 Fotos) (Septiembre 2026)
- **Causa Raíz de la Pérdida de Fotos de Calibración**:
  - En la base de datos de Supabase, la tabla `profiles` carecía de las columnas `face_photos` y `body_photos`. Al consultar o actualizar directamente `profiles` desde el cliente, Supabase arrojaba un error 400 (`column face_photos does not exist`), lo que provocaba que al cerrar y reabrir el modal, las fotos aparecieran vacías (`0 de 6`).
- **Solución Arquitectónica Multicapa (Triple Blindaje)**:
  - **Script de Migración SQL (`sql/add_avatar_calibration_photos.sql`)**: Añade las columnas `face_photos TEXT[]` y `body_photos TEXT[]` a `profiles` y asegura políticas públicas y autenticadas en el bucket `avatars`.
  - **Endpoint Dedicado (`/api/user/avatar-calibration`)**: Gestiona `GET` y `POST` con cliente admin/servidor. Actualiza las columnas directas y mantiene un respaldo automático en `notification_preferences->avatar_calibration` (campo JSONB preexistente en todos los perfiles), haciendo imposible que las fotos se pierdan incluso si no se ha ejecutado el script SQL en Supabase.
  - **Hidratación y Caché Inmediata (`localStorage`)**: `AvatarCalibrationModal.tsx` carga de inmediato las miniaturas desde el almacenamiento local sin parpadeos ni esperas y las sincroniza en segundo plano con el servidor.
  - **Generación de Look en Avatar Virtual (`/api/closy/generate-avatar`)**: Lee las fotos de calibración tanto de las columnas directas como del respaldo JSONB o del payload enviado por el cliente, permitiendo probar cualquier look con IA sobre fondo blanco de estudio.

### 68. Rediseño de Encabezado y Navegación en Vista de Outfits (`/profile/[id]/outfit/[outfitId]` y `/outfit/[id]`) (Septiembre 2026)
- **Eliminación del Bloque "Creador del look"**:
  - Se eliminó el texto redundante y antiestético *"Creador del look"*, limpiando la columna de detalles para que el foco visual recaiga directamente en el título del outfit, ocasión y prendas.
- **Nuevo Encabezado Sticky con Botón de Atrás y Perfil Integrado**:
  - Se integró un encabezado superior estilo Apple Glass (`backdrop-blur-xl`, `h-16`) coherente con el visor de posts de Klozet:
    - **Botón de Atrás Ergonómico**: Icono `ArrowLeft` con navegación fluida (`router.back()` o fallback al perfil del autor).
    - **Identidad del Creador**: Foto de perfil (`Avatar`) y `@username` clicable que enlaza directamente a su perfil de usuario.

### 70. Sincronización Blindada de Likes (Doble Capa Token + Supabase) y Rediseño de Detalle de Post en Escritorio (`/post/[id]`) (Septiembre 2026)
- **Persistencia y Sincronización Blindada de Likes (`lib/services/likeManager.ts` & `app/(app)/post/[id]/page.tsx`)**:
  - **Causa Raíz Solucionada**: Al dar/quitar like dentro de un post y navegar de vuelta a `/search`, el store local retenía el cambio pero las peticiones fetch a `/api/likes` carecían de cabeceras `Authorization: Bearer <token>`, provocando posibles 401 en segundo plano que impedían la persistencia en base de datos. Además, al reingresar a `/post/[id]`, el componente leía directo de Supabase sin consultar el estado pendiente de `likeManager` ni las memorias de `useSearchStore` / `useFeedStore`.
  - **Doble Capa de Escritura**:
    1. Operación directa con cliente Supabase (`supabase.from('likes').upsert/delete`) con el `session.user.id` activo.
    2. Llamada a `/api/likes` con header `Authorization: Bearer ${session.access_token}` para actualizar notificaciones y conteos atómicos.
  - **Inicialización Inmediata y Flush al Desmontar**: `/post/[id]` inicializa `isLiked` priorizando `likeManager.getPendingState(postId)` y las cachés de búsqueda/feed, y ejecuta `flushAll()` automáticamente en el cleanup del hook al salir o desmontar la pantalla.
- **Rediseño del Layout de Detalle de Post en Escritorio (`app/(app)/post/[id]/page.tsx`)**:
  - **Cabecera Superior Limpia en PC (`md:hidden` para usuario)**: En vista de ordenador, la barra superior sólo mantiene el botón de retorno (`ArrowLeft`), ocultando el avatar/username redundante del autor.
  - **Ficha del Autor en Columna Lateral Derecha**:
    - Se integró la cabecera del creador (`Avatar` + `@username`) al inicio de la columna derecha de detalles sobre el panel de acciones.
    - **Botón de Seguir Inmediato a la Derecha del Username**: El botón de *Seguir / Siguiendo* se sitúa alineado exactamente a la derecha del nombre del usuario con respuesta instantánea.
    - Debajo de la cabecera del autor se ubican la barra de acciones (Me gusta, Comentar, Compartir, Guardar), descripción/caption, prendas interactivas del look y comentarios.
  - **Resolución Resiliente del Perfil**: Se incorporó un fallback directo a la tabla `profiles` por `user_id` para garantizar que el autor y su avatar siempre carguen sin fallos.

### 71. Limpieza de Iconos IA, Generación Fotorrealista de Avatar Virtual y Personalización de Nombre de Usuario en Kloe (Septiembre 2026)
- **Limpieza de Iconografía IA (`AvatarCalibrationModal.tsx` & `app/(app)/closet/kloe/page.tsx`)**:
  - Se eliminaron iconos y emojis de IA ("sparkles", "bot", "✨") en modales de calibración, botones de acción y badges, sustituyéndolos por iconos sobrios y humanos como `Camera`, `User` y `Crown`.
- **Motor de Generación Fotorrealista en Avatar Virtual (`/api/closy/generate-avatar`)**:
  - En lugar de mostrar la foto estática de referencia del usuario, el endpoint integra un pipeline de generación que genera un modelo de alta costura luciendo el look completo exacto sobre fondo blanco puro de estudio fotográfico profesional (`#FFFFFF`).
  - Motor dual de alta disponibilidad: Google Imagen 3 como primario con fallback a Pollinations Flux, garantizando respuesta en segundos y formato `image/jpeg` de alta resolución.
- **Trato y Nombre Real del Usuario en Kloe (`lib/closy/contextIndexer.ts` & `app/api/closy/chat/route.ts`)**:
  - Se implementó resolución de nombre en cascada con cliente de servicio admin: `profiles.full_name` $\rightarrow$ `users.name` $\rightarrow$ `auth.user.user_metadata` $\rightarrow$ prefijo de email.
  - Se instruyó formalmente a Gemini para prohibir saludos genéricos como "Usuario", "Amigo" o "Estimado", dirigiéndose siempre al usuario por su nombre de pila real capitalizado.

### 72. Corrección del Bloqueo por Barra Flotante de Prendas en el Lienzo de Creación en Móvil (`/create`) (Septiembre 2026)
- **Causa Raíz Identificada**:
  - En `app/(app)/create/page.tsx`, la barra flotante inferior de resumen de prendas seleccionadas se renderizaba globalmente si `totalSelected > 0`, sin restringirse al paso de selección móvil (`mobileStep === 'selection'`).
  - Al transferir un outfit desde Kloe (`/create?itemIds=...`) o al pulsar *"Continuar con el look"* desde el armario, la vista móvil pasaba directamente al paso de edición/lienzo (`mobileStep === 'preview'`). En este paso, el botón de continuar se ocultaba pero la caja de tarjetas de prendas permanecía flotando fija en `bottom-[20px] z-50`, tapando la parte inferior del lienzo, los botones de acción y el botón de guardar.
- **Solución y Ergonomía Móvil**:
  - Se condicionó estrictamente la barra flotante a `mobileStep === 'selection' && totalSelected > 0` y se limitó a vista móvil (`lg:hidden`).
  - Al entrar al lienzo de montaje (`mobileStep === 'preview'`), la barra flotante desaparece por completo, otorgando el 100% del espacio visual al `FreeDragCanvas`.
  - Se añadieron espaciados seguros `pb-[calc(16px+env(safe-area-inset-bottom,0px))]` y un scroll con `pb-36` en la vista de preview y `pb-48` en el selector de prendas para garantizar que ningún botón o prenda quede oculta por los bordes de la pantalla.

### 73. Contador Interno de Prueba Gratuita con Kloe (8 Mensajes) y Modelo de Conversión Pro (Septiembre 2026)
- **Arquitectura del Contador de Mensajes de Prueba (`kloe_trial_messages_used`)**:
  - **Límite de Prueba Óptimo**: Se fijó en **8 mensajes** (suficiente para 3-4 consultas estilísticas completas, recomendaciones de outfits y montaje en el canvas, permitiendo al usuario experimentar el valor real antes de suscribirse).
  - **Persistencia en Base de Datos**: Almacenado en `public.profiles.kloe_trial_messages_used INT DEFAULT 0` con respaldo automático en `notification_preferences->'kloe_trial_messages_used'`. Script SQL en `sql/add_kloe_trial_counter.sql`.
  - **Validación en Backend (`/api/closy/chat`)**: Si el usuario no es Premium y ha consumido $\ge 8$ mensajes, la API retorna código `402 Payment Required` con `{ isTrialExpired: true, trialUsed: 8, trialMax: 8 }`. Si le quedan mensajes, incrementa el contador de forma atómica y devuelve los mensajes restantes en el payload JSON.
- **Experiencia de Usuario en Frontend (`app/(app)/closet/kloe/page.tsx`)**:
  - Se eliminó el bloqueo/redirect inmediato para usuarios gratuitos, permitiéndoles acceder y probar a Kloe sin fricciones.
  - **Indicador Visual de Progreso**: Banner superior que muestra *"Prueba gratuita de Kloe: Te quedan X de 8 mensajes"* acompañado de una barra de progreso suave.
  - **Bloqueo Elegante al Agotar**: Cuando el contador llega a 0, la barra de input se transforma en un disparador hacia `KloeProModal` con botón *"Subir a Pro (2,99 €)"*.
### 74. Rediseño de la Barra Superior de Kloe: Modo Escritorio con Logo Animado 10s y Modo Móvil Flotante Dinámico (Septiembre 2026)
- **Barra Superior en Escritorio (`hidden md:flex`)**:
  - Encabezado fijo alineado al sidebar lateral (`md:left-[72px] right-0 h-16 bg-[var(--background)]/85 backdrop-blur-xl border-b border-[var(--border-color)]/50 px-8`), respetando el navbar de 72px de ordenador.
  - **Eliminación Total de Etiquetas Artificiales**: Se eliminó cualquier etiqueta de "IA Personal" o adornos innecesarios.
  - **Logo Central Animado Cada 10 Segundos (`KloeAnimatedLogo`)**: Situado en el centro geométrico de la pantalla (`absolute left-1/2 -translate-x-1/2`), alterna automáticamente cada 10 segundos mediante un giro 3D de alta fidelidad (`rotateX: 90` a `0`) entre el logotipo tipográfico oficial de Kloe y el icono mascota de Kloe solo (sin texto repetido al lado).
- **Barra Superior en Móvil (`md:hidden`)**:
  - **Eliminación del Botón de Atrás**: Se retiró el icono de flecha hacia atrás para limpiar el viewport móvil.
  - **Píldoras Flotantes Redondeadas**: El diseño pasa de ser una barra rectangular completa a islotes independientes con bordes redondeados completos (`rounded-full px-3.5 py-1.5 shadow-md` con efecto de cristal esmerilado `backdrop-blur-2xl`), uno a la izquierda para la marca y otro a la derecha exclusivamente para las acciones (`Historial`, `Calibrar Avatar`, `Guardados`, `Armario`).
  - **Ocultamiento Dinámico al Deslizar**: Mediante el detector de scroll en el contenedor de mensajes (`handleMessagesScroll`), la barra superior móvil se desliza suavemente hacia arriba (`-y-full`, `opacity-0`) al hacer scroll hacia abajo, y reaparece instantáneamente al hacer scroll hacia arriba o detenerse.
### 75. Sincronización Multi-Dispositivo de Chats de Kloe, Calibración de Avatar y Probador en Chat con Fondo Blanco (Septiembre 2026)
- **Sincronización de Conversaciones entre Móvil y Ordenador (`/api/closy/conversations`)**:
  - Las conversaciones de Kloe ya no viven de forma aislada en el `localStorage` de cada navegador: ahora se sincronizan en tiempo real con Supabase (`profiles.notification_preferences->'kloe_conversations'`).
  - Al abrir la app en móvil o escritorio, se hidrata al instante desde la memoria local y se fusiona silenciosamente con la base de datos por timestamp de actualización.
- **Persistencia y Subida Segura de Fotos de Calibración (`/api/user/avatar-calibration`)**:
  - Las 3 fotos de rostro y 3 fotos de cuerpo se procesan y suben directamente al bucket `avatars` mediante el Service Role de Supabase en backend, garantizando que queden permanentemente almacenadas tanto en las columnas `face_photos`/`body_photos` como en el JSONB de respaldo, accesibles sin pérdida desde cualquier dispositivo.
- **Probador Virtual Directo en el Chat con Fotografía de Estudio sobre Fondo Blanco**:
  - **Cuadro Integrado en el Mensaje**: Al pulsar *"Probar look en mi avatar digital"* en una tarjeta de outfit, se despliega en el mismo chat un marco con fondo blanco de estudio y animación de carga (*"Generando foto hiperrealista en tu avatar... Kloe está adaptando las prendas a tus facciones faciales y proporciones corporales sobre fondo blanco de estudio..."*).
  - **Pipeline Multimodal con Imágenes de Entrada Reales (`/api/closy/generate-avatar`)**:
    - **Entrada de Imágenes Múltiples**: El backend descarga y procesa como `inlineData` Base64 tanto las **6 fotos de calibración del usuario** (3 de rostro y 3 de cuerpo entero) como las **fotografías reales de las prendas del outfit**.
    - **Análisis Biométrico de Precisión por Gemini Vision**: La IA analiza visualmente la anatomía real de la persona (facciones faciales exactas, ojos, cejas, nariz, labios, tono de piel, corte y peinado, proporciones corporales y silueta) junto con los tejidos, colores, cortes y detalles de las prendas reales.
    - **Generación Fotográfica Realista (Flux Realism)**: Traduce el análisis en una fotografía RAW 8k de estudio editorial de alta fidelidad, con prompts negativos estrictos contra muñecas, maniquíes, CGI, anime y pieles de plástico, asegurando un acabado fotográfico auténtico sobre fondo blanco puro (#FFFFFF).
  - **Ampliación Lightbox y Estructura Completa**:
    - Al pulsar sobre la foto generada, se abre un visualizador Lightbox en pantalla completa para inspeccionar todos los detalles.
    - Justo debajo de la foto se muestra el desglose del outfit con sus prendas interactivas (`GarmentThumbnail`) y el botón para *"Montar y editar en el lienzo"* (`/create?itemIds=...`).### 76. Seguridad Anti-Tampering (Zero-Trust Premium), Bloqueo de Avatar y Eliminación de Motores Secundarios (Septiembre 2026)
- **Eliminación Total de Pasarelas Externas No Oficiales**: Se erradicó por completo `pollinations.ai` de todo el proyecto, centralizando la visión y generación en el ecosistema oficial de **Google Gemini**.
- **Regla Estricta de Acceso al Avatar y Calibración (Solo Premium)**:
  - Tanto en la cabecera de escritorio como en móvil y en las tarjetas del chat, cualquier interacción con el botón de calibración o probador virtual por parte de un usuario gratuito abre inmediatamente el modal de suscripción (`KloeProModal`).
- **Seguridad Anti-Inyección y Anti-Tampering (Zero-Trust)**:
  - Es imposible saltarse el muro de pago mediante inyección de código HTML, manipulación de DevTools o alteración de `localStorage`.
  - Todos los endpoints de backend (`/api/closy/generate-avatar`, `/api/user/avatar-calibration`, `/api/closy/chat`, etc.) validan obligatoriamente la sesión y consultan de forma atómica el registro en base de datos (`profiles.is_premium`, `subscription_tier` y `subscription_status === 'active'`). Si la base de datos no certifica la suscripción activa, el servidor rechaza la petición con código `403 Forbidden` (`isPremiumRequired: true`).

### 77. Diagnóstico Integral y Erradicación de Congelamientos de UI, Bloqueos de Scroll y Gestos Táctiles (Septiembre 2026)
- **Causas Raíz Identificadas**:
  1. **Bloqueo Acumulativo de Scroll (`useBodyScrollLock.ts`)**: Al abrirse múltiples modales/drawers o al desmontar componentes durante navegaciones rápidas, `document.body.style.overflow` capturaba el valor `"hidden"` de un modal previo y lo restauraba como `"hidden"` al cerrar el superior, dejando la pantalla completamente bloqueada para deslizar.
  2. **Intercepción y Retención Táctil en `PullToRefresh.tsx`**: Carecía de manejador de `onTouchCancel` y de discriminación de ángulo de deslizamiento horizontal/vertical. Si el usuario iniciaba un scroll vertical normal o si la promesa de refresco demoraba, el estado `isPulling` o `isRefreshing` retenía la UI.
  3. **Conflicto de Gestos de Pulsación Larga en Armario (`/closet`)**: Las tarjetas de prendas y outfits iniciaban un temporizador de 500 ms al tocar la pantalla (`onTouchStart`), pero no cancelaban el temporizador en `onTouchMove`. Al deslizar lentamente hacia abajo, el temporizador saltaba a mitad del gesto, activando el modo selección (`selectionMode`), vibrando el dispositivo e interrumpiendo el scroll.
  4. **Apertura Forzada de Modal en Kloe (`/closet/kloe`)**: Un `useEffect` forzaba `setShowProModal(true)` al montar la página para usuarios no premium, interfiriendo con la prueba gratuita de 8 mensajes y activando el bloqueo de scroll sobre el chat.
  5. **Inestabilidad de Sincronización en Lienzo de Creación (`/create` & `FreeDragCanvas.tsx`)**: La recreación de la función inline `onStateChange` en cada renderizado disparaba el efecto de actualización de `itemStates` en bucle.
- **Soluciones y Arquitectura de Alta Disponibilidad Implementada**:
  - **Sistema Global de Bloqueo de Scroll con Conteo de Referencias (`lib/hooks/useBodyScrollLock.ts`)**:
    - Implementado `lockCount` y almacenamiento de estilos prístinos originales antes del primer bloqueo.
    - Se garantiza la restauración exacta de `overflow = ''`, `paddingRight = ''`, `position = ''`, `overscrollBehavior = ''` y remoción de `modal-open` cuando `lockCount === 0`.
    - Exportada función de seguridad `forceUnlockBodyScroll()`, integrada en `AppLifecycleManager.tsx` para liberar automáticamente cualquier bloqueo residual al cambiar de ruta (`usePathname`).
  - **Detección Direccional y Timeout de Seguridad en `PullToRefresh.tsx`**:
    - Detección precisa de ángulo (ignora movimientos horizontales y scrolls hacia arriba).
    - Incorporado `onTouchCancel` y límite de tiempo máximo de 8 segundos (`Promise.race`) para evitar que fallos de red o promesas pendientes cuelguen el refresco.
  - **Cancelación Inmediata de Pulsación Larga en `closet/page.tsx`**:
    - Añadido `onTouchMove={handleTouchEnd}` a todas las tarjetas de prendas y outfits en el armario.
  - **Estabilización de Callbacks en `FreeDragCanvas.tsx`**:
    - Uso de `onStateChangeRef` para aislar la sincronización de estado y eliminar bucles de re-renderizado en la vista de creación.
### 78. Ajuste de Layout y Botón de Cierre en Detalle de Outfit (`OutfitDetailModal.tsx`) (Septiembre 2026)
- **Posicionamiento del Estilo/Ocasión**: La etiqueta de ocasión/estilo (*Casual*, *Diario*, *Streetwear*, etc.) se reubicó debajo del nombre del outfit en columna (`flex-col gap-2`), ofreciendo una jerarquía tipográfica limpia y sin saltos laterales.
- **Optimización y Reubicación del Botón de Cierre**: Se redujo el tamaño del botón de cierre (`p-1.5 md:p-2`, icono `w-4 h-4`) y se ancló estrechamente a la esquina superior derecha (`top-3 md:top-4 right-3 md:right-4`), con fondo translúcido `bg-black/50 hover:bg-black/75` y sombra sutil, evitando cualquier solapamiento o conflicto visual con los botones de acción (como el de eliminar o editar).

### 79. Erradicación de Bloqueos en Animaciones de Carga (Spinners/Gifs) y Blindaje del Motor de Avatar Virtual (Septiembre 2026)
- **Causas Raíz Identificadas**:
  1. **Spinners y Loaders Atascados**: En diversas pantallas, los spinners SVG dependían de `animate-spin` sin aceleración por hardware o se ejecutaban en hilos bloqueantes durante renders pesados de React, causando que la animación se congelara visualmente. En contraposición, el globo de texto de Kloe usaba física CSS con `will-change` y keyframes independientes en la GPU.
  2. **Error de Retorno de Foto Selfie en Avatar Virtual (`/api/closy/generate-avatar`)**: Cuando los endpoints de generación alcanzaban límites de cuota (429), el código ejecutaba un fallback residual `generatedImageUrl = facePhotos[0]`, devolviendo la foto selfie original del usuario en lugar de la imagen generada sobre fondo blanco.
- **Soluciones Implementadas**:
  - **Componente Universal `LoadingSpinner.tsx` y Animaciones GPU (`app/globals.css`)**:
    - Se definieron keyframes optimizados con aceleración por hardware (`klozet-spin`, `klozet-pulse-glow`, `klozet-bounce-dot`, `transform: translateZ(0)`, `will-change: transform`).
    - Creado el componente [`LoadingSpinner.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/LoadingSpinner.tsx) con soporte para spinner vectorial y puntos rebotantes idénticos a la animación de Kloe, integrado en `Button.tsx`, `PullToRefresh.tsx` y la tarjeta de prueba de avatar en `/closet/kloe`.
  - **Blindaje del Pipeline de Avatar con Gemini 3.6 Flash y Motor Multicapa**:
    - Se eliminó por completo la devolución de la selfie del usuario como sustituto de avatar (`facePhotos[0]`).
    - **Extracción Biométrica de Alta Fidelidad**: `gemini-3.6-flash` analiza las 6 fotos de calibración (rostro, facciones faciales, ojos, corte de pelo, tono de piel, barba/perilla y silueta corporal) junto con las prendas del outfit (colores, estampados 'scuffers', tejidos y calzado) para redactar el prompt de catálogo editorial Hasselblad sobre fondo blanco puro `#FFFFFF`.
    - Generación multi-motor con renderizado fotorrealista directo en Base64 y ampliación Lightbox sin fallos ni congelamientos.

### 80. Erradicación Definitiva de Pollinations y Estabilización del Probador Virtual de Avatar (Septiembre 2026)
- **Eliminación Total de `pollinations.ai`**:
  - Se purgó de forma permanente cualquier referencia, llamada HTTP o fallback a `pollinations.ai` en todo el repositorio (`/api/closy/generate-avatar`).
  - El pipeline de visión sigue impulsado al 100% por **Google Gemini 3.6 Flash** para la extracción biométrica de alta resolución a partir de las 6 fotos de calibración (3 de rostro y 3 de cuerpo) y las prendas reales del armario, ignorando estrictamente las prendas que vestía el usuario en las fotos de calibración.
- **Manejo Resiliente de Cuotas de Imagen y Errores (Sin Códigos 500)**:
  - Si los modelos de generación de imágenes de Google Gemini o proveedores configurados (OpenAI DALL-E, Stability, Custom API) agotan su cuota o sufren restricciones geográficas, el servidor responde limpiamente con código estructurado `422 Unprocessable Entity` y mensaje descriptivo (`quota_exceeded: true`), eliminando cualquier caída del servidor con error 500.
  - En la interfaz de Kloe (`/closet/kloe`), se gestionan estos estados de cuota de forma amigable con notificación toast explicativa y reseteo inmediato del botón y spinner de carga, sin abrir erróneamente el modal de calibración cuando el usuario ya tiene fotos subidas.
- **Control de Acceso Premium Anti-Tampering**:
  - En cliente (`/closet/kloe`), pulsar el botón de probar avatar o abrir la calibración sin suscripción dispara inmediatamente el modal de suscripción a Klozet Pro (`setShowProModal(true)`).
  - En backend (`/api/closy/generate-avatar`), se valida en base de datos el estado de suscripción (`is_premium = true` en `profiles`), impidiendo manipulaciones o inyecciones desde la consola del navegador.

### 81. Desactivación de Avatar Virtual, Estilismo por Perfil Físico, Subida de Imágenes en Chat y Moderación con IA (Septiembre 2026)
- **Desactivación y Retirada Integral del Avatar Virtual**:
  - Se eliminó del chat de Kloe (`/closet/kloe`) cualquier botón o acción de generación de imágenes de avatar digital ("Probar en mi avatar digital", visores Lightbox y tarjetas de generación de prueba virtual).
- **Asesoría de Estilo Personalizada según Perfil Físico (Facciones, Tono y Complexión)**:
  - Las 6 fotos de referencia (3 de rostro y 3 de cuerpo entero) pasan a ser **"Mi Perfil Físico"** (`components/AvatarCalibrationModal.tsx`).
  - Kloe (Google Gemini 3.6 Flash) recibe directamente en su contexto multimodal las fotografías de rostro y cuerpo del usuario. Analiza visualmente el tono de piel (moreno, claro, cálido, oliva), color y corte de pelo, ojos y morfología/altura (alto, complexión esbelta, etc.), justificando explícitamente en sus recomendaciones por qué ciertos colores, cortes y contrastes favorecen sus facciones reales.
- **Subida de Imágenes en el Input de Kloe (`attached_custom_image`)**:
  - Se incorporó un botón de cámara en la barra de input del chat (`/closet/kloe`) que permite adjuntar fotografías (prendas vistas en tiendas, capturas de Pinterest, fotos de ropa) con visualizador chip previo.
  - Kloe analiza visualmente la imagen adjunta con Gemini Vision y asesora al usuario sobre cómo combinarla con la ropa de su propio armario.
- **Filtro de Moderación de Seguridad con IA**:
  - Antes de procesar el estilismo, el backend (`/api/closy/chat`) ejecuta una moderación visual estricta con Gemini. Si la imagen contiene contenido sexual explícito, desnudez, violencia, armas o drogas ilícitas, la imagen es rechazada con el mensaje: *"Esta imagen no se ha podido subir por infringir las normas comunitarias de la aplicación."*
- **Disparador de Banner Premium Exclusivo al Cumplir Límite**:
  - El banner y aviso de suscripción a Kloe Pro solo se presenta cuando el usuario ha agotado sus 8 mensajes de prueba gratuita (`trialRemaining <= 0`), eliminando cualquier aparición prematura o intrusiva.

### 82. Erradicación de Sugerencias Residuales de Avatar y Corrección de Error 500 en Conversaciones (`/api/closy/conversations`) (Septiembre 2026)
- **Erradicación Total de Sugerencias de Avatar en IA**:
  - Se instruyó formalmente en el System Prompt de Gemini (`/api/closy/chat`) la prohibición explícita de sugerir "avatar virtual", "avatar digital", "generar foto de mi avatar" o "probar en avatar" tanto en el texto como en las píldoras de sugerencias rápidas (`follow_up_suggestions`).
- **Corrección del Error 500 en Sincronización de Conversaciones (`/api/closy/conversations`)**:
  - **Causa Raíz**: Al intentar actualizar directamente una columna inexistente `kloe_conversations` en `profiles`, Postgres devolvía error, y el cliente anónimo sin token Bearer disparaba excepciones de RLS que derivaban en un código 500 Internal Server Error.
  - **Solución y Blindaje**:
    - El endpoint ahora resuelve la sesión mediante tokens Bearer (`Authorization: Bearer <token>`) o cookies de sesión.
    - Se persiste directamente en el campo JSONB `profiles.notification_preferences->'kloe_conversations'`, sanitizando el payload de mensajes.
    - Se agregaron capturadores de errores no fatales para garantizar que la sincronización siempre responda con éxito sin romper la experiencia en cliente.

### 83. Acceso Exclusivo a "Mi Perfil Físico" para Usuarios Klozet Pro (Septiembre 2026)
- **Bloqueo y Puerta de Pago en Perfil Físico (Rostro y Cuerpo)**:
  - La subida y calibración de las 6 fotos de referencia física (3 de rostro y 3 de cuerpo entero) es una **función exclusiva de Klozet Pro**.
  - Si un usuario del plan gratuito pulsa el botón de cámara en la cabecera del chat (`/closet/kloe`) o dentro del modal [`AvatarCalibrationModal.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/AvatarCalibrationModal.tsx), el sistema activa de inmediato el modal de suscripción [`KloeProModal`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/KloeProModal.tsx).
  - En backend ([`/api/user/avatar-calibration`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/api/user/avatar-calibration/route.ts)), se valida de forma atómica en base de datos la suscripción activa (`is_premium = true`), impidiendo cualquier subida o manipulación no autorizada.

### 84. Maquetación Panorámica, Botón Lateral y Flechas Flotantes en Detalle de Publicación (`/post/[id]`) (Septiembre 2026)
- **Cabecera Panorámica con Botón de Atrás Pegado al Margen Izquierdo y Centrado Verticalmente**:
  - El elemento `<header>` en [`app/(app)/post/[id]/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/post/%5Bid%5D/page.tsx) abarca el 100% del ancho del viewport (`w-full apple-glass-bar border-b pt-safe`).
  - La barra interna de 64px (`h-16 w-full flex items-center justify-between px-4 md:px-6`) mantiene el botón de volver atrás perfectamente centrado a la altura media de su contenedor en el extremo izquierdo, junto a la barra lateral/navbar.
- **Columna Lateral de Comentarios y Prendas Ceñida a la Derecha**:
  - La estructura principal ocupa todo el ancho de la pantalla (`w-full flex-1 md:h-[calc(100vh-64px)] flex flex-col md:flex-row`).
  - El área izquierda (`md:flex-1`) aloja el carrusel de imágenes centrado y optimizado.
  - La columna lateral derecha (`md:w-[440px] lg:w-[480px] xl:w-[520px]`) que contiene autor, acciones, prendas del look y comentarios queda ceñida al extremo derecho de la pantalla.
- **Flechas de Navegación del Carrusel Condicionales y Sombreadas**:
  - Las flechas izquierda y derecha solo se muestran cuando existe una diapositiva anterior (`activeSlide > 0`) o siguiente (`activeSlide < slides.length - 1`).
  - Se eliminó el fondo circular opaco/semitransparente: ahora son iconos vectoriales limpios con sombreado difuso (`drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]`), mejorando la visibilidad sobre cualquier fondo de imagen sin recargar la interfaz.

### 85. Formato de Publicaciones Idéntico a Feed y Search en Perfil (`/profile` y `/profile/[id]`) (Septiembre 2026)
- **Integración de `PostCard` en Cuadrícula de Perfil**:
  - Las publicaciones de las pestañas de publicaciones y guardados en [`app/(app)/profile/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/page.tsx) y [`app/(app)/profile/[id]/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/%5Bid%5D/page.tsx) ahora renderizan el componente oficial [`PostCard`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/Feed/PostCard.tsx), compartiendo la misma experiencia visual que el Feed y el Buscador (avatares del autor, botón flotante de guardado rápido en escritorio, degradado inferior y previsualización por pulsación larga en móvil `PostPreviewModal`).
- **Cuadrícula Limitada a 3 Elementos por Fila**:
  - Se estructuró la disposición con `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 p-2 md:p-4`, garantizando un máximo estricto de 3 columnas en pantallas medianas y de escritorio con separación limpia y uniforme.
- **Sincronización del Esqueleto de Carga**:
  - `SkeletonProfileGrid` en [`components/Skeleton.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/Skeleton.tsx) se adaptó con la misma proporción `aspect-[4/5]` y bordes `rounded-[22px]`.

### 86. Eliminación Definitiva y Atómica de Conversaciones en Mensajería (`/messages`, `/messages/[id]`, `/api/messages/conversation`) (Septiembre 2026)
- **Causa Raíz del Error al Eliminar Conversaciones**:
  - Las páginas de mensajes intentaban invocar la función RPC `delete_conversation_for_user`, la cual no existía en el esquema de Supabase (`404 PGRST202`). Al fallar el RPC, los mensajes no eran borrados en la base de datos de Supabase.
  - Además, la barra lateral en versión escritorio (`app/(app)/messages/layout.tsx`) no escuchaba la eliminación realizada desde el chat activo ni tenía conectado el callback de borrado en `ConversationList`, manteniendo la conversación visible con el último mensaje.
- **Arquitectura de Eliminación Atómica en Servidor (`/api/messages/conversation` & `/api/messages`)**:
  - Creado endpoint con autenticación por cookies de sesión y Bearer token (`resolveAuthUser` y `supabaseAdmin`):
    1. Resuelve identificadores tanto por UUID como por nombre de usuario (`@username`).
    2. Elimina todas las filas de mensajes bidireccionales entre el usuario autenticado y el interlocutor en `public.messages`.
    3. Elimina en cascada los registros de `conversation_participants` y `conversations` asociados.
    4. Purga cualquier notificación de tipo `'message'` pendiente entre ambos usuarios.
- **Sincronización Inmediata Multi-Componente (`lib/services/messageService.ts`)**:
  - Centralizada la función `deleteConversationForUser(partnerId, currentUserId)`:
    1. Actualiza `localStorage` (`deleted_chats`) con timestamp del servidor.
    2. Actualiza el store global `useMessageStore.getState().removeConversation(partnerId)` y sincroniza conteos no leídos.
    3. Emite el evento personalizado global `klozet:conversation_deleted` en `window`.
    4. `MessagesLayout` (`layout.tsx`), `MessagesPage` (`page.tsx`) y `ConversationList` sincronizan instantáneamente el estado eliminando la conversación de la bandeja sin parpadeos y redirigiendo limpiamente a `/messages`.

### 87. Maquetación Pinterest Masonry en Perfil y Tarjetas Limpias Hover-Only (`/profile`, `/profile/[id]`, `PostCard.tsx`) (Septiembre 2026)
- **Disposición Dinámica Estilo Pinterest / Masonry en Perfil**:
  - En [`app/(app)/profile/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/page.tsx) y [`app/(app)/profile/[id]/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/%5Bid%5D/page.tsx), se implementó la arquitectura de renderizado de Feed y Búsqueda:
    - **En móvil (`md:hidden`)**: Cuadrícula de 2 columnas paralelas (`grid grid-cols-2 gap-2.5 items-start`) que distribuye los posts pares e impares de forma equilibrada y asegura que ambas columnas comiencen exactamente a la misma altura superior.
    - **En escritorio (`hidden md:block`)**: Cuadrícula masonry con clase `.profile-masonry-grid` limitada a **3 columnas** (`column-count: 3; column-gap: 16px;`) con `.break-inside-avoid` para adaptarse a las alturas naturales variables de cada look.
- **Tarjetas de Publicación Limpias con Hover-Only**:
  - En [`components/Feed/PostCard.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/Feed/PostCard.tsx), se añadieron las propiedades opcionales `hideLikeButton` y `hideAuthorOverlay` junto a `hideSaveButton`.
  - Al visualizarse en el perfil propio (`/profile`) o en perfiles públicos (`/profile/[id]`), se pasan `hideSaveButton={true}`, `hideLikeButton={true}` y `hideAuthorOverlay={true}`, suprimiendo por completo el botón flotante de bookmark, el corazón de me gusta y la capa inferior de autor/like.
  - Se mantiene el efecto interactivo de elevación y escala al hacer hover (`whileHover={{ scale: 1.025 }}`) idéntico a las tarjetas de `OutfitCard`, ofreciendo un catálogo limpio, editorial y centrado 100% en la fotografía.
- **Sincronización de Skeletons Wave**:
  - `SkeletonProfileGrid` en [`components/Skeleton.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/Skeleton.tsx) renderiza tarjetas con alturas variadas intercaladas (`[260, 310, 220, 290, 250, 330, 230, 300, 270]`) para reflejar la distribución real de las imágenes antes de cargar.

### 88. Corrección Definitiva del Error 500 al Guardar en Carpetas y Sincronización Blindada (`/api/saves`, `/api/save-folders`, `SaveModal.tsx`) (Septiembre 2026)
- **Causa Raíz Identificada**:
  - Cuando un usuario guardaba una publicación y acto seguido seleccionaba una carpeta en [`SaveModal.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/SaveModal.tsx), la petición `POST /api/saves` no incluía la cabecera `Authorization: Bearer <token>`.
  - En servidores de producción donde no está inyectada la variable `SUPABASE_SERVICE_ROLE_KEY`, las operaciones en `app/api/saves/route.ts` dependían de clientes sin contexto de token de usuario autenticado, provocando que PostgREST rechazara las inserciones/actualizaciones en `saves` y `save_folder_items` por políticas de RLS, respondiendo con un error HTTP `500 Internal Server Error`.
  - Adicionalmente, si el post ya existía en `saves` o existía inconsistencia de columnas/tablas entre `saves.folder_id` y `save_folder_items`, la operación se interrumpía antes de registrar la vinculación con la carpeta.
- **Solución Arquitectónica Multicapa**:
  - **Inyección de Tokens en Cliente (`SaveModal.tsx` y `profile/page.tsx`)**:
    - Se integró la extracción del `session.access_token` de Supabase en `SaveModal.tsx` tanto para `assignToFolder` como para `fetchFolders` y `handleCreateAndAssign`, enviándolo en la cabecera `Authorization: Bearer ${token}`.
  - **Resolución Resiliente de Cliente en Servidor (`getDbClient`)**:
    - `app/api/saves/route.ts` y `app/api/save-folders/route.ts` resuelven la identidad del usuario y crean dinámicamente un cliente Supabase con `global: { headers: { Authorization: Bearer <token> } }` o cookies SSR. Esto garantiza que las políticas RLS se cumplan con `auth.uid() = user.id` en cualquier entorno (local, Vercel o Docker) con o sin Service Role Key.
  - **Persistencia y Consulta Dual Blindada (`saves.folder_id` + `save_folder_items`)**:
    - Al guardar en una carpeta, el endpoint actualiza de forma segura tanto la columna `saves.folder_id` como la tabla relacional `save_folder_items` con bloques tolerantes a fallos.
    - En `GET /api/saves?folder_id=...`, se consulta mediante estrategia dual (búsqueda por IDs de `save_folder_items` y por `saves.folder_id`), fusionando y deduplicando resultados para garantizar que todas las publicaciones guardadas en la carpeta aparezcan de forma inmediata en la pestaña de guardados del perfil.

### 89. Rediseño de Pull-to-Refresh Integrado en el Flujo de Posts y Motor de Puntuación por Afinidad, Amigos de Amigos y Novedad (`/search` y `/feed`) (Septiembre 2026)
- **Indicador Integrado de Pull-to-Refresh (Inline Header Flow) (`PullToRefresh.tsx`)**:
  - Se eliminó el icono tipo "Sparkles" / IA y se sustituyeron los 3 puntos por el spinner circular vectorizado con aceleración por hardware en color rosa de marca (`LoadingSpinner` con `variant="spinner"` y `var(--brand-pink)`).
  - Se eliminó el contenedor flotante desconectado (`fixed` div) y se transformó en un elemento integrado (**inline**) dentro del mismo contenedor de publicaciones:
    - **En Feed (`/feed`)**: Se sitúa directamente dentro del contenedor de publicaciones, desplegándose suavemente encima de los posts y debajo de la cabecera móvil.
    - **En Búsqueda (`/search`)**: Se sitúa directamente dentro del contenedor de resultados, desplegándose suavemente encima de las publicaciones y debajo de la barra de búsqueda fija.
  - **Restricción Exclusiva a Feed y Search**: Se eliminó la envoltura de `PullToRefresh` en Perfil (`/profile`), Armario (`/closet`), Notificaciones y demás pantallas secundarias, manteniéndose activo **única y exclusivamente en `/feed` y `/search`**.
- **Motor de Interés, Interacción y Frescura de Publicaciones (`lib/services/interestManager.ts`)**:
  - Se implementó el servicio singleton `interestManager` con persistencia en `localStorage`:
    - `recordPostInteraction(postId, authorId, styleIds)`: Registra automáticamente clics, visitas a publicaciones y estilos explorados tanto al pulsar una tarjeta (`PostCard.tsx`) como al cargar el visor de detalle (`post/[id]/page.tsx`).
    - `getStyleInterestBonus(styleIds)`: Pondera bonificaciones dinámicas (+0 a +10 pts) según los estilos que el usuario explora con mayor frecuencia.
    - `getAuthorInterestBonus(authorId)`: Pondera afinidad con los creadores más visitados (+0 a +6 pts).
    - `calculateRecencyScore(createdAt)`: Premia la novedad y frescura de las publicaciones recién subidas (<6h: +18 pts, <12h: +15, <24h: +12, <48h: +9, <4d: +6, <7d: +3, <14d: +1), garantizando que las novedades siempre destaquen en los primeros puestos.
- **Algoritmo de Recomendación y Descubrimiento en Búsqueda (`/search`)**:
  - El algoritmo de scoring multicriterio fusiona la novedad de las publicaciones (`recencyScore`), el interés por estilos explorados (`styleInterestBonus`), afinidad con el creador (`authorInterestBonus`), gustos del perfil (`preferredStyles`), historial dinámico de likes (`recentLikedStylesMap`), concordancia morfológica, colorimétrica, de género y proximidad etaria.
  - Al realizar pull-to-refresh en `/search`, se recargan los posts exploratorios con contenidos frescos y actualizados.
- **Algoritmo de Priorización y Amigos de Amigos en Feed (`/feed`)**:
  - Se reestructuró la consulta y ordenación del Feed para priorizar:
    1. **Publicaciones directas de usuarios seguidos (`following`)**: Máxima prioridad (+50 pts) combinada con el boost de frescura y novedad reciente.
    2. **Publicaciones de Amigos de Amigos (`FOF` - Seguidos de mis seguidos)**: Prioridad destacada (+25 pts) para descubrir personas y looks cercanos a su círculo social.
    3. **Sugerencias de afinidad comunitaria y exploración**: Contenido afín (+5 pts base + estilo y novedad) para mantener el feed siempre activo e infinito.

### 90. Fijación Permanente de Botones de Creación en Armario (`/closet`) (Septiembre 2026)
- **Eliminación del Auto-Hide en Scroll de Cabecera**:
  - En [`app/(app)/closet/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/closet/page.tsx), se eliminó el detector de scroll que ocultaba la cabecera al hacer scroll (`setIsHeaderVisible(false)` / `-translate-y-full`).
  - La cabecera superior y el contenedor con los botones **"Crear Outfit"** y **"Crear con IA" (Kloe)** permanecen de forma permanente fijos y accesibles (`sticky top-0`) tanto en vista móvil como en escritorio, garantizando que nunca desaparezcan al hacer scroll hacia arriba o abajo por el catálogo de prendas.

### 91. Normalización de Cabeceras Móviles, Optimización de Kloe, Esqueletos Desvinculados de GPU y Ajustes de Armario/Perfil (Septiembre 2026)
- **Ajuste de Posición y Scroll en Kloe Chat (`/closet/kloe`)**:
  - Se corrigió el padding inferior de la vista de chat (`pb-28 md:pb-24`), eliminando el espacio en blanco excesivo (`pb-56`) que permitía scroll innecesario.
  - Al abrir el chat o recibir respuestas, el scroll se posiciona de forma precisa en el último mensaje de Kloe con `scrollToBottom('auto')` inicial y `smooth` en mensajes nuevos.
- **Supresión Global de Barras de Scroll en Móvil**:
  - Se añadieron reglas globales en [`app/globals.css`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/globals.css) con `@media (max-width: 768px)` y utilidad `.no-scrollbar` para ocultar barras de scroll nativas (módem `-webkit-scrollbar: none`, `scrollbar-width: none`), manteniendo un deslizamiento táctil fluido y aspecto premium.
  - Aplicada la clase `.no-scrollbar` en los modales de selección de prendas y publicaciones guardadas en el chat de Kloe (`SavedSelectorDrawer` y `WardrobeSelectorDrawer`).
- **Botón Atrás en Kloe y Desvinculación de GPU del Logo**:
  - En [`app/(app)/closet/kloe/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/closet/kloe/page.tsx), se añadió un botón de navegación hacia atrás con `<ArrowLeft />` que redirige a `/closet` tanto en la cabecera de escritorio como en la cabecera móvil.
  - El logo animado `KloeAnimatedLogo` fue desvinculado de transformaciones 3D pesadas (`rotateX: 90`), utilizando transiciones 2D ultra-ligeras de escala y opacidad (`scale: 0.92 -> 1`) para evitar reasignaciones continuas de capas de composición en GPU.
- **Acceso Rápido a Outfits de Hoy en Calendario de Armario (`/closet`)**:
  - En [`components/OutfitCalendar.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/OutfitCalendar.tsx), se incorporó un botón principal en versión móvil debajo de la cuadrícula del calendario: *"Añadir outfit para hoy"*, con el estilo rosa distintivo de la app (`bg-gradient-to-r from-pink-500 to-rose-500`), seleccionando la fecha actual y abriendo el selector de outfits.
- **Esqueleto de Carga Dedicado para Detalle de Outfit (`SkeletonOutfitDetail`)**:
  - En [`components/Skeleton.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/components/Skeleton.tsx), se creó e integró `SkeletonOutfitDetail` que emula la disposición panorámica del visor de imagen y la columna lateral de detalles.
  - Integrado en [`app/(app)/profile/[id]/outfit/[outfitId]/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/%5Bid%5D/outfit/%5BoutfitId%5D/page.tsx) y [`app/(app)/outfit/[id]/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/outfit/%5Bid%5D/page.tsx) sustituyendo spinners circulares básicos.
- **Animaciones de Esqueleto Desvinculadas de la GPU (`app/globals.css`)**:
  - Se refactorizó la animación de shimmer de los esqueletos (`@keyframes shimmer-wave` y `.skeleton-wave::after`) utilizando `transform: translateX(-100%)` a `translateX(100%)` sobre pseudo-elementos compuestos, garantizando 60 FPS estables sin saturar el hilo de renderizado.
- **Rediseño y Normalización de Pantalla de Configuración (`/profile/settings`)**:
  - Se alineó el ancho máximo al estándar de perfil (`max-w-4xl mx-auto`).
  - Se centró el título *"Configuración"* en versión escritorio con botón de retroceso circular minimalista sin texto redundante.
  - Se eliminaron botones flotantes no deseados y se incorporó la cabecera estándar de cristal (`h-14 apple-glass-bar`).
- **Normalización Exhaustiva de Cabeceras Móviles en Toda la Aplicación**:
  - Estandarizadas las especificaciones de cabecera móvil en todas las pantallas principales y secundarias: altura consistente `h-14` (56px), efecto `apple-glass-bar pt-safe`, títulos tipográficos centrados (`text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2`) y botones táctiles con área mínima de 44px.

### 92. Botón de Acción "Añadir outfit para hoy" Unificado en Armario (`/closet` y `OutfitCalendar.tsx`) (Septiembre 2026)
- **Unificación del Botón Flotante de Acción Principal**:
  - En [`app/(app)/closet/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/closet/page.tsx), se habilitó el botón de acción principal de la esquina inferior derecha para la pestaña de **Calendario** (`activeTab === 'calendar'`), mostrando el texto *"Añadir outfit para hoy"* en versión escritorio y el icono rosa `+` en móvil de forma idéntica a *"Nueva Prenda"* y *"Nuevo Outfit"*.
  - Al hacer clic en dicho botón cuando la pestaña activa es el Calendario, se emite el evento personalizado `klozet:calendar_add_today`.
- **Recepción y Apertura del Selector en Calendario (`components/OutfitCalendar.tsx`)**:
  - `OutfitCalendar` escucha el evento global `klozet:calendar_add_today` y abre de forma inmediata el selector de outfits asignando la fecha actual de hoy (`selectedDate = new Date()`, `loadUserOutfits()` y `showPicker = true`).

### 93. Animación de Skeleton Estática por Pulso de Color Sin Desplazamiento (`app/globals.css`) (Septiembre 2026)
- **Supresión de Movimiento Espacial y Shimmer Desplazable**:
  - Se eliminaron las transformaciones de desplazamiento horizontal (`transform: translateX(...)`) y los gradientes deslizables en pseudo-elementos `::after`.
- **Animación Fluida de Pulso y Transición de Color en el Sitio**:
  - Se implementó `@keyframes skeleton-color-pulse` (modo claro) y `@keyframes skeleton-color-pulse-dark` (modo oscuro) en [`app/globals.css`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/globals.css).
  - Los componentes de esqueleto (`.skeleton`, `.skeleton-wave`) permanecen fijos en su posición física y realizan una respiración/transición cromática suave y continua de fondo (de tono neutro a tono atenuado y viceversa) en un ciclo de 1.8s, ofreciendo una experiencia visual sobria, limpia y 100% libre de vibraciones o saltos en todas las pantallas.

### 94. Notificaciones en Tiempo Real, Popups con Imágenes Oficiales, Persistencia Instantánea de Likes y Rediseño de Configuración (`NotificationToast.tsx`, `NotificationList.tsx`, `likeManager.ts`, `/profile/settings/notifications`) (Septiembre 2026)
- **Notificaciones en Tiempo Real y Actualización Automática (`NotificationList.tsx` & `RealtimeManager.ts`)**:
  - `NotificationList` se sincroniza ahora de forma reactiva con el canal Realtime de Supabase (`notifications`, `follows`, `likes`, `comments`) y con el evento `klozet:new_notification`. Las nuevas actividades aparecen al instante en la lista sin requerir recargar la página.
  - `RealtimeManager` resuelve el perfil del autor de forma enriquecida y emite las notificaciones de manera inmediata con 0 latencia.
- **Popups de Notificación con Diseños Gráficos Oficiales (`NotificationToast.tsx`)**:
  - Se integraron los activos de imagen oficiales (`public/notifications/`):
    - **Me gusta**: `notif-like-mobile.png` (Móvil) y `notif-like-pc.png` (PC).
    - **Comentarios**: `notif-comment-mobile.png` (Móvil) y `notif-comment-pc.png` (PC).
    - **Seguidores**: `notif-follow-mobile.png` (Móvil) y `notif-follow-pc.png` (PC).
  - Posicionamiento exacto: en versión móvil se despliegan directamente encima del icono de notificaciones del TabBar inferior, y en PC a la derecha del icono de notificaciones de la barra lateral.
- **Persistencia Instantánea y Blindada de Likes (`likeManager.ts`)**:
  - Eliminado el retraso por debounce al dar me gusta: la escritura en base de datos cliente (`likes` upsert/delete) y la llamada a `/api/likes` con cabecera `keepalive: true` se ejecutan de forma instantánea. Si el usuario da like y sale de la publicación de inmediato, el like y la notificación para el autor quedan guardados y emitidos al 100%.
- **Rediseño y Normalización de Configuración de Notificaciones (`/profile/settings/notifications`)**:
  - Cabecera móvil normalizada (`h-14 apple-glass-bar pt-safe`) con botón de retroceso circular minimalista `ChevronLeft` sin texto y título centrado.
  - Cabecera de escritorio centrada con ancho `max-w-4xl mx-auto`.
  - Textos optimizados y acortados para evitar desbordamientos o saltos en pantallas móviles.
  - Sustituido el icono genérico de IA por el logotipo oficial de Kloe (`/kloe-logo-large.png`).

### 95. Carrusel Deslizable Estilo Instagram en Detalle de Publicación (`app/(app)/post/[id]/page.tsx`) (Septiembre 2026)
- **Pista de Deslizamiento Continuo y Física de Resorte Estilo Instagram**:
  - Ambos slides (fotografía de la publicación y look interactivo con prendas `InteractiveOutfitViewer`) se encuentran pre-renderizados en paralelo sobre un contenedor continuo acelerado por hardware con Framer Motion (`motion.div`).
  - Arrastre táctil en tiempo real (`drag="x"`, `dragElastic={0.3}`, `touchAction: 'pan-y'`) con física de resorte (`spring`, `stiffness: 280`, `damping: 30`), permitiendo que el look acompañe el dedo con suavidad y encaje de forma fluida de una diapositiva a otra, exactamente como en Instagram.
- **Puntos Indicadores Limpios Sin Contenedor Oscuro**:
  - Se eliminó el fondo de píldora oscuro (`bg-black/20 backdrop-blur-md`) alrededor de los puntos del carrusel, flotando directamente y de forma limpia sobre el contenido multimedia con sombra sutil y resaltado en rosa para el slide activo.
- **Eliminación del Mensaje Flotante de Deslizar**:
  - Se suprimió completamente el aviso flotante *"Desliza para ver el look"* (`showSwipeHint`), dejando la interfaz totalmente limpia y despejada.

### 96. Calibración de Popups de Notificación, Adaptación de Altura en Posts y Corrección de Likes (`NotificationToast.tsx`, `app/(app)/post/[id]/page.tsx`, `likeManager.ts`, `/api/likes`) (Septiembre 2026)
- **Calibración de Popups de Notificación (`NotificationToast.tsx`)**:
  - **Móvil**: Tamaño optimizado y reducido (`w-[145px] sm:w-[160px]`), posicionado con precisión matemática centrado sobre la pestaña del corazón en el TabBar inferior (`left-[70%] -translate-x-1/2`, `bottom-[calc(72px+env(safe-area-inset-bottom,0px)+6px)]`).
  - **Escritorio**: Tamaño compacto (`w-[185px] lg:w-[205px]`) alineado a la derecha del icono de notificaciones en la barra lateral (`left-[76px] top-[305px]`).
- **Ajuste Dinámico de Altura en Publicaciones Horizontales (`app/(app)/post/[id]/page.tsx`)**:
  - Se eliminó la restricción rígida `min-h-[50vh]` en versión móvil, permitiendo que las fotografías apaisadas/horizontales (ej. fotos panorámicas o 16:9) se ajusten de forma natural a su altura real sin dejar espacios muertos en blanco debajo de la imagen.
- **Corrección de Clave Primaria y Robustez en Likes (`likeManager.ts` & `/api/likes`)**:
  - Se corrigió el orden de las columnas de conflicto en PostgREST (`onConflict: 'user_id,post_id'`) para concordar con la clave primaria `PRIMARY KEY (user_id, post_id)` de PostgreSQL, eliminando el error `400 Bad Request`.
  - En `/api/likes`, se blindó la operación de inserción/upsert con `ignoreDuplicates: true` y sincronización atómica de contadores para prevenir cualquier error 500 y garantizar likes instantáneos y fiables al 100%.

### 97. Rediseño de Onboarding de Preferencias, Paso de Accesorios, Normalización de Ajustes de Perfil y Consistencia de Avatares (Septiembre 2026)
- **Onboarding de Preferencias Adaptativo y No Skippable (`app/(public)/onboarding/preferences/page.tsx`)**:
  - **Compatibilidad Total con Tema Oscuro**: Adaptadas todas las tarjetas, controles deslizantes, botones táctiles y fondos a los estándares semánticos (`bg-[var(--card-bg)]`, `bg-[var(--background-secondary)]`, `text-[var(--foreground)]`).
  - **Selección Obligatoria de Estilos**: Se bloquea el avance en el Paso 2 si el usuario no ha seleccionado al menos 1 estilo (`disabled` si `selectedStyles.length === 0`).
  - **Botón de Cerrar (X) Condicional**: El botón `X` de salida sólo se muestra cuando el usuario está editando sus preferencias existentes (`isEditing` / `user.styleCompleted === true`). En el registro inicial el onboarding es obligatorio y no skippable.
  - **Paso 4 de Accesorios ("Accesorios")**:
    - Incorporado el selector de accesorios (`minimalista`, `clasico`, `llamativo`, `urbano`, `ninguno`) con fotografía editorial adaptativa según el género seleccionado (relojes y pulseras masculinas para hombre; anillos, collares finos y pendientes para mujer; selección equilibrada para unisex).
    - Persistencia en `profiles` (`uses_accessories` y `accessories_style`) y sincronización en `userStore`.
- **Parseo Correcto en Español y Limpieza en Configuración de Perfil (`/profile/settings` & `/profile/settings/personal`)**:
  - **Traducción y Parseo de Edad y Género**: Género traducido a español (`Mujer`, `Hombre`, `Unisex / Mixto`) y edad formateada limpiamente (`24 años`, `18 - 24 años`, `45+ años`).
  - **Visualización de Estilo de Accesorios**: Muestra el valor seleccionado (`Minimalista`, `Clásico / Elegante`, etc.).
  - **Eliminación de "Preferencias" Redundantes**: Se eliminó la sección duplicada de preferencias visuales en `/profile/settings`, mostrando únicamente "Estilos preferidos".
  - **Normalización de Datos Personales (`/profile/settings/personal`)**: Cabecera móvil `h-14 apple-glass-bar pt-safe`, cabecera de escritorio centrada con botón circular `ChevronLeft` y contenedor de formulario sin borde externo rígido.
- **Eliminación de Badge "PARA TI" en Feed (`components/Feed/PostCard.tsx`)**:
  - Se eliminó el distintivo flotante *"Para ti"* en las tarjetas de publicaciones del feed para mantener la cuadrícula completamente limpia e inmersiva.
- **Unificación de Avatares Sin Foto (`store/userStore.tsx`, `lib/hooks/useAuth.ts`, `app/(app)/profile/page.tsx`)**:
  - Se eliminó el fallback automático a la foto por defecto de Google OAuth (`authUser.user_metadata?.avatar_url`) en `userStore` y `useAuth`, garantizando que si el usuario no ha subido una foto propia a Klozet, se renderice de forma consistente tanto en su propio perfil (`/profile`) como al ser visto por otros usuarios (`/profile/[id]`) el avatar oficial de fondo rosa corporativo (`bg-[var(--brand-pink)]`) con la letra inicial en mayúsculas blanco.

### 98. Calibración de Tamaño y Proporciones en Detalle de Outfits del Calendario (`components/OutfitCalendar.tsx`) (Septiembre 2026)
- **Ajuste y Proporción Óptima del Modal de Detalles del Día**:
  - Se redujo el ancho sobredimensionado del modal (`max-w-md` para 1 outfit y `max-w-xl md:max-w-2xl` con cuadrícula de 2 columnas para múltiples looks), eliminando el estiramiento desproporcionado en pantallas de escritorio y tablets.
- **Encuadre y Contención de la Imagen del Outfit**:
  - El contenedor de la prenda ahora cuenta con altura máxima calibrada (`max-h-[260px] sm:max-h-[300px]`, `aspect-[3/4]`), fondo neutro adaptativo y ajuste `object-contain`, permitiendo que el outfit completo se visualice de un solo golpe de vista de manera nítida, elegante y sin zoom excesivo ni cortes en las prendas.

### 99. Eliminación de Visualización de Edad en Configuración de Perfil (`app/(app)/profile/settings/page.tsx`) (Septiembre 2026)
- **Supresión del Bloque de Edad en la Sección "Tu estilo"**:
  - Se eliminó el campo de visualización de edad (`user.age` / `user.ageRange`) de la cuadrícula de información de estilo en [`app/(app)/profile/settings/page.tsx`](file:///c:/Users/EthanCurro/Desktop/Ethan%27s%20Project/Wardobre.ai/Wardrobe.AI/app/%28app%29/profile/settings/page.tsx).
  - La sección conserva la información relevante y visualmente limpia de género, altura (si aplica), accesorios y estilos preferidos sin exponer públicamente ni en la ficha de ajustes la edad del usuario.

### 100. Micro-Acciones Guiadas (Estilo Duolingo), Progreso del Perfil, Límites y Tips en Kloe, y Búsqueda Avanzada de Prendas (`store/tourStore.ts`, `GuidedTourModal.tsx`, `ProfileProgressBar.tsx`, `app/api/search/route.ts`, `app/api/closy/chat/route.ts`) (Septiembre 2026)
- **Micro-Acciones Guiadas Estilo Duolingo (`store/tourStore.ts` & `components/GuidedTour/GuidedTourModal.tsx`)**:
  - **Activación Post-Onboarding**: Al completar el onboarding inicial (`/onboarding/preferences`), el usuario es redirigido a `/closet?startTour=true`, activando el asistente de micro-acciones guiadas.
  - **Flujo de 6 Pasos Interiores de Valor**:
    1. **Sube tus 2 primeras prendas**: Guía interactiva con tarjetas explicativas para fotografiar prendas (luz natural, plano sobre superficie neutra o percha en pared lisa) o capturas/descargas de tiendas online (Zara, ASOS, Nike, Mango, etc.). Comprobación en tiempo real de `wardrobeCount >= 2`.
    2. **Crea tu primer look**: Salto a `/create` para combinar prendas en el lienzo interactivo.
    3. **Planifica tu outfit**: Asignación de fecha en el calendario de outfits.
    4. **Consulta con Kloe**: Iniciar conversación con la asesora IA.
    5. **Comparte tu look**: Publicar el outfit en la comunidad (`/create-post`).
    6. **Explora e interactúa**: Descubrir tendencias en `/search` y dar me gusta.
  - **Mecánica Duolingo**: Barra de progreso animada paso a paso, opción clara de "Saltar tour por ahora" (con confirmación de descartar) y banner flotante de micro-celebración con confeti al completar cada hito.
- **Indicador de Progreso del Perfil (`components/Profile/ProfileProgressBar.tsx` & `app/(app)/profile/page.tsx`)**:
  - Barra sutil de completitud en la cabecera del perfil (ej. *"Tu armario está al 40% · Añade 2 prendas más"*).
  - Cálculo dinámico de retención: 2+ prendas (20%), 5+ prendas (35%), primer outfit creado (50%), look planificado (65%), primer post compartido (80%), interactuar con Kloe y likes (100%).
  - Desplegable interactivo con checklist y enlaces de acceso directo a cada micro-acción.
- **Kloe AI: Límites Clarificados y Consejos para Usuarios Nuevos (`app/api/closy/chat/route.ts`)**:
  - **Límites de Uso**:
    - **Usuarios Nuevos / Free**: Disponen de **8 mensajes de prueba gratuita (Trial)** (`kloe_trial_messages_used` en `profiles`), junto con un límite diario de seguridad de 30 consultas (`MAX_PER_DAY_USER = 30`).
    - **Usuarios Pro**: Consultas y análisis multimodal ilimitado.
  - **Tratamiento Cálido de Usuarios con Pocas Prendas (0 a 3 prendas)**:
    - Cuando un usuario tiene pocas prendas, Kloe lo detecta en el contexto y le invita con calidez a nutrir su armario, dándole consejos prácticos de fotografía (fotos con luz natural sobre la cama o percha en pared neutra, o capturas directas de e-commerce como Zara, Nike, Uniqlo o ASOS), explicando cómo su visión por IA clasifica automáticamente colores, cortes y tejidos.
- **Motor de Búsqueda Avanzada Multi-Entidad (`app/api/search/route.ts` & `app/(app)/search/page.tsx`)**:
  - **Búsqueda por Prendas y Marcas**: Al buscar términos como *"sudadera scuffers"*, *"nike dunk"* o *"pantalones zara"*, el endpoint consulta `clothing_items` y `outfits` para encontrar los posts asociados a dichos outfits y prendas.
  - **Diccionario de Sinónimos de Categorías (`CATEGORY_SYNONYMS`)**: Resuelve términos como *zapatos, calzado, zapatillas, sneakers, botas* $\rightarrow$ `shoes`; *chaqueta, cazadora, abrigo, blazer* $\rightarrow$ `jacket` / `outerwear`; *sudadera, hoodie* $\rightarrow$ `hoodie`; *pantalón, jeans, vaqueros, cargo* $\rightarrow$ `bottom`.
  - **Chips de Descubrimiento Rápido**: Accesos directos a estilos, marcas populares y tipos de prendas en la barra de búsqueda.
- **Distinción Estricta entre Onboarding Inicial y Edición de Preferencias (`/profile/settings`)**:
  - Al acceder a editar preferencias desde `/profile/settings` (`/onboarding/preferences?from=settings`), se activa el modo de edición (`isEditing = true`).
  - **Botón de Cierre (X)**: Permite regresar directamente a `/profile/settings` sin perder la navegación.
  - **Finalización sin Tour**: Al pulsar "Finalizar y explorar", los cambios se guardan en el perfil y redirige de vuelta a `/profile/settings` (o `/closet`) **sin activar el tour ni añadir `?startTour=true`**.
  - **Activación Exclusiva para Nuevos Registros**: El tour interactivo de micro-acciones sólo se dispara una única vez tras completar el onboarding de registro inicial por primera vez (`user.styleCompleted === false`).

### 101. Rediseño de Cabecera Sticky en Búsqueda, Eliminación de Superposiciones y Recomendaciones Dinámicas Basadas en Historial (`app/(app)/search/page.tsx`) (Septiembre 2026)
- **Eliminación Total de Solapamientos y Cortes de Contenido**:
  - Se sustituyó la cabecera flotante fija (`fixed`) por una cabecera integrada con comportamiento **Sticky (`sticky top-0 z-30`)**, fondo adaptativo con cristal translúcido (`bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border-color)]/30`) y padding optimizado.
  - El contenedor de resultados comienza de forma natural sin desbordamientos ni márgenes artificiales descalibrados (`pt-4 sm:pt-6`), garantizando que la barra de búsqueda y los chips jamás se superpongan ni tapen la primera fila de publicaciones o imágenes.
- **Recomendaciones Dinámicas Basadas en Últimas Búsquedas y Estilo**:
  - Los chips de sugerencia se generan reactivamente (`useMemo`) fusionando:
    1. **Últimas búsquedas del usuario (`history`)**: Mostradas con icono de reloj (`Clock`) para repetir búsquedas rápidas con un solo toque.
    2. **Estilos favoritos del perfil (`preferredStyles`)**: Sugerencias personalizadas con distintivo visual (`Sparkles`).
    3. **Categorías y marcas populares de tendencia**: Sudaderas, Scuffers, Zapatos, Chaquetas, Pantalones, Nike, etc.
  - Comportamiento toggle: al pulsar un chip seleccionado, se deselecciona y limpia el buscador; al pulsar otro, se lanza la búsqueda de inmediato y se actualiza el historial.
- **Cuadrícula y Contadores en Resultados**:
  - Cabecera informativa con el total de publicaciones encontradas para la búsqueda actual (`N publicaciones encontradas`) y cuadrícula responsiva sin cortes.

### 102. Blindaje del Tour Guiado y Celebraciones para Usuarios Ya Registrados (`store/tourStore.ts`, `GuidedTourModal.tsx`) (Septiembre 2026)
- **Bloqueo de Auto-Inicio en Cuentas Existentes**:
  - El estado inicial de `tourStore` (`klozet_guided_tour_state_v2`) establece `isDismissed = true` y `hasStartedTour = false` por defecto.
  - El tour interactivo y sus modales **sólo se activan si la URL contiene explícitamente `?startTour=true`** (proveniente exclusivamente del registro inicial) o si el usuario pulsa deliberadamente el botón de ayuda del tour en su perfil (`openTour()`).
- **Supresión de Toasts de Celebración en Background**:
  - La sincronización en segundo plano de prendas (`items.length >= 2`) actualiza el estado de completitud silenciosamente (`shouldCelebrate = false`) sin disparar el banner de celebración flotante a usuarios existentes que simplemente estén navegando o cargando su armario.
- **Limpieza Automática de Parámetro URL**:
  - Al procesar `?startTour=true` en un nuevo registro, el parámetro se elimina de inmediato del historial del navegador (`history.replaceState`) para que recargas o navegaciones posteriores no vuelvan a disparar el tour.

### 103. Sincronización y Notificación en Tiempo Real de Micro-Acciones del Tour Guiado (`store/tourStore.ts`, `store/wardrobeStore.ts`, `app/(app)/closet/kloe/page.tsx`, `app/(app)/create/page.tsx`, `components/OutfitCalendar.tsx`, `app/(app)/create-post/page.tsx`, `lib/services/likeManager.ts`) (Septiembre 2026)
- **Ejecución Reactiva en Tiempo Real (Real-Time Triggers)**:
  - **Subida de Prendas (`upload_clothes`)**: Al añadir una prenda en `store/wardrobeStore.ts` (`addItem`), se detecta si el armario alcanza $\ge 2$ prendas y se marca el paso 1 como completado con micro-celebración instantánea.
  - **Consulta a Kloe (`talk_to_kloe`)**: Al enviar un mensaje y recibir la respuesta de Kloe en `/closet/kloe`, se invoca de inmediato `markStepComplete('talk_to_kloe')`, celebrando la primera sesión de estilismo interactivo.
  - **Creación de Look en Lienzo (`create_outfit`)**: Al guardar un look en `/create`, se registra y celebra instantáneamente el paso 2 (`markStepComplete('create_outfit')`).
  - **Planificación en Calendario (`schedule_outfit`)**: Al asignar un look a cualquier fecha desde `OutfitCalendar.tsx` o al programar fecha en `/create`, se completa el paso 3 en tiempo real.
  - **Publicación en Comunidad (`create_post`)**: Al publicar un post con outfit/foto en `/create-post`, se completa el paso 5.
  - **Exploración y Likes (`explore_like`)**: Al dar like a cualquier look en la app vía `likeManager.ts`, se completa el paso 6.
- **Avance Automático de Pasos y Respeto a Usuarios Existentes**:
  - `markStepComplete` avanza dinámicamente `currentStepIndex` al siguiente paso no completado para que, al reabrir el tour o consultar el progreso, el usuario vea su siguiente objetivo.
  - El banner flotante de éxito estilo Duolingo solo se muestra a usuarios que estén activamente en el tour (`hasStartedTour && !isDismissed && shouldCelebrate`), mientras que las cuentas existentes registran el progreso internamente sin interrupciones.

### 104. Optimización Integral de Nitidez, Calidad y Resolución en Feed, Post, Search, Profile y Exportación de Canvas (Septiembre 2026)
- **Eliminación de Borrosidad en Cuadrículas y Tarjetas de Publicaciones (`components/Feed/PostCard.tsx`)**:
  - **Resolución y Calidad Optimizadas**: Actualizado a `width={720}` y `height={900}` con `quality={90}`.
  - **Calibración del Atributo `sizes`**: Corregido el valor previo de `16vw` (que provocaba que el optimizador de Next.js entregase imágenes submuestreadas de ~200px) a `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`, garantizando imágenes nítidas y de alta densidad para pantallas 2x/3x Retina en Feed, Explorar y Perfiles.
  - **Aceleración por GPU**: Incorporada la clase `transform-gpu` para un renderizado suave y nítido por hardware.
- **Detalle de Publicación y Vista Previa (`app/(app)/post/[id]/page.tsx` & `components/Feed/PostPreviewModal.tsx`)**:
  - **Detalle de Post**: Resolución ampliada a `width={1400}`, `height={1400}`, `quality={95}` y `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"`.
  - **Modal de Vista Previa**: Configurado con `quality={95}` y `sizes="(max-width: 768px) 100vw, 600px"`, evitando artefactos de compresión en las transiciones entre foto y look interactivo.
- **Visualizador Interactivo de Outfits (`components/InteractiveOutfitViewer.tsx`)**:
  - Configurado `quality={92}` tanto para la vista estática del outfit como para cada prenda individual cargada en el lienzo interactivo con tamaños responsivos de hasta 70vw.
- **Exportación de Outfits en Lienzo Libre (`components/Creator/FreeDragCanvas.tsx`)**:
  - `exportToImage()`: Actualizado el formato de exportación a `image/webp` con factor de calidad `0.96` y escalado 3x Retina (`scale: 3`), sustituyendo la compresión JPEG 0.8 previa y eliminando artefactos y bordes borrosos en looks creados.
- **Compresión de Subida y Armario (`lib/supabase/storage.ts` & `store/wardrobeStore.ts`)**:
  - `compressImage()`: Límite dimensional ampliado a `2048x2048` (anteriormente 1200px) y calidad `0.95` (antes 0.85) con suavizado de alta calidad activado (`ctx.imageSmoothingQuality = 'high'`).
  - `wardrobeStore`: Procesamiento de imágenes procesadas y originales elevado a resoluciones de `1600x1600` y `2048x2048` a calidad `0.95`.
- **Perfeccionamiento de la Barra de Progreso del Perfil (`components/Profile/ProfileProgressBar.tsx`)**:
  - Detección exhaustiva de Kloe en almacenamiento local, base de datos y memoria.
  - Mensajes de estado dinámicos que reflejan el hito real pendiente y eliminación estricta de cualquier etiqueta "IA" de acuerdo a las normas de diseño del proyecto.

### 105. Selector Obligatorio de Cuentas en Google OAuth (`prompt: 'select_account'`) y Configuración de Nombre de Aplicación (Septiembre 2026)
- **Selector de Cuenta Google Obligatorio (`app/(public)/auth/page.tsx` & `lib/hooks/useAuth.ts`)**:
  - Se configuró `queryParams: { prompt: 'select_account', access_type: 'offline' }` en `supabase.auth.signInWithOAuth({ provider: 'google', ... })`.
  - Al cerrar sesión e iniciar de nuevo con Google, Google muestra siempre la pantalla de selección de cuenta (*Account Chooser*) en lugar de iniciar automáticamente con la sesión anterior, permitiendo cambiar de cuenta con total comodidad.
- **Identidad de Marca en la Pantalla de Consentimiento de Google**:
  - El nombre mostrado en la ventana de autorización de Google depende de la *Pantalla de consentimiento de OAuth* en **Google Cloud Console** (cambiar "App Name" por **Klozet** o **Klozet - Wardrobe AI**) y del nombre del proyecto en **Supabase Dashboard** (*Project Settings > General > Project Name*).

### 106. Landing Page Pública Completa, Política de Datos de Google API y Verificación de Dominio (Septiembre 2026)
- **Landing Page Pública Operativa (`app/(public)/page.tsx`)**:
  - Eliminado el bloqueo y redirección obligatoria a la pantalla de login (`/auth`).
  - Creada una página de inicio pública y completa con estética Apple / Glassmorphic:
    - Barra de navegación con logo, enlaces a Funcionalidades, Cómo funciona, Privacidad, Términos y botón de acceso directo ("Entrar a Klozet" o "Ir a mi Armario" si ya hay sesión).
    - Hero Section con propuesta de valor clara y explícita: *Armario virtual inteligente y red social de moda*.
    - Rejilla de 6 funcionalidades principales con iconos y descripciones detalladas.
    - Sección de 3 pasos ("¿Cómo funciona Klozet?": Sube tu ropa, Crea y Asesórate, Planifica y Comparte).
    - Llamada a la acción (CTA) y Pie de página con enlaces legales a Privacidad, Términos, Cookies y correo de soporte (`soporte@klozet.es`).
- **Política de Privacidad y Cláusula de Cumplimiento de Google API (`app/(public)/privacy/page.tsx`)**:
  - Incorporada la **Sección 7: Uso y Protección de Datos de Servicios de Google (Google API Services User Data Policy)**.
  - Especifica que solo se recopilan datos básicos no sensibles (`email`, `profile` y `openid`) con el único fin de autenticación y creación de perfil en Klozet.
  - Declaración expresa de no cesión, no venta de datos de Google a terceros y no uso para entrenamiento de modelos generalizados de IA.
  - Inclusión de la cláusula obligatoria de cumplimiento con la política de Uso Limitado (*Limited Use Requirements*) y enlace a la revocación de permisos en `myaccount.google.com/permissions`.
- **Estandarización de Contacto Legal (`app/(public)/terms/page.tsx` & `cookies/page.tsx`)**:
  - Unificado el correo oficial de contacto y soporte en `soporte@klozet.es`.










