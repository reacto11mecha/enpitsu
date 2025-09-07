import { useAppVisibility } from "./useAppVisibility";
import { useProctoring } from "./useProctoring";

export interface SessionStatus {
  isSecure: boolean;
  reason: "SECURE" | "BACKGROUND" | "OVERLAY" | "SPLIT_SCREEN";
}

export function useExamSessionStatus(): SessionStatus {
  const { isVisible } = useAppVisibility();
  const { isSplitScreen, hasOverlay } = useProctoring();

  if (!isVisible) {
    return { isSecure: false, reason: "BACKGROUND" };
  }

  if (hasOverlay) {
    return { isSecure: false, reason: "OVERLAY" };
  }

  if (isSplitScreen) {
    return { isSecure: false, reason: "SPLIT_SCREEN" };
  }

  return { isSecure: true, reason: "SECURE" };
}
