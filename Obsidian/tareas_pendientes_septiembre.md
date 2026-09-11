# Registro de Tareas de Mejora - Septiembre 2026

Este documento almacena el desglose detallado de las 12 tareas solicitadas para su resolución secuencial y verificación paso a paso.

---

## 📋 Lista de Tareas y Requisitos Técnicos

### Tarea 1: Visualización de Prendas en Posts Ajenos (`/post/[id]`)
- **Problema**: Al abrir el post de otro usuario, no se muestran las prendas del look (`clothing_items`) ni se puede abrir el modal de detalle (`ProductModal`). Solo funcionan en posts propios debido a las políticas RLS de Supabase en `clothing_items`.
- **Solución**:
  - Implementar endpoint seguro o consulta de servidor con service role (`/api/posts/[id]` o `/api/outfits/[id]`) que resuelva las prendas públicas vinculadas al outfit del post sin ser bloqueado por RLS.
  - Asegurar que al pulsar sobre cada prenda se abra correctamente el `ProductModal` con la información del artículo.

### Tarea 2: Corrección del Estrechamiento del Navbar en Escritorio en `/post/[id]`
- **Problema**: En la vista de `/post/[id]`, el layout expandido del post modifica el ancho efectivo de la pantalla / scrollbar, provocando que el sidebar/navbar en PC se estreche y se genere un hueco visible al abrir el panel lateral de notificaciones.
- **Solución**:
  - Ajustar el ancho máximo y las reglas de `overflow` / scrollbar gutter (`scrollbar-gutter: stable`) en el contenedor de `/post/[id]`.
  - Asegurar que `Sidebar` (`w-[72px]`) mantenga su posición y dimensiones fijas sin desplazamientos ni compresiones.

### Tarea 3: Gestión de Acceso y Redirección en `/closet/kloe` (Modal en `/closet`)
- **Problema**: El modal de suscripción se abre dentro de `/kloe` con elementos visuales no deseados (icono de corona, parpadeo del logo, botón de volver a klozet).
- **Solución**:
  - Si un usuario sin suscripción activa (`!isPremium()`) intenta entrar a `/closet/kloe`, redirigirlo automáticamente a `/closet`.
  - Desplegar el modal de suscripción en `/closet`.
  - En `KloeProModal`:
    - Eliminar el icono de la corona.
    - Eliminar la animación de parpadeo del logo de Kloe.
    - Eliminar el botón "Volver a Klozet".

### Tarea 4: Corrección de Error 500 y 'Invalid API Key Provided: sk_live_' en Stripe Checkout
- **Problema**: Al intentar suscribirse desde el modal, la llamada a `/api/stripe/checkout` falla con HTTP 500 y error `Invalid API Key Provided: sk_live_...`.
- **Solución**:
  - Auditar `app/api/stripe/checkout/route.ts` y `lib/stripe/client.ts`.
  - Limpiar la clave secreta de Stripe (eliminar espacios en blanco, comillas dobles, saltos de línea residuales o caracteres corruptos en variables de entorno / fallback).
  - Gestionar excepciones de Stripe de forma segura devolviendo respuestas JSON estructuradas.

### Tarea 5: Asesoría de Compras, Tendencias y Marcas en Kloe AI sin Fallbacks
- **Problema**: Al preguntar dudas como *"¿Qué camiseta básica me recomiendas comprar para combinar con mis prendas?"*, Kloe no recomienda marcas reales (Zara, Uniqlo, etc.) ni analiza el armario completo, y a menudo dispara respuestas de fallback.
- **Solución**:
  - Actualizar el System Prompt de Gemini en `/api/closy/chat/route.ts` para que Kloe actúe como una estilista experta en tendencias y compras:
    - Indexar automáticamente el catálogo completo de prendas del armario del usuario como base de conocimiento.
    - Recomendar explícitamente marcas (Uniqlo, Zara, COS, Massimo Dutti, Nike, etc.), siluetas, tejidos y colores específicos.
    - Evitar fallbacks estáticos y asegurar que peticiones abiertas de compras o tendencias se respondan con análisis de moda enriquecido.

### Tarea 6: Notificaciones en Tiempo Real entre Dispositivos y Eliminación de Duplicados
- **Problema**: Al dar like o seguir desde un dispositivo, el otro no recibe la notificación en tiempo real de inmediato. Además, aparecen notificaciones duplicadas de la misma acción/persona (ej. *"laurfdez le gustó tu post. Justo ahora"* y *"Laura Reguera Fernandez le gustó tu post. hace 0 minutos"*).
- **Solución**:
  - Revisar la suscripción Supabase Realtime en `store/realtimeStore.ts` (`postgres_changes` en tabla `notifications`).
  - Implementar deduplicación estricta por `id`, `actor_id + type + resource_id` en una ventana temporal de 60 segundos.
  - Asegurar sincronización inmediata entre múltiples pestañas/dispositivos.

### Tarea 7: Fix de Like en Fotos, Persistencia y Error 403 Forbidden en `/notifications`
- **Problema**: Al dar like a una foto, a veces no se actualiza el contador, da error `POST https://.../rest/v1/notifications 403 (Forbidden)` al intentar insertar la notificación desde el cliente sin permisos RLS, y el estado de like no se persiste al volver al Feed.
- **Solución**:
  - Las notificaciones de likes/follows no deben insertarse directamente por el cliente contra la tabla `notifications` si no está permitido por RLS; deben crearse mediante RPC segura de base de datos (`SECURITY DEFINER`) o mediante un endpoint `/api/social/like`.
  - Sincronizar el estado optimista y persistente de likes en `useFeedStore`, `useSearchStore` y `useProfileStore` para que el corazón y el contador se mantengan intactos al navegar.

### Tarea 8: Eliminar Botón "Ver post" en la sección de Prendas del Look en `/post/[id]`
- **Problema**: En la vista de `/post/[id]`, dentro de la tarjeta o carrusel de prendas del look aparece un botón redundante "Ver post".
- **Solución**:
  - Eliminar dicho botón para que el usuario solo interactúe abriendo el detalle de la prenda (`ProductModal`).

### Tarea 9: Rediseño Apple HIG de Kloe Móvil, Input/Header Fixed, Erradicación de "Klosy" y Hovers Limpios
- **Problema**:
  - En móvil, la barra de input debe estar siempre fija (`fixed`) en la parte inferior con estilo Apple HIG (`pb-safe`).
  - La cabecera de Kloe debe ser `fixed` idéntica a `/profile`.
  - En los outfits recomendados, eliminar cualquier mención a "Look Klosy:" o "Klosy", y quitar el icono en el título de outfit recomendado.
  - En los iconos superiores de la cabecera y barra de input, unificar el hover: sin fondos raros, icono negro/blanco según tema y hover en rosa `text-[var(--brand-pink)]`, con el tamaño homogéneo de la app.

### Tarea 10: Unificación de Iconos en el Header de Perfil (`/profile`)
- **Problema**: Los iconos de configuración (engranaje) y creación (`+`) del header de perfil deben tener la misma estética que toda la app.
- **Solución**:
  - Icono negro en modo claro, blanco en modo oscuro, y al hacer hover cambiar exclusivamente el color a rosa corporativo (`hover:text-[var(--brand-pink)]`) sin fondo circular opaco gris/negro.

### Tarea 11: Color de Iconos en el Menú Flotante `+` (Perfil y Feed)
- **Problema**: En el menú flotante desplegable del botón `+` (en perfil y feed), los iconos de *Nuevo outfit*, *Nueva prenda* y *Nuevo post* deben tener la paleta oficial de la app (rosa / blanco / negro).
- **Solución**:
  - Actualizar los contenedores e iconos de las 3 opciones con el diseño oficial de la marca.

### Tarea 12: Página 404 Personalizada con Redirección Automática
- **Problema**: La página 404 actual no tiene la identidad de la marca.
- **Solución**:
  - Crear/actualizar `app/not-found.tsx` con un diseño limpio: mensaje *"Upss te has equivocado"*, animación o ilustración sutil de Klozet, y redirección automática tras 1-2 segundos hacia `/feed`.
