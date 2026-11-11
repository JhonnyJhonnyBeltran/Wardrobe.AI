import SwiftUI
import WidgetKit

private let klozetPink = Color(red: 1.0, green: 102.0 / 255.0, blue: 196.0 / 255.0)

/// Apple WidgetKit Widget styled per awesome-ios-widgets & Klozet Brand Kit:
/// - Supports .systemSmall (Cuadrado) and .systemMedium (Alargado)
/// - Shows Kloe Logo + ONLY today's temperature and city
/// - Displays Today's Outfit or Kloe Mascot + "Crea un outfit hoy" when empty
struct KlozetTodayWidgetView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme
    let entry: KlozetTodayEntry

    private var snap: KlozetWidgetSnapshot { entry.snapshot }
    private var tempText: String {
        if let t = snap.tempC {
            return "\(t)°"
        }
        return "--°"
    }

    var body: some View {
        let deepLink = snap.hasOutfitToday
            ? URL(string: "klozet://closet?tab=calendar")!
            : URL(string: "klozet://create")!

        Group {
            switch family {
            case .systemMedium:
                mediumLayout
            default:
                smallLayout
            }
        }
        .widgetURL(deepLink)
    }

    // MARK: - Square (2x2 systemSmall)
    private var smallLayout: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                Image("KloeLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 22)

                Spacer(minLength: 4)

                VStack(alignment: .trailing, spacing: 1) {
                    Text(tempText)
                        .font(.system(size: 19, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)

                    HStack(spacing: 2) {
                        Image(systemName: "mappin")
                            .font(.system(size: 8, weight: .semibold))
                            .foregroundStyle(klozetPink)
                        Text(snap.city)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
            }

            if snap.hasOutfitToday {
                outfitPreviewBox
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                VStack(spacing: 6) {
                    Image("KloeMascotPink")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 44)

                    Text("+ Crea un outfit hoy")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(klozetPink, in: Capsule())
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .padding(14)
        .containerBackground(for: .widget) {
            Color(.systemBackground)
        }
    }

    // MARK: - Wide / Elongated (4x2 systemMedium)
    private var mediumLayout: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 0) {
                Image("KloeLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 24)

                Spacer()

                Text(tempText)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(.primary)
                    .minimumScaleFactor(0.8)

                HStack(spacing: 4) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(klozetPink)
                    Text(snap.city)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                .padding(.top, 2)

                Spacer()

                if snap.hasOutfitToday {
                    Text(snap.outfitName ?? "Outfit de hoy")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(
                            Color(.secondarySystemBackground),
                            in: Capsule()
                        )
                } else {
                    Text("+ Crea un outfit hoy")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(klozetPink, in: Capsule())
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Group {
                if snap.hasOutfitToday {
                    outfitPreviewBox
                } else {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(klozetPink.opacity(colorScheme == .dark ? 0.16 : 0.10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .strokeBorder(klozetPink.opacity(0.28), lineWidth: 1)
                        )
                        .overlay(
                            Image("KloeMascotPink")
                                .resizable()
                                .scaledToFit()
                                .padding(18)
                        )
                }
            }
            .frame(width: 138)
        }
        .padding(14)
        .containerBackground(for: .widget) {
            Color(.systemBackground)
        }
    }

    @ViewBuilder
    private var outfitPreviewBox: some View {
        RoundedRectangle(cornerRadius: 18, style: .continuous)
            .fill(.white)
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(Color.black.opacity(0.06), lineWidth: 1)
            )
            .overlay(
                Group {
                    if let urlString = snap.outfitImageUrl,
                       let url = URL(string: urlString),
                       let data = try? Data(contentsOf: url),
                       let uiImage = UIImage(data: data) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                            .padding(6)
                    } else {
                        VStack(spacing: 4) {
                            Image(systemName: "tshirt.fill")
                                .font(.system(size: 26))
                                .foregroundStyle(klozetPink)
                            Text(snap.outfitName ?? "Outfit listo")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundStyle(.black.opacity(0.75))
                                .lineLimit(1)
                        }
                        .padding(8)
                    }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

struct KlozetTodayWidget: Widget {
    let kind: String = "KlozetTodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: KlozetTodayProvider()) { entry in
            KlozetTodayWidgetView(entry: entry)
        }
        .configurationDisplayName("Kloe · Outfit y Clima")
        .description("Mira tu outfit de hoy con la temperatura y tu ciudad, o pídele a Kloe uno nuevo en un toque.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct KlozetWidgetsBundle: WidgetBundle {
    var body: some Widget {
        KlozetTodayWidget()
    }
}
