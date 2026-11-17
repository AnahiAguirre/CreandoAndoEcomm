import { z } from 'zod';

import { DomainError } from '@/domain/shared/errors';
import type { Cents } from '@/domain/shared/money';

/** `percent`: `value` is 1–100. `fixed`: `value` is centavos off. */
export const COUPON_KINDS = ['percent', 'fixed'] as const;
export type CouponKind = (typeof COUPON_KINDS)[number];

/**
 * Who may use it, per buyer (counted on PAID orders, by the buyer's email):
 * `once`: each buyer once. `first_order`: only a buyer with no paid order yet.
 * `unlimited`: no per-buyer rule (maxUses may still cap the total).
 */
export const CUSTOMER_LIMITS = ['once', 'first_order', 'unlimited'] as const;
export type CustomerLimit = (typeof CUSTOMER_LIMITS)[number];

export const CUSTOMER_LIMIT_LABELS: Record<CustomerLimit, string> = {
  once: 'Cada cliente, una vez',
  first_order: 'Solo en la primera compra',
  unlimited: 'Sin límite por cliente',
};

export interface Coupon {
  id: string;
  /** Always stored normalized (see normalizeCouponCode). */
  code: string;
  kind: CouponKind;
  value: number;
  /** The products must add up to at least this (shipping does not count). */
  minSubtotalCents: Cents | null;
  /** Percent coupons only: the most it can take off. Null: no cap. */
  maxDiscountCents: Cents | null;
  /** How many PAID orders may use it, counting every buyer. Null: no limit. */
  maxUses: number | null;
  customerLimit: CustomerLimit;
  usedCount: number;
  /** Last moment it works. Null: never expires. */
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
}

export type CouponFields = Pick<
  Coupon,
  'code' | 'kind' | 'value' | 'minSubtotalCents' | 'maxDiscountCents' | 'maxUses' | 'customerLimit' | 'expiresAt' | 'active'
>;

/** What the buyer sees once a coupon is accepted. */
export interface AppliedCoupon {
  code: string;
  discountCents: Cents;
  /** "10% de descuento", "$ 5.000 de descuento". */
  label: string;
}

/** "navidad 10 " and "NAVIDAD10" are the same coupon. */
export function normalizeCouponCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

export class CouponNotValidError extends DomainError {
  constructor(message: string) {
    super(message, 'COUPON_NOT_VALID');
  }
}

const pesos = (cents: Cents) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cents / 100);

export function describeCoupon(coupon: Pick<Coupon, 'kind' | 'value' | 'maxDiscountCents'>): string {
  if (coupon.kind === 'fixed') return `${pesos(coupon.value)} de descuento`;
  const cap = coupon.maxDiscountCents !== null ? ` (hasta ${pesos(coupon.maxDiscountCents)})` : '';
  return `${coupon.value}% de descuento${cap}`;
}

/** What the buyer has already bought, for the per-buyer rule. */
export interface BuyerHistory {
  paidOrders: number;
  paidOrdersWithThisCoupon: number;
}

/** Throws, with a message for the buyer, when the per-buyer rule refuses the coupon. */
export function assertCustomerMayUse(coupon: Pick<Coupon, 'customerLimit'>, history: BuyerHistory): void {
  if (coupon.customerLimit === 'first_order' && history.paidOrders > 0) {
    throw new CouponNotValidError('Este cupón es solo para la primera compra.');
  }
  if (coupon.customerLimit === 'once' && history.paidOrdersWithThisCoupon > 0) {
    throw new CouponNotValidError('Ya usaste este cupón en otra compra.');
  }
}

/**
 * How much the coupon takes off a cart whose products add up to `subtotalCents`.
 * Throws CouponNotValidError, with a message for the buyer, when it can't be used.
 * Never more than the subtotal: shipping is always paid in full.
 */
export function couponDiscount(coupon: Coupon | null, subtotalCents: Cents, now: Date = new Date()): Cents {
  if (!coupon || !coupon.active) throw new CouponNotValidError('Ese cupón no existe o ya no está activo.');
  if (coupon.expiresAt && now > coupon.expiresAt) throw new CouponNotValidError('Ese cupón ya venció.');
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponNotValidError('Ese cupón ya se usó todas las veces posibles.');
  }
  if (coupon.minSubtotalCents !== null && subtotalCents < coupon.minSubtotalCents) {
    throw new CouponNotValidError(`Ese cupón vale para compras desde ${pesos(coupon.minSubtotalCents)}.`);
  }
  let off = coupon.kind === 'percent' ? Math.floor((subtotalCents * coupon.value) / 100) : coupon.value;
  if (coupon.kind === 'percent' && coupon.maxDiscountCents !== null) off = Math.min(off, coupon.maxDiscountCents);
  return Math.min(off, subtotalCents);
}

// ---------- admin input ----------

/** A date picker's "YYYY-MM-DD" → the end of that day in Argentina (UTC-3, no DST). */
export function endOfDayAr(date: string): Date {
  return new Date(`${date}T23:59:59.999-03:00`);
}

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => (v === undefined || v === '' ? null : Number(v)));

/**
 * What the admin form sends. Money comes in pesos (that's what people type) and is
 * stored in centavos; the expiry comes as a date and lasts until the end of that day.
 */
export const couponInputSchema = z
  .object({
    code: z
      .string()
      .transform(normalizeCouponCode)
      .pipe(
        z
          .string()
          .min(3, 'El código tiene que tener al menos 3 caracteres.')
          .max(30, 'El código puede tener hasta 30 caracteres.')
          .regex(/^[A-Z0-9_-]+$/, 'Usá solo letras, números, guiones o guiones bajos (sin espacios ni acentos).'),
      ),
    kind: z.enum(COUPON_KINDS),
    value: z.coerce.number({ error: 'Poné cuánto descuenta.' }).positive('El descuento tiene que ser mayor a 0.'),
    minSubtotal: optionalNumber,
    maxDiscount: optionalNumber,
    maxUses: optionalNumber,
    customerLimit: z.enum(CUSTOMER_LIMITS).default('once'),
    expiresOn: z
      .string()
      .optional()
      .transform((v) => (v ? v : null))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.').nullable()),
    active: z.boolean().default(true),
  })
  .superRefine((input, ctx) => {
    if (input.kind === 'percent' && (!Number.isInteger(input.value) || input.value > 100)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'El porcentaje tiene que ser un número entero entre 1 y 100.' });
    }
    if (input.minSubtotal !== null && (Number.isNaN(input.minSubtotal) || input.minSubtotal < 0)) {
      ctx.addIssue({ code: 'custom', path: ['minSubtotal'], message: 'La compra mínima no puede ser negativa.' });
    }
    if (input.maxDiscount !== null && (Number.isNaN(input.maxDiscount) || input.maxDiscount <= 0)) {
      ctx.addIssue({ code: 'custom', path: ['maxDiscount'], message: 'El tope de descuento tiene que ser mayor a 0.' });
    }
    if (input.maxUses !== null && (!Number.isInteger(input.maxUses) || input.maxUses < 1)) {
      ctx.addIssue({ code: 'custom', path: ['maxUses'], message: 'La cantidad de usos tiene que ser un número entero desde 1.' });
    }
  })
  .transform(
    (input): CouponFields => ({
      code: input.code,
      kind: input.kind,
      value: input.kind === 'percent' ? input.value : Math.round(input.value * 100),
      minSubtotalCents: input.minSubtotal === null ? null : Math.round(input.minSubtotal * 100),
      // A cap only makes sense on a percentage: a fixed amount already is its own cap.
      maxDiscountCents: input.kind === 'percent' && input.maxDiscount !== null ? Math.round(input.maxDiscount * 100) : null,
      maxUses: input.maxUses,
      customerLimit: input.customerLimit,
      expiresAt: input.expiresOn ? endOfDayAr(input.expiresOn) : null,
      active: input.active,
    }),
  );

export type CouponInput = z.input<typeof couponInputSchema>;
