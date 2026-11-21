import { describe, expect, it } from 'vitest';

import {
  applyFreeShipping,
  FREE_SHIPPING_LABEL,
  FREE_SHIPPING_MIN_CENTS,
  missingForFreeShipping,
  qualifiesForFreeShipping,
} from '@/domain/orders/free-shipping';

describe('free shipping', () => {
  it('starts at $70.000 of products, that amount included', () => {
    expect(FREE_SHIPPING_MIN_CENTS).toBe(7000000);
    expect(qualifiesForFreeShipping(6999999)).toBe(false);
    expect(qualifiesForFreeShipping(7000000)).toBe(true);
  });

  it('says how much is missing, never below zero', () => {
    expect(missingForFreeShipping(5000000)).toBe(2000000);
    expect(missingForFreeShipping(9000000)).toBe(0);
  });

  it('makes the carrier quote free from the minimum and leaves it alone below', () => {
    const quote = { priceCents: 500000, label: 'Correo Clásico', etaDays: 4 };
    expect(applyFreeShipping(quote, 6000000)).toEqual({ ...quote, free: false });
    expect(applyFreeShipping(quote, 7000000)).toEqual({ priceCents: 0, label: FREE_SHIPPING_LABEL, etaDays: 4, free: true });
  });
});
