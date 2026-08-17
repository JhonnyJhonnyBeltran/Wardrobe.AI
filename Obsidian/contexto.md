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
- El flujo de inicio rápido para nuevos usuarios está en `/onboarding/preferences` y consta de 3 pasos para optimizar la retención:
  1. **Edad:** Rango de edad del usuario (`age_range`).
  2. **Identidad:** Mujer, Hombre u Otro.
  3. **Estilos:** Selección visual de `style_options`.
- Al finalizar, se guarda en `profiles` actualizando `style_completed = true`.

## Motor de Recomendaciones (Search)
- La pantalla de Búsqueda (`/search`) muestra por defecto los "posts populares".
- Si el usuario ha seleccionado `preferredStyles` en su onboarding, la consulta utiliza `.overlaps('style_ids', user.preferredStyles)` para filtrar las publicaciones más afines a su estilo antes de ordenarlas por fecha y likes.
- Se ha añadido la columna `style_ids TEXT[]` a las tablas de `clothing_items`, `outfits` y `posts` para poder enlazar estilos a las prendas.

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
