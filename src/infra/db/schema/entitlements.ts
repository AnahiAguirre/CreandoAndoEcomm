import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { products } from './products';

// Who may download which digital product. Keyed by (normalized) email — see
// src/domain/delivery/entitlement.ts for why not by user id.
export const entitlements = pgTable(
  'entitlements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    // The paid order behind it. Null = granted by hand from the admin.
    // Becomes a foreign key to `orders` when that table exists (fase 3).
    orderId: uuid('order_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Makes grant() idempotent: webhook retries and double clicks can't duplicate.
    unique('entitlements_email_product_uq').on(t.email, t.productId),
    index('entitlements_product_idx').on(t.productId),
  ],
);

export const entitlementsRelations = relations(entitlements, ({ one }) => ({
  product: one(products, { fields: [entitlements.productId], references: [products.id] }),
}));
