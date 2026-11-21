import type { Cents } from '@/domain/shared/money';

import type { ShippingQuote } from './ports';

/**
 * Shipping by Correo is free from this amount of products ($70.000). It is
 * measured on the cart's subtotal before any coupon, so the buyer sees the same
 * answer in the cart and at the checkout.
 */
export const FREE_SHIPPING_MIN_CENTS: Cents = 7_000_000;

export const FREE_SHIPPING_LABEL = 'Envío gratis por Correo Argentino';

export function qualifiesForFreeShipping(subtotalCents: Cents): boolean {
  return subtotalCents >= FREE_SHIPPING_MIN_CENTS;
}

/** How much more the buyer has to add to get free shipping (0 when they already have it). */
export function missingForFreeShipping(subtotalCents: Cents): Cents {
  return Math.max(0, FREE_SHIPPING_MIN_CENTS - subtotalCents);
}

/** The carrier's quote, made free when the cart reaches the minimum. */
export function applyFreeShipping(quote: ShippingQuote, subtotalCents: Cents): ShippingQuote & { free: boolean } {
  if (!qualifiesForFreeShipping(subtotalCents)) return { ...quote, free: false };
  return { ...quote, priceCents: 0, label: FREE_SHIPPING_LABEL, free: true };
}
