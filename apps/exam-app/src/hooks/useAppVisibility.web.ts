import { useEffect, useState } from "react";

export function useAppVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updater = (current: boolean) => setIsVisible(current);

    const cbBlur = () => void updater(false);
    const cbFocus = () => void updater(true);

    window.addEventListener("blur", cbBlur);
    window.addEventListener("focus", cbFocus);

    return () => {
      window.removeEventListener("blur", cbBlur);
      window.removeEventListener("focus", cbFocus);
    };
  }, []);

  return { isVisible };
}
