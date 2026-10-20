'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { isInStock } from '@/domain/catalog/product';

import { CartIcon } from './cart-icon';
import { useCart } from './cart-provider';
import type { CartProductPublic } from './types';

interface Props {
  /** The real catalog product behind this button. Absent = it isn't in the catalog yet. */
  product: CartProductPublic | undefined;
  /** The look: each place on the site has its own button shape, so it brings its classes. */
  className: string;
  iconClassName?: string;
}

const FLASH_MS = 1600;

/**
 * "Agregar al carrito". Honest about what it can do: it adds the product when
 * it can, says "Sin stock" when there is none, and sends to the catalog when
 * the product isn't there at all (the home shows a few that aren't loaded yet).
 */
export function AddToCartButton({ product, className, iconClassName }: Props) {
  const { add, lines } = useCart();
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!product) {
    return (
      <Link href="/catalogo" className={className}>
        Ver catálogo
      </Link>
    );
  }

  if (!isInStock(product)) {
    return (
      <button type="button" disabled className={`${className} pointer-events-none opacity-40`}>
        Sin stock
      </button>
    );
  }

  // A printable is bought once: once it's in the cart there is nothing left to add.
  const inCart = product.kind === 'digital' && lines.some((l) => l.productId === product.id);

  function onClick() {
    if (!product) return;
    add(product);
    setFlash(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(false), FLASH_MS);
  }

  if (inCart && !flash) {
    return (
      <Link href="/carrito" className={className}>
        Ya está en tu carrito · Ver
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-live="polite">
      {flash ? (
        'Agregado ✓'
      ) : (
        <>
          <CartIcon className={iconClassName} /> Agregar al carrito
        </>
      )}
    </button>
  );
}
