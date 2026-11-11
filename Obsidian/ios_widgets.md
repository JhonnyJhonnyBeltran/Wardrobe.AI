# Klozet iOS Widgets Architecture & Reference (`awesome-ios-widgets`)

## Referencia Guardada en Memoria
- **Repositorio de referencia:** https://github.com/sarahstreza/awesome-ios-widgets
- **Patrones adoptados de `awesome-ios-widgets` (iOS 14+ WidgetKit):**
  1. **Tamaños dedicados con densidad Apple HIG:**
     - **Cuadrado (`systemSmall` · 2×2):** máximo 2 puntos de foco visual (logo/temperatura arriba + collage/estado principal abajo). Sin texto secundario ni pronósticos extensos.
     - **Largo / Alargado (`systemMedium` · 4×2):** layout asimétrico en 2 columnas (izquierda tipografía de temperatura + ciudad + píldora CTA; derecha tarjeta visual del outfit o Kloe mascota).
  2. **Smart Stack & Tap Target único:** `widgetURL` nativo (`klozet://closet?tab=calendar` si hay outfit asignado hoy; `klozet://create` si está vacío).
  3. **Glanceability pura:** mostrar **solo temperatura (`21°`) y lugar (`Sevilla`)**, nunca condiciones largas o tablas meteorológicas que saturen el widget.
  4. **Estado vacío con personaje:** cuando no hay outfit asignado hoy en el calendario, mostrar a **Kloe** (`/kloe-blink-open.png`) + botón/etiqueta **`Crea un outfit hoy`** junto al **logo oficial de Kloe** (`/kloe-logo-large.png`).

## Arquitectura Implementada en Klozet
- **Backend Snapshot API:** `app/api/widgets/today/route.ts` (`GET /api/widgets/today?city=...&date=...`) combina `calendar_outfits` de Supabase + `resolveWeatherByCityName` (`lib/weather/forecast.ts`).
- **Previsualizador Interactivo Web/Capacitor:** `components/IosWidgetPreview.tsx` + pantalla `app/(app)/widgets/page.tsx` (`/widgets`, enlazada desde Ajustes y Klozet Pro).
- **Extensión Nativa WidgetKit (SwiftUI):** `ios/App/KlozetWidgets/KlozetWidgetModels.swift` y `ios/App/KlozetWidgets/KlozetTodayWidget.swift` listos para vincular mediante App Group `group.es.klozet.app` al archivar en Xcode para App Store.
