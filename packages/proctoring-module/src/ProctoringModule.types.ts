export type OverlayDetectedEvent = {
  isActive: boolean;
};

export type SplitScreenChangeEvent = {
  isActive: boolean;
};

export type ProctoringModuleEvents = {
  onOverlayDetected: (event: OverlayDetectedEvent) => void;
  onSplitScreenChange: (event: SplitScreenChangeEvent) => void;
};
