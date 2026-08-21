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
- **Eliminación Total de Cuenta (`/api/user/delete`)**: Eliminación completa en cascada de comentarios, likes, guardados, carpetas, follows, notificaciones, mensajes, conversaciones vacías, outfits, prendas del armario, fotos en Storage (`avatars`, `clothing-images`), perfil en base de datos y registro de autenticación en `auth.users`.

