import * as React from "react";
import { View } from "react-native";

import type { DeviceActivitySelectionSheetViewProps } from "./ReactNativeDeviceActivity.types";

export default function DeviceActivitySelectionSheetView({
  style,
  children,
}: DeviceActivitySelectionSheetViewProps) {
  return React.createElement(View, { style }, children);
}
