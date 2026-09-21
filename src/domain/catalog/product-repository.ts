import type { Product } from './product';

/**
 * Port: how the domain reads the catalog. Implemented in infra (Drizzle).
 * Only *active* products are visible to shoppers; the admin (fase 2) gets
 * its own methods here later.
 */
export interface ProductRepository {
  listActive(): Promise<Product[]>;
  findActiveBySlug(slug: string): Promise<Product | null>;
}
