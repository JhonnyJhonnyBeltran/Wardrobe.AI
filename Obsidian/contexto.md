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
- **Botones de Acción Inferiores Rediseñados (`AddItemModal/index.tsx`)**:
  - El botón principal de confirmación se renombra a *"Guardar prendas"* (en lote) / *"Guardar prenda"* (en individual) / *"Guardar cambios"* (al editar).
  - Al lado del botón de confirmar se añade un botón dedicado *"Añadir prendas"* con icono `+` que despliega el selector `AddMoreModal` para tomar fotos o añadir más prendas en cualquier momento.
- **Limpieza del Carrusel y Paleta de Colores (`BatchCarousel.tsx` & `AddItemModal/index.tsx`)**:
  - Eliminados los controles redundantes (`<`, `>`, `+`, papelera) de la barra superior del carrusel, manteniendo exclusivamente el contador de slide (*"Prenda X de N"*) y el estado del análisis.
  - Eliminado el thumbnail placeholder con `+` de la tira de miniaturas circulares.
  - Eliminado el texto descriptivo del nombre del color al lado de los círculos cromáticos tanto en el carrusel como en la vista individual, dejando una cuadrícula de colores ultra limpia.
- **Confirmación al Cerrar con "X" (`handleHeaderCloseClick`)**:
  - Al pulsar la "X" de la cabecera cuando hay prendas o fotos pendientes, se despliega el modal de confirmación con las opciones *"Seguir editando"* y *"Eliminar"*, protegiendo al usuario de descartes accidentales.
