import { describe, expect, it } from 'vitest';

import { GetCartProducts } from '@/domain/cart/use-cases/get-cart-products';

import { InMemoryProductRepository, buildProduct } from '../../helpers/fakes';

describe('GetCartProducts', () => {
  const repo = new InMemoryProductRepository([
    buildProduct({ id: 'a', slug: 'a', name: 'A', active: true }),
    buildProduct({ id: 'b', slug: 'b', name: 'B', active: false }),
  ]);
  const useCase = new GetCartProducts(repo);

  it('returns only active products, by id', async () => {
    const result = await useCase.execute(['a', 'b', 'nope']);
    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('exposes no admin or private fields', async () => {
    const [p] = await useCase.execute(['a']);
    expect(Object.keys(p!).sort()).toEqual(['coverPath', 'id', 'kind', 'name', 'priceCents', 'slug', 'stock']);
  });

  it('answers an empty cart without touching the repository', async () => {
    expect(await useCase.execute([])).toEqual([]);
  });
});
