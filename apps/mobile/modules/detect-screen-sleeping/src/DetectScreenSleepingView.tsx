import * as React from "react";
import { requireNativeViewManager } from "expo-modules-core";

import { DetectScreenSleepingViewProps } from "./DetectScreenSleeping.types";

const NativeView: React.ComponentType<DetectScreenSleepingViewProps> =
  requireNativeViewManager("DetectScreenSleeping");

export default function DetectScreenSleepingView(
  props: DetectScreenSleepingViewProps,
) {
  return <NativeView {...props} />;
}
