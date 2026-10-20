'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import {
  addLine,
  cartCount,
  removeLine,
  setQuantity as setLineQuantity,
  type CartLine,
  type CartProduct,
} from '@/domain/cart/cart';

import { getServerSnapshot, getSnapshot, subscribe, writeCart } from './cart-store';

interface CartApi {
  lines: CartLine[];
  /** Units in the cart (the badge in the header). 0 on the server and before hydration. */
  count: number;
  add: (product: CartProduct) => void;
  setQuantity: (product: CartProduct, quantity: number) => void;
  remove: (productId: string) => void;
  /** Replaces the lines, e.g. with the ones that survived `reconcileCart`. */
  replace: (lines: CartLine[]) => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Always act on the freshest saved lines, not on the render's copy: two quick
  // clicks (or two tabs) must not overwrite each other.
  const add = useCallback((product: CartProduct) => writeCart(addLine(getSnapshot(), product)), []);
  const setQuantity = useCallback(
    (product: CartProduct, quantity: number) => writeCart(setLineQuantity(getSnapshot(), product, quantity)),
    [],
  );
  const remove = useCallback((productId: string) => writeCart(removeLine(getSnapshot(), productId)), []);
  const replace = useCallback((next: CartLine[]) => writeCart(next), []);

  const value = useMemo<CartApi>(
    () => ({ lines, count: cartCount(lines), add, setQuantity, remove, replace }),
    [lines, add, setQuantity, remove, replace],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
