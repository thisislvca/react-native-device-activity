//
//  ScreenTimeActivityPicker.swift
//  ReactNativeDeviceActivity
//
//  Created by Robert Herber on 2023-07-05.
//

import ExpoModulesCore
import FamilyControls
import Foundation
import SwiftUI

@available(iOS 15.0, *)
class ScreenTimeSelectAppsModel: ObservableObject {
  @Published var activitySelection = FamilyActivitySelection()

  @Published public var footerText: String?

  @Published public var headerText: String?

  // just used with "controlled" picker
  @Published public var activitySelectionId: String?

  @Published public var includeEntireCategory: Bool?

  init() {}
}

@available(iOS 15.0, *)
struct ActivityPicker: View {
  @ObservedObject var model: ScreenTimeSelectAppsModel

  private var resolvedHeaderText: String? {
    let trimmed = model.headerText?.trimmingCharacters(in: .whitespacesAndNewlines)
    return (trimmed?.isEmpty == false) ? trimmed : nil
  }

  private var resolvedFooterText: String? {
    let trimmed = model.footerText?.trimmingCharacters(in: .whitespacesAndNewlines)
    return (trimmed?.isEmpty == false) ? trimmed : nil
  }

  var body: some View {
    if #available(iOS 16.0, *), resolvedHeaderText != nil || resolvedFooterText != nil {
      FamilyActivityPicker(
        headerText: resolvedHeaderText,
        footerText: resolvedFooterText,
        selection: $model.activitySelection
      )
      .background(Color.clear)
    } else {
      FamilyActivityPicker(
        selection: $model.activitySelection
      )
      .background(Color.clear)
    }
  }
}
