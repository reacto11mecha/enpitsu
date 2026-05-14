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
 * Checks if the device is currently has a floating window app
 * @returns boolean indicating if there's a floating window
 */
export function isOverlayActive(): boolean {
  return NativeProctoringModule.isOverlayActive();
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
 * Checks if the device is currently in Lock Task (Screen Pinning) mode
 * @returns boolean indicating if locked
 */
export function isLocked(): boolean {
  return NativeProctoringModule.isLocked();
}

/**
 * Starts the Lock Task (Screen Pinning) mode
 */
export function startLockTask(): void {
  NativeProctoringModule.startLockTask();
}

/**
 * Stops the Lock Task (Screen Pinning) mode
 */
export function stopLockTask(): void {
  NativeProctoringModule.stopLockTask();
}

/**
 * Check if there are blacklisted apps installed
 * @returns List of blacklisted apps
 */
export function getBlacklistedApps(): string[] {
  return NativeProctoringModule.getBlacklistedApps();
}

/**
 * Prompt user to uninstall blacklisted app
 * @param packageName android package name that need to be uninstall
 */
export function uninstallApp(packageName: string): void {
  NativeProctoringModule.uninstallApp(packageName);
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
