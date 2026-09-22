import { describe, expect, it } from 'vitest';

import { GetProductBySlug, ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { ListCatalog } from '@/domain/catalog/use-cases/list-catalog';

import { buildProduct, InMemoryProductRepository } from '../../../helpers/fakes';

const published = buildProduct({ id: 'pub', slug: 'publicado', active: true });
const draft = buildProduct({ id: 'draft', slug: 'borrador', active: false });

describe('ListCatalog', () => {
  it('returns only active products', async () => {
    const repo = new InMemoryProductRepository([published, draft]);
    const result = await new ListCatalog(repo).execute();
    expect(result.map((p) => p.id)).toEqual(['pub']);
  });

  it('does not leak admin-only fields (private file paths) to the storefront', async () => {
    const repo = new InMemoryProductRepository([published]);
    const [product] = await new ListCatalog(repo).execute();
    expect(product).not.toHaveProperty('files');
  });
});

describe('GetProductBySlug', () => {
  it('finds an active product by slug', async () => {
    const repo = new InMemoryProductRepository([published, draft]);
    const product = await new GetProductBySlug(repo).execute('publicado');
    expect(product.id).toBe('pub');
  });

  it('throws ProductNotFoundError for drafts and unknown slugs', async () => {
    const repo = new InMemoryProductRepository([published, draft]);
    const useCase = new GetProductBySlug(repo);
    await expect(useCase.execute('borrador')).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(useCase.execute('no-existe')).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it('exposes the slug it failed on', async () => {
    const useCase = new GetProductBySlug(new InMemoryProductRepository());
    await expect(useCase.execute('x')).rejects.toMatchObject({ identifier: 'x', code: 'PRODUCT_NOT_FOUND' });
  });
});
