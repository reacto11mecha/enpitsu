import { useEffect, useState } from "react";
import {
  addOverlayListener,
  addSplitScreenListener,
  isSplitScreenActive,
} from "proctoring-module";

export function useProctoring() {
  const [isSplitScreen, setSplitScreen] = useState(isSplitScreenActive());
  const [hasOverlay, setHasOverlay] = useState(false);

  useEffect(() => {
    const splitScreenSubscription = addSplitScreenListener((event) => {
      setSplitScreen(event.isActive);
    });

    const overlaySubscription = addOverlayListener((event) => {
      console.log(event);
      setHasOverlay(event.isActive);
    });

    return () => {
      splitScreenSubscription.remove();
      overlaySubscription.remove();
    };
  }, []);

  return { isSplitScreen, hasOverlay };
}
