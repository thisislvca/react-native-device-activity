import DeviceActivity
import Foundation
import SwiftUI

let maxSnapshotApplications = 25
let maxSnapshotCategories = 15

struct TotalActivityConfiguration {
  let totalActivityLabel: String
  let generatedAtLabel: String
}

extension DeviceActivityReport.Context {
  static let totalActivity = DeviceActivityReport.Context(defaultReportContext)
}

struct TotalActivityReport: DeviceActivityReportScene {
  let context: DeviceActivityReport.Context = .totalActivity
  let content: (TotalActivityConfiguration) -> TotalActivityView

  func makeConfiguration(
    representing data: DeviceActivityResults<DeviceActivityData>
  ) async -> TotalActivityConfiguration {
    var totalActivityDuration: TimeInterval = 0
    var applicationBuckets: [String: DeviceActivityReportSnapshotApplication] = [:]
    var categoryBuckets: [String: DeviceActivityReportSnapshotCategory] = [:]

    for await activity in data {
      for await segment in activity.activitySegments {
        totalActivityDuration += segment.totalActivityDuration

        for await categoryActivity in segment.categories {
          let categoryName = categoryActivity.category.localizedDisplayName
          let categoryKey = categoryName ?? "unknown-category"
          let previousCategory = categoryBuckets[categoryKey]
          categoryBuckets[categoryKey] = DeviceActivityReportSnapshotCategory(
            localizedDisplayName: categoryName,
            durationSeconds: (previousCategory?.durationSeconds ?? 0) + categoryActivity
              .totalActivityDuration
          )

          for await applicationActivity in categoryActivity.applications {
            let appName = applicationActivity.application.localizedDisplayName
            let bundleIdentifier = applicationActivity.application.bundleIdentifier
            let appKey = bundleIdentifier ?? appName ?? "unknown-application"
            let previous = applicationBuckets[appKey]
            applicationBuckets[appKey] = DeviceActivityReportSnapshotApplication(
              bundleIdentifier: bundleIdentifier,
              localizedDisplayName: appName,
              durationSeconds: (previous?.durationSeconds ?? 0) + applicationActivity
                .totalActivityDuration,
              pickups: (previous?.pickups ?? 0) + applicationActivity.numberOfPickups,
              notifications: (previous?.notifications ?? 0) + applicationActivity
                .numberOfNotifications
            )
          }
        }
      }
    }

    let totalPickups = applicationBuckets.values.reduce(0) { $0 + $1.pickups }
    let totalNotifications = applicationBuckets.values.reduce(0) { $0 + $1.notifications }
    let applications = Array(
      applicationBuckets.values.sorted { $0.durationSeconds > $1.durationSeconds }
        .prefix(maxSnapshotApplications)
    )
    let categories = Array(
      categoryBuckets.values.sorted { $0.durationSeconds > $1.durationSeconds }
        .prefix(maxSnapshotCategories)
    )
    let reportState = reportViewState(for: context.rawValue)
    let snapshot = DeviceActivityReportSnapshotPayload(
      context: reportState.context,
      generatedAt: Date().ISO8601Format(),
      from: reportState.from,
      to: reportState.to,
      segmentation: reportState.segmentation,
      totalActivityDurationSeconds: totalActivityDuration,
      totalPickups: totalPickups,
      totalNotifications: totalNotifications,
      applications: applications,
      categories: categories,
      version: 1
    )
    writeReportSnapshot(snapshot)

    return TotalActivityConfiguration(
      totalActivityLabel: formatDuration(totalActivityDuration),
      generatedAtLabel: Date().formatted(date: .abbreviated, time: .shortened)
    )
  }

  private func formatDuration(_ duration: TimeInterval) -> String {
    let formatter = DateComponentsFormatter()
    formatter.allowedUnits = [.day, .hour, .minute, .second]
    formatter.unitsStyle = .abbreviated
    formatter.zeroFormattingBehavior = .dropAll

    return formatter.string(from: duration) ?? "0s"
  }
}
