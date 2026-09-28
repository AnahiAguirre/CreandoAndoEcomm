import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { emailSchema, entitlementSource } from '@/domain/delivery/entitlement';
import {
  CannotGrantError,
  DigitalDelivery,
  DOWNLOAD_URL_TTL_SECONDS,
  DownloadNotAllowedError,
} from '@/domain/delivery/use-cases/digital-delivery';
import { BUCKETS } from '@/domain/storage/file-storage';

import {
  buildFile,
  buildProduct,
  FakeFileStorage,
  FakeMailSender,
  InMemoryEntitlementRepository,
  InMemoryProductRepository,
} from '../../helpers/fakes';

let products: InMemoryProductRepository;
let entitlements: InMemoryEntitlementRepository;
let storage: FakeFileStorage;
let mail: FakeMailSender;
let delivery: DigitalDelivery;

const pdf = buildFile({ id: 'f1', storagePath: 'libro/abc-animales.pdf', filename: 'animales.pdf' });

beforeEach(() => {
  products = new InMemoryProductRepository([
    buildProduct({ id: 'libro', name: 'Cuaderno Animales', kind: 'digital', files: [pdf] }),
    buildProduct({ id: 'otro', kind: 'digital', files: [buildFile({ id: 'f2' })] }),
    buildProduct({ id: 'vacio', kind: 'digital', files: [] }),
    buildProduct({ id: 'tren', kind: 'physical', stock: 3 }),
  ]);
  entitlements = new InMemoryEntitlementRepository(products);
  storage = new FakeFileStorage();
  mail = new FakeMailSender();
  delivery = new DigitalDelivery(entitlements, products, storage, mail, (to, name) => ({
    to,
    subject: `listo ${name}`,
    html: '',
    text: '',
  }));
});

afterEach(() => vi.restoreAllMocks());

describe('emailSchema', () => {
  it('trims and lowercases', () => {
    expect(emailSchema.parse('  Ana@Mail.COM ')).toBe('ana@mail.com');
  });

  it('rejects blanks and non-emails', () => {
    expect(emailSchema.safeParse('   ').success).toBe(false);
    expect(emailSchema.safeParse('ana@').success).toBe(false);
  });
});

describe('grant', () => {
  it('gives access by normalized email and mails once', async () => {
    const result = await delivery.grant('libro', ' Ana@Mail.com ');

    expect(result).toMatchObject({ created: true, mailed: true });
    expect(result.entitlement).toMatchObject({ email: 'ana@mail.com', productId: 'libro', orderId: null });
    expect(entitlementSource(result.entitlement)).toBe('manual');
    expect(mail.sent).toEqual([expect.objectContaining({ to: 'ana@mail.com', subject: 'listo Cuaderno Animales' })]);
  });

  it('is idempotent: a second grant changes nothing and sends no mail', async () => {
    await delivery.grant('libro', 'ana@mail.com');
    const again = await delivery.grant('libro', 'ANA@mail.com');

    expect(again).toMatchObject({ created: false, mailed: false });
    expect(entitlements.items).toHaveLength(1);
    expect(mail.sent).toHaveLength(1);
  });

  it('records the order when it comes from a purchase', async () => {
    const { entitlement } = await delivery.grant('libro', 'ana@mail.com', 'order-1');
    expect(entitlementSource(entitlement)).toBe('purchase');
  });

  it('keeps the access even if the mail fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mail.failWith = new Error('resend down');

    const result = await delivery.grant('libro', 'ana@mail.com');

    expect(result).toMatchObject({ created: true, mailed: false });
    expect(await entitlements.has('ana@mail.com', 'libro')).toBe(true);
  });

  it('refuses unknown, physical and file-less products', async () => {
    await expect(delivery.grant('nope', 'ana@mail.com')).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(delivery.grant('tren', 'ana@mail.com')).rejects.toBeInstanceOf(CannotGrantError);
    await expect(delivery.grant('vacio', 'ana@mail.com')).rejects.toBeInstanceOf(CannotGrantError);
    expect(entitlements.items).toHaveLength(0);
  });
});

describe('library', () => {
  it('lists only what this email owns, matching case-insensitively', async () => {
    await delivery.grant('libro', 'ana@mail.com');
    await delivery.grant('otro', 'otra@mail.com');

    const items = await delivery.library('ANA@mail.com');
    expect(items.map((i) => i.productId)).toEqual(['libro']);
    expect(items[0].files).toEqual([{ id: 'f1', filename: 'animales.pdf', sizeBytes: pdf.sizeBytes }]);
  });

  it('forgets a revoked product', async () => {
    const { entitlement } = await delivery.grant('libro', 'ana@mail.com');
    await delivery.revoke(entitlement.id);
    expect(await delivery.library('ana@mail.com')).toEqual([]);
  });
});

describe('downloadUrl', () => {
  it('signs a short-lived URL to the private bucket, named after the original file', async () => {
    await delivery.grant('libro', 'ana@mail.com');

    const url = await delivery.downloadUrl('Ana@Mail.com', 'f1');

    expect(url).toContain('libro/abc-animales.pdf');
    expect(storage.downloads).toEqual([
      {
        bucket: BUCKETS.files,
        path: 'libro/abc-animales.pdf',
        expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
        filename: 'animales.pdf',
      },
    ]);
    expect(DOWNLOAD_URL_TTL_SECONDS).toBeLessThanOrEqual(60);
  });

  it("refuses someone else's file and unknown ids the same way", async () => {
    await delivery.grant('otro', 'ana@mail.com');

    await expect(delivery.downloadUrl('ana@mail.com', 'f1')).rejects.toBeInstanceOf(DownloadNotAllowedError);
    await expect(delivery.downloadUrl('ana@mail.com', 'nope')).rejects.toBeInstanceOf(DownloadNotAllowedError);
    expect(storage.downloads).toHaveLength(0);
  });
});
