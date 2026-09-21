import type { AssetUrlResolver } from '@/domain/catalog/asset-url-resolver';

export const PUBLIC_IMAGES_BUCKET = 'product-images';

/**
 * Builds public-object URLs for the `product-images` bucket. No SDK needed:
 * public buckets are plain HTTPS. Private files (PDFs) never go through here —
 * they get short-lived signed URLs in fase 4.
 */
export class SupabaseAssetUrlResolver implements AssetUrlResolver {
  constructor(private readonly supabaseUrl: string) {}

  publicImageUrl(storagePath: string): string {
    const path = storagePath.replace(/^\/+/, '');
    return `${this.supabaseUrl}/storage/v1/object/public/${PUBLIC_IMAGES_BUCKET}/${path}`;
  }
}
