import { and, asc, desc, eq } from 'drizzle-orm';

import type { Product } from '@/domain/catalog/product';
import type { ProductRepository } from '@/domain/catalog/product-repository';

import type { Db } from '../client';
import { productImages, products } from '../schema';

type ProductRow = typeof products.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;

function toDomain(row: ProductRow & { images: ImageRow[] }): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    kind: row.kind,
    priceCents: row.priceCents,
    active: row.active,
    stock: row.stock,
    createdAt: row.createdAt,
    images: row.images.map((img) => ({
      id: img.id,
      storagePath: img.storagePath,
      position: img.position,
    })),
  };
}

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: Db) {}

  async listActive(): Promise<Product[]> {
    const rows = await this.db.query.products.findMany({
      where: eq(products.active, true),
      orderBy: desc(products.createdAt),
      with: { images: { orderBy: asc(productImages.position) } },
    });
    return rows.map(toDomain);
  }

  async findActiveBySlug(slug: string): Promise<Product | null> {
    const row = await this.db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.active, true)),
      with: { images: { orderBy: asc(productImages.position) } },
    });
    return row ? toDomain(row) : null;
  }
}
