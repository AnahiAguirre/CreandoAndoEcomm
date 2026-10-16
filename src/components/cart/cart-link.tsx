'use client';

import Link from 'next/link';

import { CartIcon } from './cart-icon';
import { useCart } from './cart-provider';

/** The header's cart: the icon plus a badge with the number of units. */
export function CartLink({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <Link
      href="/carrito"
      aria-label={count > 0 ? `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}` : 'Carrito'}
      className={`relative inline-flex size-9 items-center justify-center ${className ?? ''}`}
    >
      <CartIcon className="size-[22px]" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-rojo px-1 text-[11px] font-bold leading-[18px] text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
