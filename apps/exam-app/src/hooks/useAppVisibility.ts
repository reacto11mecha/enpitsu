import type { AppStateStatus } from "react-native";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useAppVisibility() {
  const [isVisible, setIsVisible] = useState(
    AppState.currentState === "active",
  );

  useEffect(() => {
    const handleChange = (nextAppState: AppStateStatus) => {
      setIsVisible(nextAppState === "active");
    };

    const subscription = AppState.addEventListener("change", handleChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return { isVisible };
}
