// Web implementation stub - native functionality not available on web
import { EventSubscription } from "expo-modules-core";

import {
  OverlayDetectedEvent,
  SplitScreenChangeEvent,
} from "./ProctoringModule.types";

// Mock implementation for web
export function isSplitScreenActive(): boolean {
  console.warn("Proctoring module is not supported on web");
  return false;
}

export function addOverlayListener(
  listener: (event: OverlayDetectedEvent) => void,
): EventSubscription {
  console.warn("Overlay detection is not supported on web");
  return { remove: () => {} } as EventSubscription;
}

export function addSplitScreenListener(
  listener: (event: SplitScreenChangeEvent) => void,
): EventSubscription {
  console.warn("Split screen detection is not supported on web");
  return { remove: () => {} } as EventSubscription;
}

export function removeAllListeners(): void {
  // No-op for web
}

export const NativeProctoringModule = {
  isSplitScreenActive: () => false,
  addListener: () => ({ remove: () => {} }) as EventSubscription,
  removeAllListeners: () => {},
  removeListeners: () => {},
};
