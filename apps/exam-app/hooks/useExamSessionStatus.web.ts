import { useAppVisibility } from "./useAppVisibility";

type SessionStatus = {
  isSecure: boolean;
  reason: "SECURE" | "BACKGROUND";
};

export function useExamSessionStatus(): SessionStatus {
  const { isVisible } = useAppVisibility();

  if (!isVisible) {
    return { isSecure: false, reason: "BACKGROUND" };
  }

  return { isSecure: true, reason: "SECURE" };
}
