import { EventSubscription } from "expo-modules-core";

export default {
  isSplitScreenActive: (): boolean => {
    console.warn(
      "[ProctoringModule] isSplitScreenActive is not supported on web",
    );
    return false;
  },
  isOverlayActive: (): boolean => {
    console.warn("[ProctoringModule] isOverlayActive is not supported on web");
    return false;
  },
  isLocked: (): boolean => {
    console.warn("[ProctoringModule] isLocked is not supported on web");
    return true;
  },
  startLockTask: (): void => {
    console.warn("[ProctoringModule] startLockTask is not supported on web");
  },
  stopLockTask: (): void => {
    console.warn("[ProctoringModule] stopLockTask is not supported on web");
  },
  getBlacklistedApps: (): string[] => [],
  uninstallApp: (packageName: string): void => {
    console.warn("[ProctoringModule] uninstallApp is not supported on web");
  },
  addListener: (): EventSubscription => {
    return { remove: () => {} } as EventSubscription;
  },
  removeAllListeners: (): void => {},
  removeListeners: (): void => {},
};
