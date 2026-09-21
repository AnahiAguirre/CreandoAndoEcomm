import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { PRODUCT_KINDS } from '@/domain/catalog/product';

export const productKind = pgEnum('product_kind', PRODUCT_KINDS);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    kind: productKind('kind').notNull(),
    // Integer centavos — never a float. See src/domain/shared/money.ts.
    priceCents: integer('price_cents').notNull(),
    active: boolean('active').notNull().default(false),
    // Physical products only. Digital ones keep 0 and are always sellable.
    stock: integer('stock').notNull().default(0),
    // Shipping dimensions (physical only), used by the ShippingProvider in fase 5/8.
    weightG: integer('weight_g'),
    lengthCm: integer('length_cm'),
    widthCm: integer('width_cm'),
    heightCm: integer('height_cm'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('products_active_idx').on(t.active)],
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    // Path inside the PUBLIC `product-images` bucket.
    storagePath: text('storage_path').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('product_images_product_idx').on(t.productId)],
);

export const productFiles = pgTable(
  'product_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    // Path inside the PRIVATE `product-files` bucket. Served only via signed URLs (fase 4).
    storagePath: text('storage_path').notNull(),
    filename: text('filename').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('product_files_product_idx').on(t.productId)],
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  files: many(productFiles),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productFilesRelations = relations(productFiles, ({ one }) => ({
  product: one(products, { fields: [productFiles.productId], references: [products.id] }),
}));
