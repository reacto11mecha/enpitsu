// src/hooks/useProctoring.ts
import { useEffect, useState } from "react";
import {
  addMultiWindowModeListener,
  isInMultiWindowMode,
} from "proctoring-module";

export function useProctoring() {
  const [isInMultiWindow, setIsInMultiWindow] = useState(false);

  useEffect(() => {
    isInMultiWindowMode().then(setIsInMultiWindow);

    const subscription = addMultiWindowModeListener((event) => {
      setIsInMultiWindow(event.isInMultiWindowMode);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { isInMultiWindow };
}
