import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => {};

/** False while rendering on the server and during hydration; true afterwards (the cart lives in the browser). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
