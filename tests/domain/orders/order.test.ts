import { describe, expect, it } from 'vitest';

import type { CartProduct } from '@/domain/cart/cart';
import {
  CartChangedError,
  computeOrderTotals,
  EmptyCartError,
  shippingInputSchema,
} from '@/domain/orders/order';
import { DEFAULT_PARCEL, parcelFor } from '@/domain/orders/parcel';

const toy: CartProduct = { id: 't1', slug: 'pista', name: 'Pista', kind: 'physical', priceCents: 1850000, stock: 3 };
const pdf: CartProduct = { id: 'd1', slug: 'cuaderno', name: 'Cuaderno', kind: 'digital', priceCents: 250000, stock: 0 };

describe('computeOrderTotals', () => {
  it('prices a digital-only order with no shipping, even if a shipping cost is passed', () => {
    const totals = computeOrderTotals([{ productId: 'd1', quantity: 1 }], [pdf], 500000);
    expect(totals.hasPhysical).toBe(false);
    expect(totals.shippingCents).toBe(0);
    expect(totals.totalCents).toBe(250000);
  });

  it('adds shipping when there is a physical item', () => {
    const totals = computeOrderTotals(
      [
        { productId: 't1', quantity: 2 },
        { productId: 'd1', quantity: 1 },
      ],
      [toy, pdf],
      500000,
    );
    expect(totals.hasPhysical).toBe(true);
    expect(totals.subtotalCents).toBe(2 * 1850000 + 250000);
    expect(totals.totalCents).toBe(totals.subtotalCents + 500000);
  });

  it('freezes name, kind and unit price on each item', () => {
    const [item] = computeOrderTotals([{ productId: 't1', quantity: 1 }], [toy], 0).items;
    expect(item).toEqual({ productId: 't1', name: 'Pista', kind: 'physical', unitPriceCents: 1850000, quantity: 1 });
  });

  it('refuses when the cart changed (more than the stock), instead of silently fixing it', () => {
    expect(() => computeOrderTotals([{ productId: 't1', quantity: 9 }], [toy], 0)).toThrow(CartChangedError);
  });

  it('refuses when a product vanished', () => {
    expect(() => computeOrderTotals([{ productId: 'gone', quantity: 1 }], [toy], 0)).toThrow(CartChangedError);
  });

  it('refuses an empty cart', () => {
    expect(() => computeOrderTotals([], [toy], 0)).toThrow(EmptyCartError);
  });
});

describe('shippingInputSchema', () => {
  const valid = { method: 'domicilio', recipient: 'Ana Pérez', phone: '11 5555-1234', postalCode: '1425', address: 'Av. Santa Fe 1234' };

  it('accepts a home delivery with address', () => {
    expect(shippingInputSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts the CPA format and normalizes it to upper case', () => {
    expect(shippingInputSchema.parse({ ...valid, postalCode: 'c1425abc' }).postalCode).toBe('C1425ABC');
  });

  it.each(['14', 'abcd', '14255', ''])('rejects postal code %s', (postalCode) => {
    expect(shippingInputSchema.safeParse({ ...valid, postalCode }).success).toBe(false);
  });

  it('requires the address for home delivery and a branch for pickup', () => {
    expect(shippingInputSchema.safeParse({ ...valid, address: undefined }).success).toBe(false);
    expect(shippingInputSchema.safeParse({ ...valid, method: 'sucursal', address: undefined }).success).toBe(false);
    expect(shippingInputSchema.safeParse({ ...valid, method: 'sucursal', address: undefined, agencyId: 'a1' }).success).toBe(true);
  });

  it('rejects a junk phone', () => {
    expect(shippingInputSchema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false);
  });
});

describe('parcelFor', () => {
  const noSize = { weightG: null, lengthCm: null, widthCm: null, heightCm: null };

  it('falls back to the default box when the admin has not loaded the size', () => {
    expect(parcelFor([{ product: noSize, quantity: 1 }])).toEqual(DEFAULT_PARCEL);
  });

  it('adds weights and stacks heights across units', () => {
    const box = { weightG: 500, lengthCm: 40, widthCm: 25, heightCm: 8 };
    const parcel = parcelFor([{ product: box, quantity: 2 }]);
    expect(parcel).toEqual({ weightG: 1000, lengthCm: 40, widthCm: 25, heightCm: 16 });
  });
});
