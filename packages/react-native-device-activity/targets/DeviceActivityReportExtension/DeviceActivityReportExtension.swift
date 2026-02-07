import DeviceActivity
import SwiftUI

@main
struct DeviceActivityReportExtensionEntry: DeviceActivityReportExtension {
  var body: some DeviceActivityReportScene {
    TotalActivityReport { totalActivityConfiguration in
      TotalActivityView(configuration: totalActivityConfiguration)
    }
  }
}
