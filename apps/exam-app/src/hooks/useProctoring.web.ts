// NO-OP
export function useProctoring(shouldPollStatus?: boolean) {
  return {
    isSplitScreen: false,
    hasOverlay: false,
    isLocked: true,
  };
}
