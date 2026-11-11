import Foundation
import WidgetKit

/// Shared App Group identifier linking main Capacitor app (es.klozet.app) & WidgetKit extension
enum KlozetWidgetShared {
    static let appGroupId = "group.es.klozet.app"
    static let snapshotKey = "klozet_today_widget_snapshot_v1"
}

struct KlozetWidgetSnapshot: Codable {
    let date: String
    let city: String
    let tempC: Int?
    let hasOutfitToday: Bool
    let outfitName: String?
    let outfitImageUrl: String?
    let itemImageUrls: [String]
    let updatedAt: Date

    static let emptyFallback = KlozetWidgetSnapshot(
        date: "",
        city: "Madrid",
        tempC: 21,
        hasOutfitToday: false,
        outfitName: nil,
        outfitImageUrl: nil,
        itemImageUrls: [],
        updatedAt: Date()
    )

    static let galleryPlaceholder = KlozetWidgetSnapshot(
        date: "",
        city: "Sevilla",
        tempC: 21,
        hasOutfitToday: true,
        outfitName: "Outfit de hoy",
        outfitImageUrl: nil,
        itemImageUrls: [],
        updatedAt: Date()
    )

    static func loadFromAppGroup() -> KlozetWidgetSnapshot {
        guard
            let defaults = UserDefaults(suiteName: KlozetWidgetShared.appGroupId),
            let data = defaults.data(forKey: KlozetWidgetShared.snapshotKey),
            let decoded = try? JSONDecoder().decode(KlozetWidgetSnapshot.self, from: data)
        else {
            return .emptyFallback
        }
        return decoded
    }

    static func saveToAppGroup(_ snapshot: KlozetWidgetSnapshot) {
        guard
            let defaults = UserDefaults(suiteName: KlozetWidgetShared.appGroupId),
            let encoded = try? JSONEncoder().encode(snapshot)
        else { return }
        defaults.set(encoded, forKey: KlozetWidgetShared.snapshotKey)
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct KlozetTodayEntry: TimelineEntry {
    let date: Date
    let snapshot: KlozetWidgetSnapshot
}

struct KlozetTodayProvider: TimelineProvider {
    func placeholder(in context: Context) -> KlozetTodayEntry {
        KlozetTodayEntry(date: Date(), snapshot: .galleryPlaceholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (KlozetTodayEntry) -> Void) {
        let snapshot = context.isPreview ? KlozetWidgetSnapshot.galleryPlaceholder : KlozetWidgetSnapshot.loadFromAppGroup()
        completion(KlozetTodayEntry(date: Date(), snapshot: snapshot))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KlozetTodayEntry>) -> Void) {
        let snapshot = KlozetWidgetSnapshot.loadFromAppGroup()
        let now = Date()
        let entry = KlozetTodayEntry(date: now, snapshot: snapshot)

        // Refresh every hour and at midnight for calendar rollout
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now.addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}
