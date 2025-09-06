// // // Reexport the native module. On web, it will be resolved to ProctoringModule.web.ts
// // // and on native platforms to ProctoringModule.ts
// // export { default } from "./ProctoringModule";
// // export * from "./ProctoringModule.types";

// // proctoring-module/src/index.ts

// import { NativeEventEmitter } from "react-native";

// import ProctoringModule from "./ProctoringModule";
// import { MultiWindowModeChangeEvent } from "./ProctoringModule.types";

// /**
//  * Asynchronously checks if the app is currently in multi-window mode.
//  * This is a one-time check.
//  * @returns {Promise<boolean>} A promise that resolves with the current state.
//  */
// export function isInMultiWindowMode(): Promise<boolean> {
//   return ProctoringModule.isInMultiWindowMode();
// }

// // We only need one emitter instance for the entire module.
// const emitter = new NativeEventEmitter(ProctoringModule);

// /**
//  * Adds a listener that will be called whenever the multi-window mode changes.
//  *
//  * @param listener The function to call with the event data.
//  * @returns A subscription object with a `remove` method to clean up the listener.
//  */
// export function addMultiWindowModeListener(
//   listener: (event: MultiWindowModeChangeEvent) => void,
// ) {
//   const subscription = emitter.addListener("onMultiWindowModeChange", listener);
//   return subscription;
// }

// // You can also export the raw module if you ever need direct access,
// // but it's generally better to use the wrapper functions above.
// export { ProctoringModule };

// packages/proctoring-module/src/index.ts

import { useEffect, useState } from "react";
import { EventEmitter, Subscription } from "expo-modules-core";

import ProctoringModule from "./ProctoringModule";
import { ProctoringStateChangeEvent } from "./ProctoringModule.types";

export type ProctoringState = {
  isSplitScreenActive: boolean;
  isOverlayDetected: boolean;
};

// Create the emitter to listen for events from the native module
const emitter = new EventEmitter(ProctoringModule);

export function useProctoring(): ProctoringState {
  const [proctoringState, setProctoringState] = useState<ProctoringState>({
    isSplitScreenActive: false,
    isOverlayDetected: false,
  });

  useEffect(() => {
    // An array to hold our subscriptions for easy cleanup.
    const subscriptions: Subscription[] = [];

    // Get the initial state for split-screen.
    ProctoringModule.isSplitScreenActive().then(
      (initialSplitScreenState: boolean) => {
        setProctoringState((prevState) => ({
          ...prevState,
          isSplitScreenActive: initialSplitScreenState,
        }));
      },
    );

    // Subscribe to the split-screen change event.
    subscriptions.push(
      emitter.addListener<ProctoringStateChangeEvent>(
        "onSplitScreenChange",
        (event) => {
          setProctoringState((prevState) => ({
            ...prevState,
            isSplitScreenActive: event.isActive,
          }));
        },
      ),
    );

    // Subscribe to the overlay detected event.
    subscriptions.push(
      emitter.addListener<ProctoringStateChangeEvent>(
        "onOverlayDetected",
        (event) => {
          setProctoringState((prevState) => ({
            ...prevState,
            isOverlayDetected: event.isActive,
          }));
        },
      ),
    );

    // The cleanup function returned by useEffect is critical.
    // It runs when the component that uses this hook unmounts.
    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return proctoringState;
}
