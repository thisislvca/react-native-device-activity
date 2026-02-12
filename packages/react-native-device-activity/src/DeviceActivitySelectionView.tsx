import * as React from "react";
import { View } from "react-native";

import type { DeviceActivitySelectionViewProps } from "./ReactNativeDeviceActivity.types";

export default function DeviceActivitySelectionView({
  style,
  children,
  ...props
}: DeviceActivitySelectionViewProps) {
  return React.createElement(View, { style }, children);
}
