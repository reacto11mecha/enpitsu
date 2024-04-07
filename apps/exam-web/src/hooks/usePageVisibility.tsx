import { useEffect, useState } from "react";

export const usePageVisibility = () => {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
      callback: T,
      delay: number,
    ) {
      let timer: ReturnType<typeof setTimeout>;
      return (...args: Parameters<T>) => {
        const p = new Promise<ReturnType<T> | Error>((resolve, reject) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            try {
              let output = callback(...args);
              resolve(output);
            } catch (err) {
              if (err instanceof Error) {
                reject(err);
              }
              reject(new Error(`An error has occurred:${err}`));
            }
          }, delay);
        });
        return p;
      };
    }

    const updater = debounce(
      (current: boolean) => setIsPageVisible(current),
      450,
    );

    const cbBlur = () => updater(false);
    const cbFocus = () => updater(true);

    window.addEventListener("blur", cbBlur);
    window.addEventListener("focus", cbFocus);

    return () => {
      window.removeEventListener("blur", cbBlur);
      window.removeEventListener("focus", cbFocus);
    };
  }, []);

  return { isPageVisible };
};
