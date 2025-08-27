type DebouncedFunction<T extends unknown[]> = (id: string, ...args: T) => void;

/**
 * Creates a stateful debounce function that manages unique timers for different IDs.
 *
 * @param {Function} func The function to be debounced. The first argument should be the ID.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {DebouncedFunction<T>} The debounced function.
 */
export function createDebounceById<T extends unknown[]>(
  func: (id: string, ...args: T) => void,
  delay: number,
): DebouncedFunction<T> {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (id, ...args) => {
    // Clear any existing timer for this specific ID
    const existingTimeout = timeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a new timer for this ID
    const newTimeout = setTimeout(() => {
      func(id, ...args);
      // Clean up the timer state after execution
      timeouts.delete(id);
    }, delay);

    timeouts.set(id, newTimeout);
  };
}
