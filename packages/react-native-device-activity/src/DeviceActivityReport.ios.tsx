import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";
import { View } from "react-native";

import { DeviceActivityReportViewProps } from "./ReactNativeDeviceActivity.types";

let didWarnUnsupported = false;

const NativeView: React.ComponentType<DeviceActivityReportViewProps> | null =
  (() => {
    try {
      return requireNativeViewManager("DeviceActivityReportView");
    } catch {
      return null;
    }
  })();

export default function DeviceActivityReportView({
  style,
  children,
  ...props
}: DeviceActivityReportViewProps) {
  if (!NativeView) {
    if (__DEV__ && !didWarnUnsupported) {
      didWarnUnsupported = true;
      console.warn(
        "[react-native-device-activity] DeviceActivityReportView requires iOS 16+ and a report extension target.",
      );
    }
    return <View style={style}>{children}</View>;
  }

  return (
    <NativeView style={style} {...props}>
      {children}
    </NativeView>
  );
}
