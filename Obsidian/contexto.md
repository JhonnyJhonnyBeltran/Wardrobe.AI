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













