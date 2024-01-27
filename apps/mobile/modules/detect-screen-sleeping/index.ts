import {
  EventEmitter,
  NativeModulesProxy,
  Subscription,
} from "expo-modules-core";

import {
  ChangeEventPayload,
  DetectScreenSleepingViewProps,
} from "./src/DetectScreenSleeping.types";
// Import the native module. On web, it will be resolved to DetectScreenSleeping.web.ts
// and on native platforms to DetectScreenSleeping.ts
import DetectScreenSleepingModule from "./src/DetectScreenSleepingModule";
import DetectScreenSleepingView from "./src/DetectScreenSleepingView";

// Get the native constant value.
export const PI = DetectScreenSleepingModule.PI;

export function hello(): string {
  return DetectScreenSleepingModule.hello();
}

export async function setValueAsync(value: string) {
  return await DetectScreenSleepingModule.setValueAsync(value);
}

const emitter = new EventEmitter(
  DetectScreenSleepingModule ?? NativeModulesProxy.DetectScreenSleeping,
);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export {
  DetectScreenSleepingView,
  DetectScreenSleepingViewProps,
  ChangeEventPayload,
};
