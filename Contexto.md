# CONTEXTO TÉCNICO Y DE PRODUCTO: KLOZET (APP)

## 1. Visión General
**Nombre de la App:** KLOZET
**Plataforma:** Web (Escritorio) y Móvil (App Nativa/PWA).
**Concepto:** Red social de moda híbrida (Instagram + Pinterest) con gestión de armario inteligente, creación de outfits y compras.
**Objetivo UX:** Fluidez extrema tipo "Instagram" en móvil y densidad de información tipo "Pinterest" en escritorio.

---

## 2. Flujo de Usuario: Onboarding y Preferencias (Smart Profiling)

### A. Landing Page (Pre-Login)
* **Objetivo:** Captación visual y definición de propuesta de valor.
* **Elementos:** Diseño limpio, imágenes aspiracionales de outfits, slogan "Define tu estilo".
* **Call to Action (CTA):** Botones claros de "Iniciar Sesión" y "Registrarse".

### B. Autenticación
* Login/Registro estándar (Email, Google, Apple).

### C. Cuestionario de Estilo (The Style Quiz)
* **Condición:** Aparece **solo** la primera vez que un usuario se registra.
* **Datos a recoger:**
    1.  **Datos Biométricos Básicos:** Edad, Sexo, Altura.
    2.  **Gustos Visuales:** Selector visual de Outfits y Prendas (Tinder-style o Grid de selección: "¿Qué te pondrías?").
    3.  **Marcas:** Selección de marcas favoritas.
* **Opción "Otro":** Si el usuario selecciona "Otro" o salta pasos, la preferencia se marca como `NULL`.
* **Resultado:** Se genera un `UserProfile` con preferencias que alimentará el algoritmo de recomendación.

---

## 3. Navegación y Estructura Global

### Bottom Navigation Bar (Móvil)
* **Comportamiento:** "Sticky" (fija) en la parte inferior.
* **Visibilidad:** Se oculta automáticamente en flujos profundos (Chat abierto, Editor de Outfit, Configuración) para dar inmersión total.

### Header / Barra Superior (Móvil - Perfil)
* **Izquierda:** Avatar del usuario + Nombre de usuario.
* **Derecha:**
    * **Botón (+):** Desplegable discreto (burbuja) -> "Crear Nuevo Outfit" / "Crear Nuevo Post".
    * **Menú Hamburguesa (☰):** Acceso rápido a Configuración General.

---

## 4. Detalle de Pantallas y Funcionalidades

### A. FEED (Home)
* **Escritorio:** Grid "Masonry" (Pinterest). Filas de 6-7 ítems.
* **Móvil:** Grid adaptado (1 o 2 columnas).
* **Contenido:**
    * Post = Outfit (Collage interactivo) + [Opcional] Fotos reales (Carrusel).
    * **Interacción:** Las fotos reales son estáticas. El Collage es interactivo (al pulsar, lista las prendas con precios/tienda).

### B. BÚSQUEDA (Search / Explore)
* **Estado Inicial (Default View):**
    * **No muestra nada aleatorio.** Muestra un feed de recomendaciones personalizadas ("Para ti") basado en el *Cuestionario de Estilo*.
    * **Regla de Negocio (Algoritmo):**
        * Si `UserProfile.Preferences != NULL`: Muestra contenido afín a sus gustos.
        * Si `UserProfile.Preferences == NULL` (o marcó "Otro"): Muestra contenido **Trending/General** (lo más popular de la app).
* **Acción de Buscar:**
    * Barra de búsqueda superior.
    * Al hacer focus/escribir: Filtra por Usuarios, Hashtags, Prendas, Outfits.
* **Móvil vs Escritorio:**
    * **Móvil:** La búsqueda ocupa toda la pantalla.
    * **Escritorio:** Mantiene el grid de resultados amplio.

### C. MENSAJES (Direct)
* **Versión Escritorio (Split View):**
    * Columna Izquierda: Lista de Chats.
    * Columna Derecha: Conversación activa.
* **Versión Móvil (Full Screen Flow - Estilo Instagram):**
    * **Pantalla 1 (Bandeja):** Lista de chats a pantalla completa. Barra de búsqueda.
    * **Pantalla 2 (Conversación):** Al pulsar un chat, hace transición a una nueva pantalla completa con la conversación. Botón "Atrás" arriba a la izquierda.
* **Funciones:** Compartir Posts/Outfits internamente (solo a amigos/seguidores mutuos).

### D. ARMARIO (Closet)
* **Tabs:** "Prendas" | "Outfits".
* **Filtros Inteligentes:** Categoría, Color, Marca, Temporada.
* **Empty States:** Si no hay datos, mostrar CTA claro: *"Añade tu primera prenda"* o *"Crea tu primer outfit"*.
* **Añadir Prenda:** Flujo de cámara -> IA borrado de fondo -> Guardar.

### E. EDITOR DE OUTFIT (Crear)
* **Diferenciación Crítica de Flujo:**
    * **Escritorio (All-in-One):** Pantalla dividida. Izquierda: Selector de armario. Derecha: Canvas de edición. Drag & Drop inmediato.
    * **Móvil (Step-by-Step):**
        * **Paso 1:** Grid de selección de prendas. El usuario marca las que quiere usar. No hay canvas aún.
        * **Paso 2:** Botón "Siguiente".
        * **Paso 3:** Canvas a pantalla completa. Las prendas seleccionadas aparecen para ser colocadas, redimensionadas y rotadas (Gestos táctiles).
* **Finalización:** Asignar Nombre, Tags y Guardar.

### F. PERFIL DE USUARIO
* **Layout:** Cabecera + Estadísticas + Grid de contenido (4 columnas).
* **Pestañas:** "Mis Posts" | "Guardados" (con carpetas visuales tipo Pinterest).
* **Botones de Acción (Debajo de la Bio):**
    1.  **"Editar Perfil":** Lleva a `Configuración > Datos Personales` (Avatar, Nombre, Bio, Usuario).
    2.  **"Editar Preferencias":** Lleva a `Configuración > Test de Estilo`. Permite rehacer el cuestionario para recalibrar el algoritmo de recomendaciones.

### G. NOTIFICACIONES
* **Lógica:** Agrupación de likes/comentarios.
* **Empty State:** "Estás al día" (limpio).

---

## 5. Reglas de Negocio y Algoritmos

1.  **Personalización (The Core):**
    * El feed de "Búsqueda" y las sugerencias siempre priorizan las `UserPreferences`.
    * Si el usuario cambia sus gustos en "Editar Preferencias", el feed debe actualizarse instantáneamente.
2.  **Composición de Outfits:**
    * Estilo "Flat Lay" (Collage sin maniquí o con avatar flotante).
    * Libertad total de posicionamiento (Z-index, rotación, escala).
3.  **Privacidad Social:**
    * Solo se puede chatear/compartir con conexiones aceptadas (Follow/Follow back).

## 6. SISTEMA DE DISEÑO Y UX (VISUAL & FEEL)

### A. Paleta de Colores (Strict Mode)
La aplicación debe respirar minimalismo. El color es funcional, no decorativo.
* **Color Primario (Accent):** `Klozet Pink` (El rosa vibrante de la marca).
    * *Uso:* Botones principales (CTAs), Iconos activos en la BottomBar, Hashtags, Notificaciones, "Corazón" de Like activo.
    * *Regla:* No usar degradados en botones, usar colores planos (Flat) para mantener la limpieza.
* **Fondos (Backgrounds):**
    * *Modo Claro:* Blanco Puro (`#FFFFFF`) para contenedores y Gris Hueso muy suave (`#FAFAFA` o `#F5F5F7`) para el fondo de la app.
    * *Modo Oscuro:* Negro Puro (`#000000`) para fondos (OLED friendly) y Gris Carbón (`#121212`) para tarjetas/elevaciones.
* **Textos:**
    * Principal: Negro (`#000000`) / Blanco (`#FFFFFF`).
    * Secundario: Gris Medio (`#8E8E93`) para fechas, subtítulos y estados inactivos.
* **Bordes y Separadores:** Ultra sutiles. Usar Gris muy claro (`#E5E5EA`) con opacidad al 50%. Preferir espacios en blanco a líneas divisorias.

## B. La Experiencia "Pinterest" (Feed & Discovery)
Para lograr la sensación de descubrimiento infinito:
1.  **Masonry Layout (Ladrillos):**
    * El Feed NO es una lista de tarjetas iguales. Es un grid asimétrico (2 columnas en móvil) donde la altura de la tarjeta depende de la foto del outfit.
    * **Border Radius:** Las tarjetas de outfit deben tener bordes redondeados pronunciados (ej: `rounded-xl` o `16px`).
2.  **Limpieza de Metadatos:**
    * En la vista de grid, **SOLO** mostrar la foto.
    * Al pulsar (Tap), no abrir una página nueva tosca. Usar **"Shared Element Transition"**: La foto se expande fluidamente hasta ocupar la pantalla (estilo detalle de Pinterest).
3.  **Botones sobre imagen:**
    * El botón de "Guardar" o "Like" debe ser sutil, flotando sobre la imagen con un fondo `blur` (cristal) o blanco semitransparente, para no tapar la ropa.

## C. La Experiencia "Instagram" (Social & Flow)
Para que la app se sienta "Top" y fluida:
1.  **Navegación por Gestos (Swipes):**
    * En la vista de detalle de un Post, permitir `Swipe Down` para cerrar y volver al feed.
    * En Mensajes, `Swipe Right` para volver a la lista.
2.  **Haptic Feedback (Vibración):**
    * Integrar micro-vibraciones al dar Like, al Guardar en una carpeta o al recibir un Match de estilo.
3.  **Historias (Post-Like):**
    * Aunque son Posts permanentes, la transición entre fotos de un mismo outfit debe ser un carrusel horizontal con "puntitos" indicadores (dots) minimalistas en la parte inferior.
4.  **Header y BottomBar:**
    * Deben tener fondo `backdrop-blur-md` (efecto cristal esmerilado) blanco/negro translúcido. El contenido pasa por debajo al hacer scroll.
    * Los iconos de la barra inferior no llevan etiquetas de texto, solo el icono limpio. El activo se tiñe de **Klozet Pink**.

## D. Estados Vacíos y Carga (Skeletons)
Nunca mostrar una rueda girando aburrida.
* **Loading:** Usar "Skeleton Screens" (esqueletos grises pulsantes con la forma de las tarjetas del grid) que imiten la estructura asimétrica de Pinterest.
* **Error/Empty:** Usar ilustraciones lineales minimalistas en tonos grises + un toque de rosa, con textos amigables (ej: "Tu armario está esperando su primera joya").

## E. Tipografía
* Usar una Sans-Serif moderna y geométrica (tipo *Inter*, *San Francisco* o *Circular*).
* **Jerarquía:** Títulos en **Bold** (Negrita), Textos de cuerpo en **Regular**. Evitar las cursivas o fuentes con serifa a menos que sea para un detalle editorial muy específico.

## 7 SQLS

* Si es necesario que cambies los sqls, para base de datos en supabase hay 2 sqls que están creados que puedes editar para que se ajusten a los cambios que hagas en la aplicaicion y siempre en pos de mejorar la base de datos y que las funcionalidades de la aplicacion se ajusten a la base de datos.