import { useEffect, useRef } from "react";

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: never) => void;

export function useDebounce<Func extends SomeFunction>(
  func: Func,
  delay = 950,
) {
  const timer = useRef<Timer>(null!);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Func;

  return debouncedFunction;
}
