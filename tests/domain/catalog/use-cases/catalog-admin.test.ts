import { beforeEach, describe, expect, it } from 'vitest';

import { productInputSchema } from '@/domain/catalog/product-input';
import {
  CannotPublishError,
  CatalogAdmin,
  InvalidPriceError,
  InvalidUploadError,
  SlugTakenError,
  UPLOAD_POLICY,
} from '@/domain/catalog/use-cases/catalog-admin';
import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { BUCKETS } from '@/domain/storage/file-storage';

import { buildFile, buildImage, buildProduct, FakeFileStorage, InMemoryCategoryRepository, InMemoryProductRepository } from '../../../helpers/fakes';

const input = (overrides: Record<string, unknown> = {}) =>
  productInputSchema.parse({ name: 'Cuaderno Animales', kind: 'digital', price: '2500', ...overrides });

let repo: InMemoryProductRepository;
let categories: InMemoryCategoryRepository;
let storage: FakeFileStorage;
let admin: CatalogAdmin;
let ids: number;

beforeEach(() => {
  repo = new InMemoryProductRepository();
  storage = new FakeFileStorage();
  ids = 0;
  categories = new InMemoryCategoryRepository(repo);
  admin = new CatalogAdmin(repo, categories, storage, () => `rnd${++ids}`);
});

describe('list / get', () => {
  it('lists everything including drafts, optionally filtered', async () => {
    repo.items.set('a', buildProduct({ id: 'a', name: 'Animales', slug: 'animales', active: true }));
    repo.items.set('b', buildProduct({ id: 'b', name: 'Dinos', slug: 'dinos', active: false }));

    expect((await admin.list()).map((p) => p.id).sort()).toEqual(['a', 'b']);
    expect((await admin.list('dino')).map((p) => p.id)).toEqual(['b']);
    expect((await admin.list('   ')).map((p) => p.id).sort()).toEqual(['a', 'b']);
  });

  it('get throws ProductNotFoundError for unknown ids', async () => {
    await expect(admin.get('nope')).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});

describe('create', () => {
  it('creates a draft with the derived slug', async () => {
    const product = await admin.create(input());
    expect(product.slug).toBe('cuaderno-animales');
    expect(product.active).toBe(false);
    expect(product.priceCents).toBe(250000);
  });

  it('refuses a slug that already exists', async () => {
    await admin.create(input());
    await expect(admin.create(input())).rejects.toBeInstanceOf(SlugTakenError);
  });
});

describe('update', () => {
  it('updates fields and allows keeping the same slug', async () => {
    const created = await admin.create(input());
    const updated = await admin.update(created.id, input({ price: '3000' }));
    expect(updated.priceCents).toBe(300000);
    expect(updated.slug).toBe('cuaderno-animales');
  });

  it('refuses to take another product\'s slug', async () => {
    const a = await admin.create(input({ name: 'Alfa' }));
    await admin.create(input({ name: 'Beta' }));
    await expect(admin.update(a.id, input({ name: 'Alfa', slug: 'beta' }))).rejects.toBeInstanceOf(SlugTakenError);
  });

  it('throws for unknown ids', async () => {
    await expect(admin.update('nope', input())).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});

describe('setActive (publish rules)', () => {
  it('digital products need at least one PDF and one image', async () => {
    const p = await admin.create(input());
    await expect(admin.setActive(p.id, true)).rejects.toBeInstanceOf(CannotPublishError);

    repo.items.set(p.id, { ...repo.items.get(p.id)!, files: [buildFile()] });
    await expect(admin.setActive(p.id, true)).rejects.toThrow(/foto/);

    repo.items.set(p.id, { ...repo.items.get(p.id)!, images: [buildImage()] });
    await admin.setActive(p.id, true);
    expect(repo.items.get(p.id)!.active).toBe(true);
  });

  it('physical products only need an image', async () => {
    const p = await admin.create(input({ kind: 'physical', stock: '3' }));
    await expect(admin.setActive(p.id, true)).rejects.toBeInstanceOf(CannotPublishError);
    repo.items.set(p.id, { ...repo.items.get(p.id)!, images: [buildImage()] });
    await admin.setActive(p.id, true);
    expect(repo.items.get(p.id)!.active).toBe(true);
  });

  it('unpublishing has no preconditions', async () => {
    const p = await admin.create(input());
    repo.items.set(p.id, { ...repo.items.get(p.id)!, active: true });
    await admin.setActive(p.id, false);
    expect(repo.items.get(p.id)!.active).toBe(false);
  });
});

describe('prepareUpload', () => {
  it('issues a ticket in the right bucket under the product folder with a sanitized name', async () => {
    const p = await admin.create(input());
    const ticket = await admin.prepareUpload(p.id, 'image', {
      filename: 'Foto Tapa ñandú (1).JPG',
      contentType: 'image/jpeg',
      sizeBytes: 1024,
    });
    expect(ticket.bucket).toBe(BUCKETS.images);
    expect(ticket.path).toBe(`${p.id}/rnd1-Foto-Tapa-nandu-1-.JPG`);
    expect(ticket.token).toBeTruthy();
    expect(storage.signed).toEqual([{ bucket: BUCKETS.images, path: ticket.path }]);
  });

  it('PDFs go to the private bucket', async () => {
    const p = await admin.create(input());
    const ticket = await admin.prepareUpload(p.id, 'file', {
      filename: 'laminas.pdf',
      contentType: 'application/pdf',
      sizeBytes: 5_000_000,
    });
    expect(ticket.bucket).toBe(BUCKETS.files);
  });

  it('rejects wrong mime types per kind', async () => {
    const p = await admin.create(input());
    await expect(
      admin.prepareUpload(p.id, 'image', { filename: 'x.pdf', contentType: 'application/pdf', sizeBytes: 10 }),
    ).rejects.toBeInstanceOf(InvalidUploadError);
    await expect(
      admin.prepareUpload(p.id, 'file', { filename: 'x.png', contentType: 'image/png', sizeBytes: 10 }),
    ).rejects.toBeInstanceOf(InvalidUploadError);
  });

  it('rejects files over the size cap or empty', async () => {
    const p = await admin.create(input());
    await expect(
      admin.prepareUpload(p.id, 'image', {
        filename: 'big.png',
        contentType: 'image/png',
        sizeBytes: UPLOAD_POLICY.image.maxBytes + 1,
      }),
    ).rejects.toThrow(/MB/);
    await expect(
      admin.prepareUpload(p.id, 'image', { filename: 'empty.png', contentType: 'image/png', sizeBytes: 0 }),
    ).rejects.toBeInstanceOf(InvalidUploadError);
  });

  it('physical products cannot receive PDFs', async () => {
    const p = await admin.create(input({ kind: 'physical' }));
    await expect(
      admin.prepareUpload(p.id, 'file', { filename: 'x.pdf', contentType: 'application/pdf', sizeBytes: 10 }),
    ).rejects.toThrow(/digitales/);
  });

  it('does not sign anything for unknown products', async () => {
    await expect(
      admin.prepareUpload('nope', 'image', { filename: 'x.png', contentType: 'image/png', sizeBytes: 10 }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(storage.signed).toHaveLength(0);
  });
});

describe('confirm uploads', () => {
  it('records an image once the object exists in the bucket', async () => {
    const p = await admin.create(input());
    const ticket = await admin.prepareUpload(p.id, 'image', { filename: 'a.png', contentType: 'image/png', sizeBytes: 1 });
    storage.put(ticket.bucket, ticket.path);

    const image = await admin.confirmImageUpload(p.id, ticket.path);
    expect(image.storagePath).toBe(ticket.path);
    expect(repo.items.get(p.id)!.images).toHaveLength(1);
  });

  it('records a file with its metadata', async () => {
    const p = await admin.create(input());
    const ticket = await admin.prepareUpload(p.id, 'file', { filename: 'a.pdf', contentType: 'application/pdf', sizeBytes: 9 });
    storage.put(ticket.bucket, ticket.path);

    const file = await admin.confirmFileUpload(p.id, ticket.path, 'a.pdf', 9);
    expect(file).toMatchObject({ storagePath: ticket.path, filename: 'a.pdf', sizeBytes: 9 });
  });

  it('refuses when the object never landed in storage', async () => {
    const p = await admin.create(input());
    await expect(admin.confirmImageUpload(p.id, `${p.id}/ghost.png`)).rejects.toThrow(/no llegó/);
    expect(repo.items.get(p.id)!.images).toHaveLength(0);
  });

  it('refuses paths that belong to another product or escape the folder', async () => {
    const a = await admin.create(input({ name: 'Alfa' }));
    const b = await admin.create(input({ name: 'Beta' }));
    storage.put(BUCKETS.images, `${b.id}/x.png`);

    await expect(admin.confirmImageUpload(a.id, `${b.id}/x.png`)).rejects.toBeInstanceOf(InvalidUploadError);
    await expect(admin.confirmImageUpload(a.id, `${a.id}/../${b.id}/x.png`)).rejects.toBeInstanceOf(InvalidUploadError);
  });
});

describe('remove image / file', () => {
  it('deletes the row and then the object from the right bucket', async () => {
    const p = await admin.create(input());
    const image = await repo.addImage(p.id, `${p.id}/a.png`);
    const file = await repo.addFile(p.id, { storagePath: `${p.id}/a.pdf`, filename: 'a.pdf', sizeBytes: 1 });

    await admin.removeImage(image.id);
    await admin.removeFile(file.id);

    expect(repo.items.get(p.id)!.images).toHaveLength(0);
    expect(repo.items.get(p.id)!.files).toHaveLength(0);
    expect(storage.removed).toEqual([
      { bucket: BUCKETS.images, paths: [`${p.id}/a.png`] },
      { bucket: BUCKETS.files, paths: [`${p.id}/a.pdf`] },
    ]);
  });

  it('is a no-op for unknown ids (idempotent)', async () => {
    await admin.removeImage('nope');
    await admin.removeFile('nope');
    expect(storage.removed).toHaveLength(0);
  });
});

describe('updatePrice', () => {
  it('changes only the price', async () => {
    repo.items.set('a', buildProduct({ id: 'a', name: 'Animales', priceCents: 100000 }));
    await admin.updatePrice('a', 185050);
    expect(repo.items.get('a')?.priceCents).toBe(185050);
    expect(repo.items.get('a')?.name).toBe('Animales');
  });

  it('rejects unknown products and non-positive prices', async () => {
    repo.items.set('a', buildProduct({ id: 'a' }));
    await expect(admin.updatePrice('nope', 1000)).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(admin.updatePrice('a', 0)).rejects.toBeInstanceOf(InvalidPriceError);
    await expect(admin.updatePrice('a', 10.5)).rejects.toBeInstanceOf(InvalidPriceError);
  });
});

describe('adjustPrices', () => {
  beforeEach(() => {
    repo.items.set('a', buildProduct({ id: 'a', priceCents: 100000 }));
    repo.items.set('b', buildProduct({ id: 'b', priceCents: 123456 }));
  });

  it('raises every listed product and reports how many', async () => {
    expect(await admin.adjustPrices(['a', 'b'], 10, 1000)).toBe(2);
    expect(repo.items.get('a')?.priceCents).toBe(110000);
    expect(repo.items.get('b')?.priceCents).toBe(136000);
  });

  it('lowers prices with a negative percentage', async () => {
    await admin.adjustPrices(['a'], -15);
    expect(repo.items.get('a')?.priceCents).toBe(85000);
  });

  it('ignores duplicate ids and leaves unlisted products alone', async () => {
    expect(await admin.adjustPrices(['a', 'a'], 10)).toBe(1);
    expect(repo.items.get('b')?.priceCents).toBe(123456);
  });

  it('rejects percentages out of range without touching anything', async () => {
    await expect(admin.adjustPrices(['a'], -95)).rejects.toBeInstanceOf(InvalidPriceError);
    await expect(admin.adjustPrices(['a'], 501)).rejects.toBeInstanceOf(InvalidPriceError);
    await expect(admin.adjustPrices(['a'], Number.NaN)).rejects.toBeInstanceOf(InvalidPriceError);
    expect(repo.items.get('a')?.priceCents).toBe(100000);
  });

  it('is all-or-nothing when one result would be zero', async () => {
    repo.items.set('c', buildProduct({ id: 'c', priceCents: 1 }));
    await expect(admin.adjustPrices(['a', 'c'], -50, 100)).rejects.toBeInstanceOf(InvalidPriceError);
    expect(repo.items.get('a')?.priceCents).toBe(100000);
  });

  it('fails on an unknown id before changing anything', async () => {
    await expect(admin.adjustPrices(['a', 'nope'], 10)).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(repo.items.get('a')?.priceCents).toBe(100000);
  });
});
