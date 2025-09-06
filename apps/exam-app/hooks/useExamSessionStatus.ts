import { useAppVisibility } from "./useAppVisibility";
// import { useProctoring } from "./useProctoring";

type SessionStatus = {
  isSecure: boolean;
  reason: "SECURE" | "BACKGROUND" | "MULTI_WINDOW";
};

export function useExamSessionStatus(): SessionStatus {
  const { isVisible } = useAppVisibility();
  // const { isInMultiWindow } = useProctoring();

  if (!isVisible) {
    return { isSecure: false, reason: "BACKGROUND" };
  }

  // if (isInMultiWindow) {
  //   return { isSecure: false, reason: "MULTI_WINDOW" };
  // }

  return { isSecure: true, reason: "SECURE" };
}
