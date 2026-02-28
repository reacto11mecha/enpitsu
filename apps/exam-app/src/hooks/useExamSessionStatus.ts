import { useAppVisibility } from "./useAppVisibility";
import { useProctoring } from "./useProctoring";

export interface SessionStatus {
  isSecure: boolean;
  reason: "SECURE" | "BACKGROUND" | "OVERLAY" | "SPLIT_SCREEN" | "UNLOCKED";
}

export function useExamSessionStatus(
  isExamActive: boolean = false,
): SessionStatus {
  const { isVisible } = useAppVisibility();

  const { isSplitScreen, hasOverlay, isLocked } = useProctoring(isExamActive);

  if (!isVisible) {
    return { isSecure: false, reason: "BACKGROUND" };
  }

  if (hasOverlay) {
    return { isSecure: false, reason: "OVERLAY" };
  }

  if (isSplitScreen) {
    return { isSecure: false, reason: "SPLIT_SCREEN" };
  }

  if (isExamActive && !isLocked) {
    return { isSecure: false, reason: "UNLOCKED" };
  }

  return { isSecure: true, reason: "SECURE" };
}
