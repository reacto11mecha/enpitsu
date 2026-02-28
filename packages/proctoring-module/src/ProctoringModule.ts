import { NativeModule, requireNativeModule } from "expo-modules-core";

import { ProctoringModuleEvents } from "./ProctoringModule.types";

// Declare the native module interface
declare class NativeProctoringModule extends NativeModule<ProctoringModuleEvents> {
  // Synchronous function to check split screen status
  isSplitScreenActive: () => boolean;
  isOverlayActive: () => boolean;

  // Lock Task functions
  isLocked: () => boolean;
  startLockTask: () => void;
  stopLockTask: () => void;
}

// Export the native module instance
export default requireNativeModule<NativeProctoringModule>("ProctoringModule");
