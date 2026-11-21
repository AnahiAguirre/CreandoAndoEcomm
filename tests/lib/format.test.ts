import { describe, expect, it } from 'vitest';

import { formatPrice, formatPriceShort } from '@/lib/format';

// Intl inserts a non-breaking space between "$" and the digits; normalize it.
const plain = (s: string) => s.replace(/ /g, ' ');

describe('formatPrice', () => {
  it('formats cents as ARS with es-AR separators', () => {
    expect(plain(formatPrice(250000))).toBe('$ 2.500,00');
    expect(plain(formatPrice(1850050))).toBe('$ 18.500,50');
  });

  it('handles zero and sub-peso amounts', () => {
    expect(plain(formatPrice(0))).toBe('$ 0,00');
    expect(plain(formatPrice(5))).toBe('$ 0,05');
  });
});

describe('formatPriceShort', () => {
  it('drops the centavos for round amounts in copy', () => {
    expect(plain(formatPriceShort(7000000))).toBe('$ 70.000');
    expect(plain(formatPriceShort(0))).toBe('$ 0');
  });
});
