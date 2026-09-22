import { describe, expect, it } from 'vitest';

import { SupabaseAssetUrlResolver } from '@/infra/storage/supabase-asset-url-resolver';

const resolver = new SupabaseAssetUrlResolver('https://abc.supabase.co');

describe('SupabaseAssetUrlResolver.publicImageUrl', () => {
  it('builds the public object URL for the images bucket', () => {
    expect(resolver.publicImageUrl('prod-1/cover.jpg')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/product-images/prod-1/cover.jpg',
    );
  });

  it('tolerates a leading slash in the stored path', () => {
    expect(resolver.publicImageUrl('/prod-1/cover.jpg')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/product-images/prod-1/cover.jpg',
    );
  });
});
