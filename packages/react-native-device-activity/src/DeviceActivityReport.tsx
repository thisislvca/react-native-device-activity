import * as React from "react";
import { View } from "react-native";

import { DeviceActivityReportViewProps } from "./ReactNativeDeviceActivity.types";

export default function DeviceActivityReportView({
  style,
  children,
}: DeviceActivityReportViewProps) {
  return <View style={style}>{children}</View>;
}
