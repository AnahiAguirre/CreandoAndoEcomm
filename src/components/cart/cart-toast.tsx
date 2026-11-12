'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/** Fired by the "Agregar al carrito" buttons when a product goes in. */
export const CART_ADDED_EVENT = 'cart:added';

export interface CartAddedDetail {
  name: string;
}

const VISIBLE_MS = 5000;

/**
 * The confirmation after adding to the cart: says what went in and offers the
 * two next steps. Sits left of the WhatsApp button so they never overlap.
 */
export function CartToast() {
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onAdded(e: Event) {
      setAdded((e as CustomEvent<CartAddedDetail>).detail.name);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(null), VISIBLE_MS);
    }
    window.addEventListener(CART_ADDED_EVENT, onAdded);
    return () => {
      window.removeEventListener(CART_ADDED_EVENT, onAdded);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!added) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-24 z-40 flex flex-col gap-3 rounded-2xl border border-borde-suave bg-white p-4 shadow-[0_20px_50px_-20px_rgb(26_23_20/0.5)] md:bottom-6 md:left-auto md:right-24 md:w-[22rem]"
    >
      <p className="text-sm text-tinta">
        Agregaste <strong>{added}</strong> al carrito.
      </p>
      <div className="flex gap-2">
        <Link
          href="/carrito"
          onClick={() => setAdded(null)}
          className="flex h-10 flex-1 items-center justify-center rounded-full bg-azul px-3 text-[13px] font-semibold text-white transition-colors hover:bg-azul-dark hover:text-white"
        >
          Ver carrito
        </Link>
        <button
          type="button"
          onClick={() => setAdded(null)}
          className="flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-azul px-3 text-[13px] font-semibold text-azul transition-colors hover:bg-ghost-fondo"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  );
}
