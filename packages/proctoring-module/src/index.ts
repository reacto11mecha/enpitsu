import { EventSubscription } from "expo-modules-core";

import NativeProctoringModule from "./ProctoringModule";
import {
  OverlayDetectedEvent,
  SplitScreenChangeEvent,
} from "./ProctoringModule.types";

/**
 * Checks if the device is currently in split screen/multi-window mode
 * @returns boolean indicating if split screen is active
 */
export function isSplitScreenActive(): boolean {
  return NativeProctoringModule.isSplitScreenActive();
}

/**
 * Adds a listener for overlay detection events
 * @param listener Callback function that receives overlay detection events
 * @returns EventSubscription that can be used to remove the listener
 */
export function addOverlayListener(
  listener: (event: OverlayDetectedEvent) => void,
): EventSubscription {
  return NativeProctoringModule.addListener("onOverlayDetected", listener);
}

/**
 * Adds a listener for split screen change events
 * @param listener Callback function that receives split screen change events
 * @returns EventSubscription that can be used to remove the listener
 */
export function addSplitScreenListener(
  listener: (event: SplitScreenChangeEvent) => void,
): EventSubscription {
  return NativeProctoringModule.addListener("onSplitScreenChange", listener);
}

/**
 * Removes all listeners for a specific event
 * @param eventName The name of the event to remove all listeners for
 */
export function removeAllListeners(
  eventName: "onOverlayDetected" | "onSplitScreenChange",
): void {
  NativeProctoringModule.removeAllListeners(eventName);
}

/**
 * Removes all listeners for both events
 */
export function removeAllProctoringListeners(): void {
  NativeProctoringModule.removeAllListeners("onOverlayDetected");
  NativeProctoringModule.removeAllListeners("onSplitScreenChange");
}

// Export the native module for advanced usage
export { NativeProctoringModule };
