import { describe, expect, it } from 'vitest';

import { adjustCents, assertCents } from '@/domain/shared/money';

describe('assertCents', () => {
  it('accepts zero and positive integers', () => {
    expect(assertCents(0)).toBe(0);
    expect(assertCents(250000)).toBe(250000);
  });

  it('rejects floats — money is never fractional cents', () => {
    expect(() => assertCents(10.5)).toThrow(RangeError);
  });

  it('rejects negatives and NaN', () => {
    expect(() => assertCents(-1)).toThrow(RangeError);
    expect(() => assertCents(Number.NaN)).toThrow(RangeError);
  });

  it('names the offending field in the message', () => {
    expect(() => assertCents(1.1, 'priceCents')).toThrow(/priceCents/);
  });
});

describe('adjustCents', () => {
  it('applies a percentage and stays an integer', () => {
    expect(adjustCents(100000, 10)).toBe(110000);
    expect(adjustCents(100000, -15)).toBe(85000);
    expect(Number.isInteger(adjustCents(33333, 7.5))).toBe(true);
  });

  it('rounds to the nearest multiple of roundTo', () => {
    expect(adjustCents(123456, 10, 100)).toBe(135800); // 1358,016 → $1358
    expect(adjustCents(123456, 10, 1000)).toBe(136000); // → $1360
    expect(adjustCents(123456, 10, 10000)).toBe(140000); // → $1400
  });
});
