import { describe, expect, it } from 'vitest';

import {
  couponDiscount,
  couponInputSchema,
  CouponNotValidError,
  describeCoupon,
  endOfDayAr,
  normalizeCouponCode,
} from '@/domain/coupons/coupon';
import { CouponAdmin, CouponCodeTakenError } from '@/domain/coupons/use-cases/coupon-admin';

import { buildCoupon, InMemoryCouponRepository } from '../../helpers/fakes';

describe('normalizeCouponCode', () => {
  it('ignores case and spaces', () => {
    expect(normalizeCouponCode(' navidad 10 ')).toBe('NAVIDAD10');
  });
});

describe('couponDiscount', () => {
  const now = new Date('2026-12-10T12:00:00-03:00');

  it('takes a percentage off the products, rounding down to the centavo', () => {
    expect(couponDiscount(buildCoupon({ kind: 'percent', value: 10 }), 1_234_567, now)).toBe(123_456);
  });

  it('takes a fixed amount off, never more than the products', () => {
    expect(couponDiscount(buildCoupon({ kind: 'fixed', value: 500_000 }), 2_000_000, now)).toBe(500_000);
    expect(couponDiscount(buildCoupon({ kind: 'fixed', value: 500_000 }), 300_000, now)).toBe(300_000);
  });

  it.each([
    ['unknown', null, /no existe/],
    ['inactive', buildCoupon({ active: false }), /no existe o ya no está activo/],
    ['expired', buildCoupon({ expiresAt: new Date('2026-12-09T23:59:59-03:00') }), /venció/],
    ['used up', buildCoupon({ maxUses: 5, usedCount: 5 }), /todas las veces/],
    ['under the minimum', buildCoupon({ minSubtotalCents: 3_000_000 }), /desde \$\s?30\.000/],
  ])('refuses a coupon that is %s', (_, coupon, message) => {
    expect(() => couponDiscount(coupon, 2_000_000, now)).toThrow(CouponNotValidError);
    expect(() => couponDiscount(coupon, 2_000_000, now)).toThrow(message);
  });

  it('caps a percentage at its maximum discount', () => {
    const coupon = buildCoupon({ kind: 'percent', value: 25, maxDiscountCents: 1_000_000 });
    expect(couponDiscount(coupon, 2_000_000, now)).toBe(500_000);
    expect(couponDiscount(coupon, 8_000_000, now)).toBe(1_000_000);
  });

  it('works all through its last day', () => {
    const coupon = buildCoupon({ expiresAt: endOfDayAr('2026-12-10') });
    expect(couponDiscount(coupon, 1_000_000, new Date('2026-12-10T23:59:00-03:00'))).toBe(100_000);
  });
});

describe('describeCoupon', () => {
  it('says what it takes off', () => {
    expect(describeCoupon({ kind: 'percent', value: 15, maxDiscountCents: null })).toBe('15% de descuento');
    expect(describeCoupon({ kind: 'percent', value: 25, maxDiscountCents: 1_000_000 })).toMatch(/25% de descuento \(hasta \$\s?10\.000\)/);
    expect(describeCoupon({ kind: 'fixed', value: 500_000, maxDiscountCents: null })).toMatch(/5\.000 de descuento/);
  });
});

describe('couponInputSchema', () => {
  it('turns pesos into centavos and the date into the end of that day', () => {
    const fields = couponInputSchema.parse({
      code: 'reyes 5000',
      kind: 'fixed',
      value: '5000',
      minSubtotal: '20000',
      maxUses: '10',
      expiresOn: '2027-01-06',
      active: true,
    });
    expect(fields).toEqual({
      code: 'REYES5000',
      kind: 'fixed',
      value: 500_000,
      minSubtotalCents: 2_000_000,
      maxDiscountCents: null,
      maxUses: 10,
      customerLimit: 'once',
      expiresAt: endOfDayAr('2027-01-06'),
      active: true,
    });
  });

  it('leaves the optional limits empty', () => {
    const fields = couponInputSchema.parse({ code: 'HOLA', kind: 'percent', value: 10, minSubtotal: '', maxUses: '', expiresOn: '' });
    expect(fields).toMatchObject({ value: 10, minSubtotalCents: null, maxUses: null, expiresAt: null, active: true });
  });

  it.each([
    [{ code: 'AB', kind: 'percent', value: 10 }, /al menos 3/],
    [{ code: 'CON ACENTO Ñ', kind: 'percent', value: 10 }, /solo letras/],
    [{ code: 'MUCHO', kind: 'percent', value: 120 }, /entre 1 y 100/],
    [{ code: 'CERO', kind: 'fixed', value: 0 }, /mayor a 0/],
    [{ code: 'USOS', kind: 'percent', value: 10, maxUses: '0' }, /desde 1/],
  ])('rejects %o', (input, message) => {
    expect(() => couponInputSchema.parse(input)).toThrow(message);
  });
});

describe('CouponAdmin', () => {
  it('refuses a code another coupon already has, but lets a coupon keep its own', async () => {
    const admin = new CouponAdmin(new InMemoryCouponRepository());
    const a = await admin.create({ code: 'navidad10', kind: 'percent', value: 10 });
    await expect(admin.create({ code: 'NAVIDAD10', kind: 'fixed', value: 1000 })).rejects.toBeInstanceOf(CouponCodeTakenError);
    await expect(admin.update(a.id, { code: 'NAVIDAD10', kind: 'percent', value: 15 })).resolves.toMatchObject({ value: 15 });
  });
});
