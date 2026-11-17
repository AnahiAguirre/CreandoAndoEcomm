import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { COUPON_KINDS, CUSTOMER_LIMITS } from '@/domain/coupons/coupon';

export const couponKind = pgEnum('coupon_kind', COUPON_KINDS);
export const couponCustomerLimit = pgEnum('coupon_customer_limit', CUSTOMER_LIMITS);

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Stored normalized (upper case, no spaces). Unique: one code, one coupon.
  code: text('code').notNull().unique(),
  kind: couponKind('kind').notNull(),
  // percent: 1–100. fixed: centavos.
  value: integer('value').notNull(),
  minSubtotalCents: integer('min_subtotal_cents'),
  // Percent coupons only: the most they take off.
  maxDiscountCents: integer('max_discount_cents'),
  maxUses: integer('max_uses'),
  customerLimit: couponCustomerLimit('customer_limit').notNull().default('once'),
  // Bumped by markPaid, in the same transaction that marks the order paid.
  usedCount: integer('used_count').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
