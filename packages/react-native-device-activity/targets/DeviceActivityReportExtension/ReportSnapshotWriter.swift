import Foundation

let reportSnapshotKeyPrefix = "deviceActivityReportSnapshot"
let reportViewStateKeyPrefix = "deviceActivityReportViewState"
let defaultReportContext = "totalActivity"

struct DeviceActivityReportSnapshotApplication: Codable {
  let bundleIdentifier: String?
  let localizedDisplayName: String?
  let durationSeconds: Double
  let pickups: Int
  let notifications: Int
}

struct DeviceActivityReportSnapshotCategory: Codable {
  let localizedDisplayName: String?
  let durationSeconds: Double
}

struct DeviceActivityReportSnapshotPayload: Codable {
  let context: String
  let generatedAt: String
  let from: Double
  let to: Double
  let segmentation: String
  let totalActivityDurationSeconds: Double
  let totalPickups: Int
  let totalNotifications: Int
  let applications: [DeviceActivityReportSnapshotApplication]
  let categories: [DeviceActivityReportSnapshotCategory]
  let version: Int
}

struct DeviceActivityReportViewState {
  let context: String
  let from: Double
  let to: Double
  let segmentation: String
}

func resolvedReportContext(_ context: String) -> String {
  let trimmed = context.trimmingCharacters(in: .whitespacesAndNewlines)
  return trimmed.isEmpty ? defaultReportContext : trimmed
}

func reportSnapshotKey(context: String) -> String {
  "\(reportSnapshotKeyPrefix)_\(resolvedReportContext(context))"
}

func reportViewStateKey(context: String) -> String {
  "\(reportViewStateKeyPrefix)_\(resolvedReportContext(context))"
}

func reportUserDefaults() -> UserDefaults {
  let appGroup =
    Bundle.main.object(forInfoDictionaryKey: "REACT_NATIVE_DEVICE_ACTIVITY_APP_GROUP")
    as? String
  if let appGroup, let defaults = UserDefaults(suiteName: appGroup) {
    return defaults
  }
  return .standard
}

func reportDefaultViewState(context: String) -> DeviceActivityReportViewState {
  let now = Date().timeIntervalSince1970
  let from = Calendar.current.startOfDay(for: Date()).timeIntervalSince1970
  return DeviceActivityReportViewState(
    context: context,
    from: from,
    to: now,
    segmentation: "daily"
  )
}

func normalizedRange(from: Double, to: Double) -> (Double, Double) {
  var normalizedFrom = from.isFinite ? from : 0
  var normalizedTo = to.isFinite ? to : 0
  if normalizedFrom > normalizedTo {
    swap(&normalizedFrom, &normalizedTo)
  }
  if normalizedFrom == normalizedTo {
    normalizedTo = normalizedFrom + 1
  }
  return (normalizedFrom, normalizedTo)
}

func reportViewState(for context: String) -> DeviceActivityReportViewState {
  let context = resolvedReportContext(context)
  let defaults = reportUserDefaults()
  let key = reportViewStateKey(context: context)

  guard let state = defaults.dictionary(forKey: key) else {
    return reportDefaultViewState(context: context)
  }

  let from = state["from"] as? Double ?? 0
  let to = state["to"] as? Double ?? 0
  let (normalizedFrom, normalizedTo) = normalizedRange(from: from, to: to)
  let segmentation = state["segmentation"] as? String ?? "daily"

  return DeviceActivityReportViewState(
    context: context,
    from: normalizedFrom,
    to: normalizedTo,
    segmentation: segmentation
  )
}

func writeReportSnapshot(_ snapshot: DeviceActivityReportSnapshotPayload) {
  let defaults = reportUserDefaults()
  let key = reportSnapshotKey(context: snapshot.context)

  let encoder = JSONEncoder()
  encoder.outputFormatting = [.sortedKeys]
  if let data = try? encoder.encode(snapshot),
    let json = String(data: data, encoding: .utf8) {
    defaults.set(json, forKey: key)
  }
}
