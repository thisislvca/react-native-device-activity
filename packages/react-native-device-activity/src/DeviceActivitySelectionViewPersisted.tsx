import * as React from "react";
import { View } from "react-native";

import type { DeviceActivitySelectionViewPersistedProps } from "./ReactNativeDeviceActivity.types";

export default function DeviceActivitySelectionViewPersisted({
  style,
  children,
  ...props
}: DeviceActivitySelectionViewPersistedProps) {
  return React.createElement(View, { style }, children);
}
