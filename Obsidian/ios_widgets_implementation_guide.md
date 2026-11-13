# Guía de Implementación de Widgets de iOS (iPhone WidgetKit) - Klozet

Esta guía detalla la arquitectura y los pasos exactos para compilar y desplegar los Widgets de pantalla de inicio en iOS (iPhone) para **Klozet**.

---

## 1. Arquitectura del Widget en iPhone

Los widgets de iOS se ejecutan de manera aislada en el sistema mediante el framework nativo **WidgetKit** de Apple (Swift / SwiftUI). No pueden renderizar JavaScript o páginas web directamente en la pantalla de inicio.

La integración se realiza en tres componentes:

1. **Endpoint de datos (`GET /api/widgets/today`)**:
   - Ya implementado en la aplicación web/backend (`app/api/widgets/today/route.ts`).
   - Devuelve la temperatura actual, previsión del tiempo y el outfit programado para el día de hoy del usuario en formato JSON:
   ```json
   {
     "weather": {
       "city": "Madrid",
       "temp": 19,
       "condition": "sunny"
     },
     "outfit": {
       "id": "...",
       "name": "Look Viernes",
       "imageUrl": "https://..."
     },
     "isPremium": true
   }
   ```

2. **Contenedor compartido (App Groups)**:
   - Identificador: `group.es.klozet.app`.
   - Permite que la app principal de Capacitor comparta la sesión, el token del usuario o la caché del outfit de hoy en `UserDefaults(suiteName: "group.es.klozet.app")`.

3. **WidgetKit Extension (SwiftUI en Xcode)**:
   - Target nativo `KlozetTodayWidget` en el proyecto `ios/App/App.xcworkspace`.
   - Consulta el endpoint o lee el contenedor compartido cada hora o a las 00:00 (hora peninsular).

---

## 2. Pasos para Implementarlo en Xcode

### Paso 1: Abrir el proyecto nativo en Xcode
```bash
npx cap open ios
```

### Paso 2: Crear el Target de Widget Extension
1. En Xcode, ve al menú: **File > New > Target...**
2. Busca y selecciona **Widget Extension**.
3. Configura:
   - **Product Name**: `KlozetTodayWidget`
   - **Include Configuration Intent**: Desmarcado (widget estático basado en el día actual).
4. Pulsa **Finish** y en el diálogo "¿Activate scheme?", pulsa **Activate**.

### Paso 3: Configurar App Groups (Compartir sesión)
1. Selecciona el target principal `App` > pestaña **Signing & Capabilities**.
2. Pulsa **+ Capability** > selecciona **App Groups**.
3. Añade el grupo: `group.es.klozet.app`.
4. Repite el mismo paso para el target `KlozetTodayWidget` con el mismo identificador `group.es.klozet.app`.

---

## 3. Código Swift para `KlozetTodayWidget.swift`

Reemplaza el archivo generado en `ios/App/KlozetTodayWidget/KlozetTodayWidget.swift` con la siguiente implementación:

```swift
import WidgetKit
import SwiftUI

struct TodayWidgetData: Codable {
    let weather: WeatherData?
    let outfit: OutfitData?
    let isPremium: Bool?
    let locked: Bool?
}

struct WeatherData: Codable {
    let city: String?
    let temp: Double?
    let condition: String?
}

struct OutfitData: Codable {
    let id: String?
    let name: String?
    let imageUrl: String?
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: TodayWidgetData?
    let outfitImage: UIImage?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: nil, outfitImage: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), data: nil, outfitImage: nil)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        fetchTodayWidgetData { widgetData in
            if let imgUrlString = widgetData?.outfit?.imageUrl, let url = URL(string: imgUrlString) {
                URLSession.shared.dataTask(with: url) { imgData, _, _ in
                    let uiImage = imgData.flatMap { UIImage(data: $0) }
                    let entry = SimpleEntry(date: Date(), data: widgetData, outfitImage: uiImage)
                    let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
                    let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
                    completion(timeline)
                }.resume()
            } else {
                let entry = SimpleEntry(date: Date(), data: widgetData, outfitImage: nil)
                let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
                let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
                completion(timeline)
            }
        }
    }

    func fetchTodayWidgetData(completion: @escaping (TodayWidgetData?) -> Void) {
        guard let url = URL(string: "https://klozet.es/api/widgets/today") else {
            completion(nil)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        // Si hay token en App Group, se adjunta en headers
        if let sharedDefaults = UserDefaults(suiteName: "group.es.klozet.app"),
           let token = sharedDefaults.string(forKey: "supabase_auth_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        URLSession.shared.dataTask(with: request) { data, _, _ in
            guard let data = data else {
                completion(nil)
                return
            }
            let decoded = try? JSONDecoder().decode(TodayWidgetData.self, from: data)
            completion(decoded)
        }.resume()
    }
}

struct KlozetTodayWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(UIColor.systemBackground)

            if entry.data?.locked == true || entry.data?.isPremium == false {
                VStack(spacing: 8) {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 24))
                        .foregroundColor(Color(red: 255/255, green: 102/255, blue: 196/255))
                    Text("Klozet Pro")
                        .font(.headline)
                        .fontWeight(.bold)
                    Text("Desbloquea el widget de hoy")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding()
            } else if let outfit = entry.data?.outfit {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        if let city = entry.data?.weather?.city, let temp = entry.data?.weather?.temp {
                            Text("\(city) · \(Int(round(temp)))°")
                                .font(.caption2)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Circle()
                            .fill(Color(red: 255/255, green: 102/255, blue: 196/255))
                            .frame(width: 8, height: 8)
                    }

                    if let img = entry.outfitImage {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .cornerRadius(12)
                    }

                    Text(outfit.name ?? "Outfit de Hoy")
                        .font(.caption)
                        .fontWeight(.bold)
                        .lineLimit(1)
                }
                .padding(12)
            } else {
                VStack(spacing: 6) {
                    Image(systemName: "calendar.badge.plus")
                        .font(.system(size: 26))
                        .foregroundColor(Color(red: 255/255, green: 102/255, blue: 196/255))
                    Text("Sin outfit hoy")
                        .font(.caption)
                        .fontWeight(.bold)
                    Text("Toca para planificar en Klozet")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "klozet://closet?tab=calendar"))
    }
}

@main
struct KlozetTodayWidget: Widget {
    let kind: String = "KlozetTodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            KlozetTodayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Klozet · Outfit de Hoy")
        .description("Tu look planificado del día y la temperatura en tu pantalla de inicio.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

---

## 4. Resumen de Flujo para el Usuario

1. El usuario guarda un outfit en el calendario para hoy (`calendar_outfits`).
2. Añade el widget en la pantalla de inicio de su iPhone manteniendo pulsado > botón **+** > busca **Klozet**.
3. El widget lee `/api/widgets/today`:
   - Si no es usuario Pro: muestra el candado rosa requiriendo Klozet Pro.
   - Si es usuario Pro: muestra la imagen de su look programado junto a la temperatura de su ciudad.
   - Al pulsar el widget, abre directamente la app en el calendario del armario.
