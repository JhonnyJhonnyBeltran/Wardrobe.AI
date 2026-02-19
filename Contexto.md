# PRODUCT REQUIREMENTS DOCUMENT (PRD) MAESTRO - KLOZET APP

## 1. IDENTIDAD Y VISIÓN TÉCNICA
* **Nombre:** KLOZET
* **Arquitectura:** Mobile-First (PWA/Native Wrapper) + Desktop Web adaptativa.
* **Stack Sugerido:** React/Next.js (Frontend), Tailwind CSS (Estilos), Supabase (Backend/Auth/DB), Python/Node (IA Services).
* **Filosofía UX:** "La limpieza visual de Pinterest con la retención social de Instagram".
* **Core Value:** El usuario no busca por ID, busca por "Vibe" (SEO semántico).

---

## 2. SISTEMA DE DISEÑO (KLOZET UI KIT)

### A. Paleta de Colores (Strict Enforcement)
La interfaz debe sentirse "cara" y limpia.
* **Primary (Brand):** `Klozet Pink` (#FF66C4 - Ajustar al tono exacto del logo).
    * *Uso:* Iconos activos, CTAs principales, Hashtags, Notificaciones, Likes.
* **Backgrounds:**
    * *Light Mode:* Fondo App `#FAFAFA` (Hueso) / Contenedores `#FFFFFF` (Blanco Puro).
    * *Dark Mode:* Fondo App `#000000` (OLED) / Contenedores `#121212` (Gris Carbón).
* **Textos:**
    * *Headings:* Inter/San Francisco Bold.
    * *Body:* Inter Regular.
* **Regla de Oro de Imagen:** Los recortes de prendas (Items) **SIEMPRE** deben tener un fondo `#FFFFFF` (Blanco) o `#F5F5F7` (Gris muy claro) dentro de su contenedor, incluso si la app está en modo oscuro. Esto garantiza contraste y visibilidad del producto.

### B. Componentes Clave
* **Masonry Grid (Feed):** Grid asimétrico sin espacios excesivos (gap-2 o gap-4). Border-radius: `rounded-xl`.
* **Glassmorphism:** Uso de `backdrop-blur-md` en Header y BottomBar.
* **Skeleton Loading:** No usar spinners. Usar esqueletos pulsantes con la forma exacta del grid de Pinterest.

---

## 3. FLUJO DE USUARIO: ONBOARDING (SMART PROFILING)

### Estado de Interfaz
* **Full Focus:** Durante todo este proceso, `Navbar` y `Tabbar` están **OCULTAS**.

### Paso 1: Identidad (Género)
* Selección visual mediante 3 tarjetas grandes con fotografía: [Hombre] [Mujer] [Unisex/Otro].
* *Feedback:* Borde `Klozet Pink` al seleccionar.

### Paso 2: Definición de Estilo (Data Driven)
* **Fuente de Datos:** Los estilos NO están en el código. Se obtienen de `SELECT * FROM styles WHERE active = true`.
* **UI:** Grid de burbujas o tarjetas seleccionables.
* **Lógica:** El usuario puede marcar múltiples.

### Paso 3: Calibración Visual
* Tinder-style swipe o Grid de selección rápida: "¿Te pondrías esto?".
* Ayuda a poblar la tabla `user_preferences`.

---

## 4. NAVEGACIÓN Y ESTRUCTURA

### Bottom Navigation (Móvil)
* **Items:** Home, Search, Create (+), Closet, Profile.
* **Comportamiento Sticky:** Se oculta automáticamente al hacer scroll hacia abajo (para dar más pantalla al feed) y reaparece al subir (como Instagram).
* **Ocultación Total:** En `PostDetail`, `ChatConversation`, `OutfitEditor`, `Settings`.

---

## 5. FUNCIONALIDADES CORE

### A. FEED (Home & Discovery)
* **Estilo Visual:** Pinterest puro.
    * **Clean View:** En la rejilla, la imagen va "a sangre" (sin padding). No hay botones de like/comentario visibles sobre la foto.
    * **Info:** Solo se muestra el avatar del usuario en miniatura en la esquina inferior izquierda de la tarjeta.
* **Algoritmo de Ordenación (SQL Logic):**
    * Query prioritaria: `ORDER BY likes_count DESC, created_at DESC`.
    * *Explicación:* Un post nuevo con 0 likes aparece DEBAJO de un post de hace 1 hora con 10 likes. La popularidad manda, la frescura es secundaria.

### B. POST DETAIL (La Pantalla Crítica)
La experiencia se bifurca totalmente según el dispositivo.

#### Estructura de Datos del Post
* **Outfit (Collage):** JSON con coordenadas (x, y, z-index, rotation) de cada prenda.
* **Foto Real (Cover):** Imagen opcional subida por el usuario.
* **Descripción:** Texto rico (acepta hashtags y menciones).

#### Versión MÓVIL (Interacción Táctil)
* **Layout:** Full Screen. Botón "Atrás" flotante arriba izquierda.
* **Visualización:**
    * Si hay Foto Real: Se muestra primero. Swipe lateral para ver el Outfit (Collage).
    * Si solo hay Outfit: Se muestra directo.
* **Interactive Tags (Puntos Calientes):**
    * Al tocar el Outfit, aparecen "puntos" sobre cada prenda.
    * Al tocar un punto o la prenda: Se abre un **Bottom Sheet (Modal Inferior)** con la info: Foto prenda, Marca, Precio, Botón "Comprar/Ver".
* **Social Footer:** Barra fija abajo con iconos: Like (Corazón animado), Comentario, Guardar (Marcador).

#### Versión ESCRITORIO (Densidad de Info)
* **Layout:** Modal centrado con fondo oscuro (Overlay).
* **Grid Split:**
    * **Izquierda (60%):** Imagen del Post (Foto Real o Outfit).
    * **Derecha (40%):** Columna de scroll independiente.
        * *Header:* Usuario + Botón Follow.
        * *Body:* Descripción + Hilo de Comentarios.
        * *Footer:* Lista de prendas del outfit (Thumbnails + Textos) para compra rápida.

### C. BÚSQUEDA (SEO Semántico)
* **Input:** Barra superior.
* **Lógica de Búsqueda:**
    * NO busca por ID.
    * Busca coincidencias en: `posts.description`, `items.name`, `items.brand`, `items.color`.
    * *Caso de Uso:* Usuario busca "Boda de día". El sistema busca posts con descripción "Vestido ideal para *boda de día*..." o tags asociados.
* **Resultados:** Grid Masonry.
* **Ranking:** Mismo que el Feed (Popularidad > Reciente).

### D. ARMARIO & EDITOR (Creation Studio)
* **Flujo de Añadir Prenda:**
    1.  Cámara/Galería.
    2.  **AI Background Removal:** Procesamiento en <3 segundos.
    3.  **Formulario:** Categoría, Color, Marca (Autocompletado).
* **Flujo de Crear Post:**
    1.  **Canvas:** Arrastrar prendas del armario. Rotar, escalar, ordenar capas (Z-index).
    2.  **Foto Real (Opcional):** Subida + **Herramienta Crop** (Recorte 1:1, 4:5, 9:16) integrada.
    3.  **SEO:** Campo obligatorio de descripción. Sugerencia de hashtags por IA basada en las prendas (ej: si hay tacones -> #party #elegant).

### E. PERFIL & SOCIAL
* **Interacciones:**
    * **Menciones:** Al escribir `@`, desplegar lista de usuarios seguidos. Crear notificación en DB `type: mention`.
    * **Guardados:**
        * Pulsación corta: Guardado Rápido en "Todos los guardados".
        * Pulsación larga: Menú "Añadir a Colección" (Crear nueva o seleccionar existente).
* **Grid Perfil:** 3 Columnas (Móvil) / 4-5 Columnas (Escritorio).

---

## 6. REGLAS TÉCNICAS Y PERFORMANCE

### A. Optimización de Imágenes
* Uso de formatos Next-Gen (`WebP` o `AVIF`).
* **Lazy Loading:** Implementar carga diferida en todos los grids. Cargar placeholder de color promedio (blurhash) antes de la imagen real.
* **CDN:** Servir imágenes cacheadas.

### B. Base de Datos (Supabase/SQL Guidelines)
* **Tabla `styles`:** Debe estar pre-poblada.
* **Tabla `posts`:** Índices obligatorios en `likes_count` y `created_at` para velocidad de query.
* **Tabla `notifications`:** Trigger automático al insertar un comentario con `@`.

### C. Seguridad (RLS)
* **Posts:** `SELECT` (Public), `INSERT/UPDATE/DELETE` (Owner only).
* **Profile:** `UPDATE` (Owner only).

---

## 7. INSTRUCCIONES ESPECÍFICAS PARA ANTIGRAVITY (IA)
1.  **Prioridad UX:** Cuando generes el código del Feed, prioriza la fluidez del scroll sobre la carga inmediata de imágenes de alta resolución (usa thumbs primero).
2.  **Estética:** Aplica el `Klozet Pink` solo como color de acento. No inundes la UI de rosa. Mantén el "White Space".
3.  **Responsive:** Asegura que el `PostDetail` cambie radicalmente de estructura (Full Screen vs Modal Split) usando Media Queries o Renderizado Condicional, no solo CSS.