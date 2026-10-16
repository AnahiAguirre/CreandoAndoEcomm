import type { CartLine } from '@/domain/cart/cart';

/**
 * The cart lives in the browser, in localStorage, as ids + quantities only
 * (see src/domain/cart/cart.ts for why nothing else is kept). Every access is
 * wrapped: storage can be blocked, full, or hold garbage from an older version.
 */
const KEY = 'creandoando:cart:v1';

const EMPTY: CartLine[] = [];
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    const lines: CartLine[] = [];
    for (const item of data) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as CartLine).productId === 'string' &&
        Number.isInteger((item as CartLine).quantity) &&
        (item as CartLine).quantity > 0
      ) {
        lines.push({ productId: (item as CartLine).productId, quantity: (item as CartLine).quantity });
      }
    }
    return lines.length > 0 ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Stable reference between changes, as `useSyncExternalStore` requires. */
export function getSnapshot(): CartLine[] {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, lines: parse(raw) };
  return cache.lines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function writeCart(lines: CartLine[]): void {
  try {
    if (lines.length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Blocked or full: keep it for this tab only.
    cache = { raw: null, lines };
  }
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed the cart.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
