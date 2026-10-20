import type { Metadata } from 'next';

import { CartView } from './cart-view';

export const metadata: Metadata = { title: 'Carrito' };

/** The cart lives in the browser; this page only draws it (see cart-view.tsx). */
export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">Tu carrito</h1>
      <CartView />
    </section>
  );
}
