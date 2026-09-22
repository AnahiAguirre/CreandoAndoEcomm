import { describe, expect, it } from 'vitest';

import { assertCents } from '@/domain/shared/money';

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
