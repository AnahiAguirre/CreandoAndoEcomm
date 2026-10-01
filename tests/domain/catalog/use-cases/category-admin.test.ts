import { beforeEach, describe, expect, it } from 'vitest';

import { productInputSchema } from '@/domain/catalog/product-input';
import { CatalogAdmin } from '@/domain/catalog/use-cases/catalog-admin';
import {
  CategoryAdmin,
  CategoryNotFoundError,
  CategorySlugTakenError,
  ListStorefrontCategories,
} from '@/domain/catalog/use-cases/category-admin';
import { ListCatalog } from '@/domain/catalog/use-cases/list-catalog';

import { buildProduct, FakeFileStorage, InMemoryCategoryRepository, InMemoryProductRepository } from '../../../helpers/fakes';

const CATEGORY_ID = '3f2b8a52-6a43-4c1d-9d6e-0b1f6b8c2a11';

let products: InMemoryProductRepository;
let categories: InMemoryCategoryRepository;
let admin: CategoryAdmin;

beforeEach(() => {
  products = new InMemoryProductRepository();
  categories = new InMemoryCategoryRepository(products);
  admin = new CategoryAdmin(categories);
});

describe('create', () => {
  it('derives the slug from the name when it is left empty', async () => {
    const category = await admin.create({ name: 'Rompecabezas de madera' });
    expect(category.slug).toBe('rompecabezas-de-madera');
  });

  it('keeps an explicit slug', async () => {
    const category = await admin.create({ name: 'Pistas', slug: 'trenes' });
    expect(category.slug).toBe('trenes');
  });

  it('refuses a slug that already exists', async () => {
    await admin.create({ name: 'Pistas' });
    await expect(admin.create({ name: 'Pistas' })).rejects.toBeInstanceOf(CategorySlugTakenError);
  });

  it('rejects names that are too short', async () => {
    await expect(admin.create({ name: 'a' })).rejects.toThrow();
  });
});

describe('update', () => {
  it('renames a category', async () => {
    const { id } = await admin.create({ name: 'Pistas' });
    const updated = await admin.update(id, { name: 'Pistas de tren', slug: 'pistas-de-tren' });
    expect(updated).toMatchObject({ id, name: 'Pistas de tren', slug: 'pistas-de-tren' });
  });

  it('can keep its own slug but not take another one', async () => {
    const a = await admin.create({ name: 'Pistas' });
    const b = await admin.create({ name: 'Imprimibles' });
    await expect(admin.update(a.id, { name: 'Pistas 2', slug: a.slug })).resolves.toBeTruthy();
    await expect(admin.update(a.id, { name: 'Pistas', slug: b.slug })).rejects.toBeInstanceOf(CategorySlugTakenError);
  });

  it('fails for an unknown category', async () => {
    await expect(admin.update('nope', { name: 'Algo' })).rejects.toBeInstanceOf(CategoryNotFoundError);
  });
});

describe('delete', () => {
  it('removes the category but keeps its products, now uncategorized', async () => {
    const { id } = await admin.create({ name: 'Pistas' });
    products.items.set('p', buildProduct({ id: 'p', categoryId: id }));

    await admin.delete(id);

    expect(await admin.list()).toEqual([]);
    expect(products.items.get('p')?.categoryId).toBeNull();
  });

  it('fails for an unknown category', async () => {
    await expect(admin.delete('nope')).rejects.toBeInstanceOf(CategoryNotFoundError);
  });
});

describe('list', () => {
  it('counts products per category, drafts included, sorted by name', async () => {
    const pistas = await admin.create({ name: 'Pistas' });
    const imprimibles = await admin.create({ name: 'Imprimibles' });
    products.items.set('a', buildProduct({ id: 'a', categoryId: pistas.id, active: true }));
    products.items.set('b', buildProduct({ id: 'b', categoryId: pistas.id, active: false }));

    const list = await admin.list();
    expect(list.map((c) => [c.name, c.productCount])).toEqual([
      ['Imprimibles', 0],
      ['Pistas', 2],
    ]);
    expect(imprimibles.id).toBeTruthy();
  });
});

describe('products and categories', () => {
  const input = (overrides: Record<string, unknown> = {}) =>
    productInputSchema.parse({ name: 'Cuaderno', kind: 'digital', price: '2500', ...overrides });
  let catalogAdmin: CatalogAdmin;

  beforeEach(() => {
    catalogAdmin = new CatalogAdmin(products, categories, new FakeFileStorage(), () => 'rnd');
  });

  it('a product without categoryId stays uncategorized', async () => {
    const product = await catalogAdmin.create(input());
    expect(product.categoryId).toBeNull();
  });

  it('assigns an existing category on create and can clear it on update', async () => {
    const { id } = await admin.create({ name: 'Imprimibles' });
    const product = await catalogAdmin.create(input({ categoryId: id }));
    expect(product.categoryId).toBe(id);

    const cleared = await catalogAdmin.update(product.id, input({ categoryId: '' }));
    expect(cleared.categoryId).toBeNull();
  });

  it('refuses a category that does not exist', async () => {
    await expect(catalogAdmin.create(input({ categoryId: CATEGORY_ID }))).rejects.toBeInstanceOf(
      CategoryNotFoundError,
    );
  });

  it('rejects a malformed category id', () => {
    expect(() => input({ categoryId: 'no-es-un-uuid' })).toThrow();
  });
});

describe('storefront', () => {
  it('only offers categories with a published product, and filters the catalog by one', async () => {
    const pistas = await admin.create({ name: 'Pistas' });
    const vacia = await admin.create({ name: 'Vacía' });
    const borrador = await admin.create({ name: 'Solo borradores' });
    products.items.set('a', buildProduct({ id: 'a', categoryId: pistas.id, active: true }));
    products.items.set('b', buildProduct({ id: 'b', categoryId: null, active: true }));
    products.items.set('c', buildProduct({ id: 'c', categoryId: borrador.id, active: false }));

    const shown = await new ListStorefrontCategories(categories).execute();
    expect(shown.map((c) => c.id)).toEqual([pistas.id]);
    expect(shown.map((c) => c.id)).not.toContain(vacia.id);

    const list = new ListCatalog(products);
    expect((await list.execute()).map((p) => p.id).sort()).toEqual(['a', 'b']);
    expect((await list.execute({ categoryId: pistas.id })).map((p) => p.id)).toEqual(['a']);
  });
});
