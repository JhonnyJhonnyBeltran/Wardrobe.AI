# Klozet iOS Widgets (`WidgetKit`) — Guía de Activación en Xcode

Archivos Swift listos en `ios/App/KlozetWidgets/`:
- `KlozetWidgetModels.swift` (App Group `group.es.klozet.app` + `TimelineProvider`)
- `KlozetTodayWidget.swift` (Widget `.systemSmall` cuadrado + `.systemMedium` alargado con Logo Kloe, solo temperatura y lugar, Outfit de hoy o Kloe + "Crea un outfit hoy")

## Pasos al compilar para App Store / TestFlight en macOS Xcode
1. Abrir `ios/App/App.xcodeproj` en Xcode.
2. En **App** target → *Signing & Capabilities* → añadir **App Groups**: `group.es.klozet.app`.
3. Menú **File → New → Target → Widget Extension** → nombre `KlozetWidgets` (sin Live Activity ni Configuration Intent si usas `StaticConfiguration`).
4. Reemplazar los Swift autogenerados por `KlozetWidgetModels.swift` y `KlozetTodayWidget.swift`, añadir el mismo **App Group** `group.es.klozet.app`, e incluir en su `Assets.xcassets`:
   - `KloeLogo` ← `/public/kloe-logo-large.png`
   - `KloeMascotPink` ← `/public/kloe-blink-open.png`
5. Añadir URL Scheme `klozet` en `ios/App/App/Info.plist` para que tocar el widget abra `/closet?tab=calendar` (`klozet://closet?tab=calendar`) o `/create` (`klozet://create`).
