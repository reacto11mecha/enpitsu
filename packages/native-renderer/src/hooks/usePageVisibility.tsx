import { useEffect, useState } from "react";

export const usePageVisibility = () => {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const commonCB = () => setIsPageVisible(document.hasFocus());

    window.addEventListener("blur", commonCB);
    window.addEventListener("focus", commonCB);

    return () => {
      window.removeEventListener("blur", commonCB);
      window.removeEventListener("focus", commonCB);
    };
  }, []);

  return { isPageVisible };
};
