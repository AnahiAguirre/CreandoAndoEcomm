'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCart } from './cart-provider';
import type { CartProductPublic } from './types';

interface Props {
  product: CartProductPublic;
  className: string;
}

/**
 * "Comprar ahora": puts the product in the cart (once: a second click doesn't
 * add another) and goes straight to the cart to pay.
 */
export function BuyNowButton({ product, className }: Props) {
  const { add, lines } = useCart();
  const router = useRouter();
  const [going, setGoing] = useState(false);

  function onClick() {
    if (!lines.some((l) => l.productId === product.id)) add(product);
    setGoing(true);
    router.push('/carrito');
  }

  return (
    <button type="button" onClick={onClick} disabled={going} className={className}>
      {going ? 'Yendo al carrito…' : 'Comprar ahora'} <span aria-hidden="true">&nbsp;›</span>
    </button>
  );
}
