import * as React from "react";

import { DetectScreenSleepingViewProps } from "./DetectScreenSleeping.types";

export default function DetectScreenSleepingView(
  props: DetectScreenSleepingViewProps,
) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
