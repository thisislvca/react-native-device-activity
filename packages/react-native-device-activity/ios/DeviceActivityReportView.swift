import DeviceActivity
import ExpoModulesCore
import FamilyControls
import SwiftUI
import UIKit

enum DeviceActivityReportSegmentation: String {
  case hourly
  case daily
  case weekly
}

private struct DeviceActivityReportViewState {
  var familyActivitySelection = FamilyActivitySelection()
  var context = DEFAULT_DEVICE_ACTIVITY_REPORT_CONTEXT
  var from = Calendar.current.startOfDay(for: Date())
  var to = Date()
  var segmentation: DeviceActivityReportSegmentation = .daily
  var devicesRawValues: [Int]?
  var usersRawValue: String? = "all"
}

@available(iOS 16.0, *)
class DeviceActivityReportViewModel: ObservableObject {
  @Published var familyActivitySelection = FamilyActivitySelection()
  @Published var devices: DeviceActivityFilter.Devices = .all
  @Published var users: DeviceActivityFilter.Users? = .all
  @Published var context = DEFAULT_DEVICE_ACTIVITY_REPORT_CONTEXT
  @Published var from = Calendar.current.startOfDay(for: Date())
  @Published var to = Date()
  @Published var segmentation: DeviceActivityReportSegmentation = .daily

  var segment: DeviceActivityFilter.SegmentInterval {
    let to = self.to >= from ? self.to : from.addingTimeInterval(1)
    let interval = DateInterval(start: from, end: to)
    switch segmentation {
    case .hourly:
      return .hourly(during: interval)
    case .weekly:
      return .weekly(during: interval)
    case .daily:
      return .daily(during: interval)
    }
  }
}

@available(iOS 16.0, *)
struct DeviceActivityReportContentView: View {
  @ObservedObject var model: DeviceActivityReportViewModel

  private var filter: DeviceActivityFilter {
    if let users = model.users {
      return DeviceActivityFilter(
        segment: model.segment,
        users: users,
        devices: model.devices,
        applications: model.familyActivitySelection.applicationTokens,
        categories: model.familyActivitySelection.categoryTokens,
        webDomains: model.familyActivitySelection.webDomainTokens
      )
    }

    return DeviceActivityFilter(
      segment: model.segment,
      devices: model.devices,
      applications: model.familyActivitySelection.applicationTokens,
      categories: model.familyActivitySelection.categoryTokens,
      webDomains: model.familyActivitySelection.webDomainTokens
    )
  }

  var body: some View {
    DeviceActivityReport(
      DeviceActivityReport.Context(rawValue: model.context),
      filter: filter
    )
  }
}

class DeviceActivityReportView: ExpoView {
  private var state = DeviceActivityReportViewState()
  private var contentViewController: UIViewController?
  private var reportModel: AnyObject?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true
    backgroundColor = .clear

    if #available(iOS 16.0, *) {
      let model = DeviceActivityReportViewModel()
      reportModel = model
      let controller = UIHostingController(
        rootView: DeviceActivityReportContentView(model: model)
      )
      controller.view.backgroundColor = .clear
      addSubview(controller.view)
      contentViewController = controller
      applyStateToModel()
    }

    persistReportViewState()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    contentViewController?.view.frame = bounds
  }

  func setFamilyActivitySelection(_ prop: String?) {
    if let prop {
      state.familyActivitySelection = deserializeFamilyActivitySelection(
        familyActivitySelectionStr: prop
      )
    } else {
      state.familyActivitySelection = FamilyActivitySelection()
    }
    updateFromState()
  }

  func setContext(_ prop: String?) {
    state.context = sanitizeDeviceActivityReportContext(prop)
    updateFromState()
  }

  func setFrom(_ prop: Double?) {
    let (fromDate, toDate) = normalizedDeviceActivityReportDateRange(
      from: prop,
      to: state.to.timeIntervalSince1970
    )
    state.from = fromDate
    state.to = toDate
    updateFromState()
  }

  func setTo(_ prop: Double?) {
    let (fromDate, toDate) = normalizedDeviceActivityReportDateRange(
      from: state.from.timeIntervalSince1970,
      to: prop
    )
    state.from = fromDate
    state.to = toDate
    updateFromState()
  }

  func setSegmentation(_ prop: String?) {
    switch prop {
    case "hourly":
      state.segmentation = .hourly
    case "weekly":
      state.segmentation = .weekly
    default:
      state.segmentation = .daily
    }
    updateFromState()
  }

  func setDevices(_ prop: [Int]?) {
    state.devicesRawValues = prop
    updateFromState()
  }

  func setUsers(_ prop: String?) {
    state.usersRawValue = prop
    updateFromState()
  }

  private func updateFromState() {
    if #available(iOS 16.0, *) {
      applyStateToModel()
    }

    persistReportViewState()
  }

  @available(iOS 16.0, *)
  private func applyStateToModel() {
    guard let reportModel = reportModel as? DeviceActivityReportViewModel else {
      return
    }

    reportModel.familyActivitySelection = state.familyActivitySelection
    reportModel.context = state.context
    reportModel.from = state.from
    reportModel.to = state.to
    reportModel.segmentation = state.segmentation
    reportModel.devices = deviceActivityReportDevicesFromRawValues(state.devicesRawValues)

    switch state.usersRawValue {
    case "children":
      reportModel.users = .children
    case "all":
      reportModel.users = .all
    default:
      reportModel.users = nil
    }
  }

  func persistReportViewState() {
    let payload: [String: Any] = [
      "context": state.context,
      "from": state.from.timeIntervalSince1970,
      "to": state.to.timeIntervalSince1970,
      "segmentation": state.segmentation.rawValue,
      "generatedAt": Date().ISO8601Format()
    ]
    userDefaults?.set(payload, forKey: deviceActivityReportViewStateKey(context: state.context))
  }
}
