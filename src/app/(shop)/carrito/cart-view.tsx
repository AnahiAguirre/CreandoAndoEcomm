'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { useCart } from '@/components/cart/cart-provider';
import { getSnapshot } from '@/components/cart/cart-store';
import type { CartProductPublic } from '@/components/cart/types';
import { linesOf, maxQuantity, reconcileCart } from '@/domain/cart/cart';
import { isDigital } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';

import { loadCartProducts } from './actions';

/** False while rendering on the server and during hydration; true afterwards. */
const subscribeNever = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

const stepper =
  'flex size-9 items-center justify-center rounded-full border border-borde-suave text-lg leading-none transition-colors hover:bg-arena disabled:pointer-events-none disabled:opacity-40';

export function CartView() {
  const { lines, setQuantity, remove, replace } = useCart();
  const hydrated = useHydrated();
  const [loaded, setLoaded] = useState<{ key: string; products: CartProductPublic[] } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [notices, setNotices] = useState<string[]>([]);

  // Which products the saved cart refers to; reload only when that set changes.
  const idsKey = [...new Set(lines.map((l) => l.productId))].sort().join(',');

  useEffect(() => {
    if (!hydrated || !idsKey) return;
    let cancelled = false;
    loadCartProducts(idsKey.split(','))
      .then((list) => {
        if (cancelled) return;
        setLoaded({ key: idsKey, products: list });
        // Prices, stock and availability always come from the server: fix what
        // the browser remembered and say so.
        const fixed = reconcileCart(getSnapshot(), list);
        if (fixed.adjustments.length > 0) {
          setNotices(fixed.adjustments.map((a) => a.message));
          replace(linesOf(fixed));
        }
      })
      .catch(() => {
        if (!cancelled) setFailedKey(idsKey);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, idsKey, replace]);

  if (failedKey === idsKey && idsKey) {
    return (
      <p className="mt-10 rounded-3xl border border-borde-suave bg-white p-10 text-center text-tinta-medio">
        No pudimos cargar tu carrito. Revisá tu conexión y recargá la página.
      </p>
    );
  }

  // An empty cart needs nothing from the server; otherwise wait for these exact products.
  const products = idsKey === '' ? [] : loaded?.key === idsKey ? loaded.products : null;
  if (!hydrated || products === null) {
    return <div className="mt-10 h-40 animate-pulse rounded-3xl bg-arena" aria-hidden="true" />;
  }

  const summary = reconcileCart(lines, products);

  if (summary.items.length === 0) {
    return (
      <>
        <Notices notices={notices} />
        <div className="mt-10 rounded-3xl border border-dashed border-borde-suave bg-white p-10 text-center">
          <p className="font-semibold">Tu carrito está vacío.</p>
          <p className="mt-1 text-sm text-tinta-medio">Elegí algo del catálogo y aparece acá.</p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
          >
            Ver catálogo
          </Link>
        </div>
      </>
    );
  }

  const hasPhysical = summary.items.some((i) => !isDigital(i.product));
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <>
      <Notices notices={notices} />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <ul className="flex flex-col gap-4">
          {summary.items.map(({ product, quantity, lineTotalCents }) => {
            const digital = isDigital(product);
            const imageUrl = byId.get(product.id)?.imageUrl;
            return (
              <li
                key={product.id}
                className="flex gap-4 rounded-3xl border border-borde-suave bg-white p-4 sm:p-5"
              >
                <Link
                  href={`/producto/${product.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-arena sm:size-28"
                >
                  {imageUrl && <Image src={imageUrl} alt={product.name} fill sizes="112px" className="object-cover" />}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-tinta-soft">
                        {digital ? 'Imprimible PDF' : 'Juguete de madera'}
                      </span>
                      <h2 className="font-semibold leading-snug">
                        <Link href={`/producto/${product.slug}`} className="text-tinta hover:underline">
                          {product.name}
                        </Link>
                      </h2>
                      <p className="text-sm text-tinta-medio">{formatPrice(product.priceCents)}</p>
                    </div>
                    <p className="shrink-0 font-bold">{formatPrice(lineTotalCents)}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    {digital ? (
                      <span className="text-sm text-tinta-medio">1 unidad · te llega por mail y en Mis descargas</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={stepper}
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(product, quantity - 1)}
                          aria-label={`Una unidad menos de ${product.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center font-semibold" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className={stepper}
                          disabled={quantity >= maxQuantity(product)}
                          onClick={() => setQuantity(product, quantity + 1)}
                          aria-label={`Una unidad más de ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="text-sm text-tinta-medio underline-offset-4 transition-colors hover:text-rojo hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-3xl border border-borde-suave bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-tinta-medio">
                Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'producto' : 'productos'})
              </dt>
              <dd className="font-semibold">{formatPrice(summary.subtotalCents)}</dd>
            </div>
            {hasPhysical && (
              <div className="flex justify-between">
                <dt className="text-tinta-medio">Envío</dt>
                <dd className="text-tinta-medio">Se calcula al finalizar</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 flex justify-between border-t border-borde-suave pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(summary.subtotalCents)}</span>
          </p>
          <button
            type="button"
            disabled
            className="mt-6 h-12 w-full rounded-full bg-rojo px-7 font-medium text-white opacity-40"
          >
            Finalizar compra
          </button>
          <p className="mt-3 text-center text-xs text-tinta-medio">
            Muy pronto vas a poder pagar con Mercado Pago.
          </p>
        </aside>
      </div>
    </>
  );
}

function Notices({ notices }: { notices: string[] }) {
  if (notices.length === 0) return null;
  return (
    <ul role="status" className="mt-8 flex flex-col gap-2 rounded-2xl bg-amarillo-soft p-4 text-sm text-tinta">
      {notices.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
