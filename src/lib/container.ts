import 'server-only';

import { GetProductBySlug } from '@/domain/catalog/use-cases/get-product-by-slug';
import { ListCatalog } from '@/domain/catalog/use-cases/list-catalog';
import { db } from '@/infra/db/client';
import { DrizzleProductRepository } from '@/infra/db/repositories/drizzle-product-repository';
import { SupabaseAssetUrlResolver } from '@/infra/storage/supabase-asset-url-resolver';

import { env } from './env';

/**
 * Composition root. This is the ONLY file that wires an `infra/` implementation
 * to the `domain/` port it fulfils. Nothing under `app/` imports from `infra/`.
 */
const productRepository = new DrizzleProductRepository(db);

export const container = {
  assetUrls: new SupabaseAssetUrlResolver(env.SUPABASE_URL),
  catalog: {
    list: new ListCatalog(productRepository),
    getBySlug: new GetProductBySlug(productRepository),
  },
} as const;
