import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  addOverlayListener,
  addSplitScreenListener,
  isLocked as checkIsLocked,
  isSplitScreenActive,
} from "proctoring-module";

export function useProctoring(shouldPollStatus: boolean = false) {
  const [isSplitScreen, setSplitScreen] = useState(isSplitScreenActive());
  const [hasOverlay, setHasOverlay] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const checkSecurityStatus = useCallback(() => {
    setIsLocked(checkIsLocked());
    setSplitScreen(isSplitScreenActive());
  }, []);

  useEffect(() => {
    const splitScreenSubscription = addSplitScreenListener((event) => {
      setSplitScreen(event.isActive);
    });

    const overlaySubscription = addOverlayListener((event) => {
      console.log(event);
      setHasOverlay(event.isActive);
    });

    // 2. Interval polling untuk mengecek Lock Task (karena Android tidak mengirim event saat pin dilepas)
    let interval: number;
    if (shouldPollStatus) {
      // Tunggu sebentar sebelum cek pertama (memberi waktu OS untuk mengunci layar)
      setTimeout(checkSecurityStatus, 1000);

      interval = setInterval(() => {
        checkSecurityStatus();
      }, 2000); // Cek setiap 2 detik
    }

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active" && shouldPollStatus) {
        checkSecurityStatus();
      }
    });

    return () => {
      splitScreenSubscription.remove();
      overlaySubscription.remove();
      if (interval) clearInterval(interval);
      appStateSub.remove();
    };
  }, [shouldPollStatus, checkSecurityStatus]);

  return { isSplitScreen, hasOverlay, isLocked };
}
