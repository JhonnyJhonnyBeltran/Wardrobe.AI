# ⚖️ DICTAMEN DEL CONSEJO DE NEGOCIO (RONDA 3 — AUDITORÍA INTEGRAL DE PRODUCTO, UX/UI, FLUJOS, BENCHMARK SOCIAL 2026 Y RETENCIÓN): KLOZET (WARDROBE.AI)

**Para:** Ethan Curro (Fundador & Operador Técnico)  
**De:** Consejo de Negocio (`business-believer`, `business-hater`, `business-investor`, `business-judge`)  
**Fecha:** 4 de Noviembre de 2026  
**Estado:** **APROBADO CON HOJA DE RUTA DE PULIDO OBLIGATORIA (PRE-ESCALADO)**  
**Puntuación Actual:** **78 / 100** *(Ingeniería 93/100; penalizada por fricción D1 de 1,16 prendas/usuario y bugs puntuales de flujo/UI)*  
**Puntuación tras Plan de Choque:** **95 / 100**

---

## 1. VEREDICTO EJECUTIVO Y RESPUESTA A LA PREGUNTA: "¿SI UN USUARIO LO PROBARA TODO HOY, SE QUEDARÍA O SE IRÍA?"

1. **Minutos 0 a 2 (El flechazo inicial — SE ENAMORA):**
   - La velocidad instantánea entre pestañas (`0 ms` SWR), la identidad *"Un juguete dentro de un iPhone"* (`#FF66C4` + cristal Apple), el recorte WASM en el navegador, el lienzo de outfits siempre blanco (`bg-white`, por directriz expresa del fundador para que las prendas oscuras luzcan nítidas en tema oscuro) y el nuevo exportador de **Stickers 9:16 en 2K HD (`1440×2560`) con botón Copiar directo al portapapeles estilo Strava** sorprenden al usuario desde el primer minuto.
2. **Minuto 3 al Día 3 (Por qué hoy ~80% se enfría o se va si prueba todo a fondo):**
   - **Causa #1 — El Muro de las `1,16 prendas/usuario` (Cold-Start Mortal):** En la base de datos hay 24 usuarios y 28 prendas (`1,16 prendas/usuario`). Quien descubre Klozet desde el sofá, en el metro o viendo TikTok no tiene su ropa extendida para fotografiarla en ese minuto. Sube 0 o 1 prenda, entra a `/create` o a Kloe (`/closet/kloe`), ve que con 1 prenda no se puede armar un outfit completo (mínimo 3 piezas: top + bottom + calzado) y cierra la app pensando *"luego en casa subo mi ropa"*.
   - **Causa #2 — Flujos rotos si explora toda la app:**
     1. En ordenador (`md:`), la bandeja de entrada de `/messages` oculta la lista de conversaciones (`md:hidden` en `app/(app)/messages/page.tsx:276`), dejando la pantalla sin chats donde hacer clic.
     2. En `/closet/kloe`, el botón de upgrade promete `"Kloe Pro (desde 1,66 €/mes)"` (`kloe/page.tsx:1149, 1709`), pero al abrir `KloeProModal` el precio sube a `24,99 €/año (~2,08 €/mes)`, y si viene desde `/premium` habiendo elegido el plan mensual (`2,99 €`), el modal le resetea al anual (`24,99 €`).
     3. En el Calendario (`OutfitCalendar.tsx:706-739`), al abrir una prenda con `ProductModal`, se pasan funciones vacías `onEdit={() => {}}` y `onDelete={() => {}}`, haciendo que aparezcan los botones *"Editar"* y *"Eliminar"* que al pulsarlos cierran el modal sin hacer nada.
     4. En `/post/[id]`, el botón `"Responder"` en los comentarios (`lineas 1208 y 1280`) no tiene `onClick`, y publicar un post en `/create-post` no invalida la caché de 2 minutos de `useFeedStore`.

---

## 2. AUDITORÍA EXHAUSTIVA DE VISUALES, COLORES, INTERFACES, TEXTOS Y FLUJOS

### 🔴 A. Flujos Rotos y Bugs Funcionales (Prioridad Crítica)
1. **Lista de Mensajes invisible en Escritorio (`app/(app)/messages/page.tsx:276`):** El contenedor de la lista de chats tiene `md:hidden`, por lo que en pantallas `>=768px` solo se ve el panel derecho vacío pidiendo *"Selecciona una conversación de la lista"* sin que exista la lista a la izquierda.
2. **Incoherencia de Precios en Botones vs Modal (`app/(app)/closet/kloe/page.tsx:1149, 1709` vs `KloeProModal.tsx` vs `premium/page.tsx:52`):**
   - `kloe/page.tsx` muestra `"desde 1,66 €/mes"` (antiguo cálculo de 19,99 €/año) en vez de `"desde 2,08 €/mes"` (24,99 €/año).
   - `premium/page.tsx` no pasa `selectedPlan` a `openPremiumModal(selectedPlan)`.
3. **Botones `() => {}` Muertos en Calendario y Modales (`components/OutfitCalendar.tsx:706-739`, `components/ItemDetailModal.tsx:65,72,180`, `app/(app)/create-post/page.tsx:582-584`):**
   - Pasar `onEdit={() => {}}` y `onDelete={() => {}}` a `ProductModal` activa visualmente los botones de edición/borrado pero no ejecuta ninguna acción.
4. **Botón `"Responder"` sin acción en Comentarios (`app/(app)/post/[id]/page.tsx:1208, 1280`):** El estado `replyingTo` existe pero nunca se conectó al `onClick` del botón `"Responder"`.
5. **Redirecciones a `/login` inexistente (`components/Feed/PostCard.tsx:168`, `app/(app)/post/[id]/page.tsx:561, 576, 650`):** La ruta real es `/auth`, no `/login`.
6. **Caché de Feed sin invalidar tras crear Post (`app/(app)/create-post/page.tsx:317`):** Tras publicar un look, `useFeedStore` mantiene la caché durante 120s y el usuario no ve su propio post recién publicado en `/feed`.
7. **Pérdida de Rasgos Físicos al hidratar sesión (`store/userStore.tsx:120-157`):** `mapProfileToUser` no lee el fallback `notification_preferences.physical_profile`.
8. **Rate Limit de Kloe en RAM volátil (`lib/closy/rateLimiter.ts:15`):** En Vercel Serverless, el `Map` en memoria se reinicia entre lambdas; debe sincronizarse con Supabase.
9. **Bypass de email por substring (`store/userStore.tsx`, `ProfileProgressBar.tsx:20`):** `email.includes('ethan')` da positivo para `"bethany@gmail.com"`. Debe comprobar igualdad exacta con el email del fundador.
10. **Llamada automática a `/api/translate` al abrir cualquier post (`app/(app)/post/[id]/page.tsx:108-137`):** Traduce en segundo plano en el `useEffect` inicial antes de que el usuario pulse *"Ver traducción"*.

### 🟡 B. Visuales, Colores y Diseño (`Obsidian/brand_kit.md`)
1. **Exceso de botones rosas simultáneos en `/closet` (`app/(app)/closet/page.tsx:1043-1102`) y `/messages` (`379-421`):**
   - En `/closet` hay 3 FABs rosas apilados (*Seleccionar*, *Filtrar*, *Nueva Prenda*). Según `brand_kit.md` (§2.2, §6), solo *"+ Nueva Prenda"* debe ser rosa `#FF66C4`; *Seleccionar* y *Filtrar* deben usar superficie neutra/vidrio.
2. **Orbes difuminados y colores morados prohibidos (`brand_kit.md §2.4`):**
   - Orbes `blur-3xl` en `components/KloeProModal.tsx:123-124`, `app/(public)/auth/page.tsx:286-292` y `app/not-found.tsx:25`.
   - Degradados morados residuales en `components/OutfitCard.tsx:27-44`, `components/CookiesBanner.tsx:289` y `app/(app)/chat/page.tsx:36`.
3. **Contraste de Paneles en Modo Oscuro (`app/(app)/post/[id]/page.tsx:1056-1298`):**
   - *Nota: El lienzo de outfits se mantiene en `bg-white` por regla expresa del fundador.*
   - En cambio, la columna derecha de comentarios de `post/[id]/page.tsx` usa clases hardcodeadas `bg-white dark:bg-black` y `border-gray-100 dark:border-gray-800` en lugar de los tokens semánticos `bg-[var(--background)]`, `bg-[var(--card-bg)]` y `border-[var(--border-color)]`.
4. **Geometría de Botones (`rounded-xl` $\rightarrow$ `rounded-full`) y Pestañas de `/closet` en Móvil:**
   - Botones de acción en `profile/page.tsx:432`, `closet/kloe/page.tsx:1314-1365`, `ProductModal.tsx:279-315` y `OutfitDetailModal.tsx:305-360` usan `rounded-xl`/`rounded-2xl` en vez de pastilla `rounded-full`.
   - En `/closet` móvil (`closet/page.tsx:744-765`), las 3 pestañas principales (*Armario*, *Outfits*, *Calendario*) ocultan su texto (`hidden sm:inline`), mostrando solo iconos sin etiqueta.
   - En `OutfitDetailModal.tsx:237`, la lista de prendas del look está oculta en móvil (`hidden md:flex`).

### 🟢 C. Textos y Copywriting
1. **Jerga de "IA" y frases robóticas prohibidas por `brand_kit.md §8 y §10`:**
   - `app/(app)/create/page.tsx:1146`: *"Combina tus prendas con IA en segundos"* $\rightarrow$ Cambiar a *"Combina tu ropa en segundos"*.
   - `app/(app)/closet/kloe/page.tsx:498`: *"Revisando los metadatos de tu armario..."* $\rightarrow$ Cambiar a *"Mirando tu armario para armarte el look..."*.
   - `app/(app)/premium/page.tsx:181`: *"Abrir Hoja de Pago Rápido"* $\rightarrow$ Cambiar a *"Empezar con Klozet Pro"*.
   - `components/AddItemModal`: *"Eliminando fondo con IA..."* / *"Analizando con IA..."* $\rightarrow$ *"Recortando tu prenda..."* / *"Detectando color y estilo..."*.
2. **Gramática y Textos Mixtos:**
   - `components/Notifications/NotificationList.tsx:728`: `"{name} le gustó tu post"` $\rightarrow$ `"A {name} le gustó tu publicación"`.
   - `app/(app)/closet/page.tsx:823`: `"No img"` $\rightarrow$ `"Sin foto"`.
   - `components/ProductModal.tsx:216`: `Marca: Closet` cuando no hay marca $\rightarrow$ Mostrar `"Sin marca"` u ocultar fila.

---

## 3. BENCHMARK DE LAS REDES SOCIALES Y APPS MÁS PUNTERAS (2025–2026)

| App Puntera | Qué hace que sus usuarios entren cada día | Cómo lo integramos en Klozet |
| :--- | :--- | :--- |
| **Whering** | **1-Tap Basic Capsule** en el registro + **"Dress Me" (Ruleta tipo *Clueless*)** + **Style a Friend** | **1. Bandeja de Básicos en 1 Toque** cuando el armario tiene `<3` prendas.<br>**2. Ruleta "Klozet Shuffle"** en `/create` para girar Top / Bottom / Calzado. |
| **Alta Daily** | **Look Matutino Automático** en portada según el clima del día (sin tener que abrir chat ni escribir prompts) + **Maletas de Viaje IA** | **3. Tarjeta "Tu Look de Hoy (Clima + Ocasión)"** arriba en `/closet` lista para guardar en calendario en 1 toque, y **Modo Maleta** en Kloe Pro. |
| **Indyx** | **Analytics de Armario (Cost-Per-Wear, % de armario usado, prendas olvidadas)** + **The Open Closet** | **4. Panel de Estadísticas de Uso** en `/closet` (*"% de armario usado"*, *"Veces puesto"* cada vez que se agenda en el calendario o publica en un post). |
| **Pickle** | **Polls sociales rápidas ("¿A o B para esta noche?")** votadas por la comunidad en tiempo real | **5. Encuesta rápida de 2 looks ("¿Cuál me pongo?")** en el Feed para multiplicar la interacción diaria. |
| **Pinterest Shuffles & Cosmos** | **Botón "Remix"** sobre cualquier collage para recrearlo con tus piezas + curación limpia sin ruido | **6. Botón "Recrear con mi armario"** en `/post/[id]` que lleva el esquema del post directamente a Kloe o `/create`. |
| **Strava & Retro** | **Sticker 9:16 transparente copiable al portapapeles** (¡ya implementado!) + **Recap Semanal / Racha de Calendario** | **7. Resumen Semanal ("Mi Semana en Klozet")** exportable los domingos desde el Calendario como sticker 9:16 para Instagram Stories. |

---

## 4. UNIT ECONOMICS OFICIALES CONSOLIDADOS (`2,99 €/MES` Y `24,99 €/AÑO`)

| Métrica | Plan Mensual (`2,99 € / mes`) | Plan Anual (`24,99 € / año` · `~2,08 €/mes` · Ahorra 30%) |
| :--- | :--- | :--- |
| **PVP Facturado (IVA incl.)** | **2,99 €** | **24,99 €** |
| IVA España (21%) | - 0,52 € | - 4,34 € |
| **Base Imponible Neta** | **2,47 €** | **20,65 €** |
| Comisión Stripe UE (`1,4% + 0,25 €`) | - 0,29 € *(9,7% del PVP)* | - 0,60 € *(solo 2,4% del PVP)* |
| Coste IA Gemini Flash *(Metadata-First)* | - 0,012 € / mes | - 0,14 € / año |
| Coste Supabase Storage *(WebP ~100 KB)* | - 0,015 € / mes | - 0,18 € / año |
| **BENEFICIO NETO LIMPIO EN CAJA** | **2,15 € / mes (87,0% margen s/base)** | **19,73 € en Día 1 (95,5% margen s/base)** |
| **Riesgo de Churn** | Mensual | **0% durante 365 días** |

* **Costes Fijos Mensuales Base:** ~43,00 € – 51,50 € / mes (Vercel Pro + Supabase Pro + Dominio).
* **Break-Even Exacto:** **3 suscripciones anuales al mes** (`59,19 €` netos) o **20–24 suscriptores mensuales activos**.

---

## 5. MATRIZ DE DELEGACIÓN OPERATIVA (SOLOPRENEUR)

| Fase | Umbral MRR | Qué ejecuta Ethan (con IA) | Qué se delega / subcontrata |
| :--- | :--- | :--- | :--- |
| **Fase 0 (Pulido y Tracción)** | **0 € – 1.500 €** | • Ejecución de las Fases 1, 2 y 3 de la Hoja de Ruta.<br>• Vídeos orgánicos en TikTok/Reels mostrando el Sticker 9:16 HD pegado en Instagram Stories y el reto de las *91 horas al año*. | **Cero delegación.** 100% margen neto en caja. |
| **Fase 1 (Sustento)** | **1.500 € – 4.500 €** | • Nuevas mecánicas sociales (*Style a Friend*, *Modo Maleta*, *Klozet Shuffle*). | • **Gestoría SaaS en España:** (~120 €/mes).<br>• **Revisión legal puntual:** (~350 € pago único). |
| **Fase 2 (Escala)** | **> 4.500 €** | • Dirección de producto y alianzas de marca. | • **Micro-creadores UGC** (5–10 perfiles de moda en TikTok/IG). |
