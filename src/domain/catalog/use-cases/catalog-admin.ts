import { DomainError } from '@/domain/shared/errors';
import { adjustCents } from '@/domain/shared/money';
import { BUCKETS, type Bucket, type FileStorage, type SignedUpload } from '@/domain/storage/file-storage';

import type { ProductFile, ProductImage } from '../product';
import type { ProductInput } from '../product-input';
import type { CategoryRepository } from '../category-repository';
import type { AdminProduct, ProductRepository } from '../product-repository';
import { CategoryNotFoundError } from './category-admin';
import { ProductNotFoundError } from './get-product-by-slug';

export class SlugTakenError extends DomainError {
  constructor(readonly slug: string) {
    super(`Ya existe un producto con el slug "${slug}"`, 'SLUG_TAKEN');
  }
}

export class CannotPublishError extends DomainError {
  constructor(reason: string) {
    super(reason, 'CANNOT_PUBLISH');
  }
}

export class InvalidUploadError extends DomainError {
  constructor(reason: string) {
    super(reason, 'INVALID_UPLOAD');
  }
}

export class InvalidPriceError extends DomainError {
  constructor(reason: string) {
    super(reason, 'INVALID_PRICE');
  }
}

/** Sanity bounds for a bulk change; anything beyond is almost surely a typo. */
export const MAX_PRICE_DROP_PERCENT = -90;
export const MAX_PRICE_RISE_PERCENT = 500;

export type UploadKind = 'image' | 'file';

export interface UploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface UploadTicket extends SignedUpload {
  bucket: Bucket;
}

/** What each bucket accepts. Enforced server-side; the form only mirrors it. */
export const UPLOAD_POLICY: Record<UploadKind, { bucket: Bucket; mimeTypes: readonly string[]; maxBytes: number }> = {
  image: {
    bucket: BUCKETS.images,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxBytes: 5 * 1024 * 1024,
  },
  file: {
    bucket: BUCKETS.files,
    mimeTypes: ['application/pdf'],
    // Matches the `product-files` bucket limit (Supabase Free caps uploads at 50 MB).
    // Raise both together if the plan changes.
    maxBytes: 50 * 1024 * 1024,
  },
};

/**
 * Application service behind the admin panel. Every method assumes the caller
 * already passed `requireAdmin()`; authorization is not this class's job.
 */
export class CatalogAdmin {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly storage: FileStorage,
    private readonly randomId: () => string,
  ) {}

  list(search?: string): Promise<AdminProduct[]> {
    return this.products.listAll(search?.trim() || undefined);
  }

  async get(id: string): Promise<AdminProduct> {
    const product = await this.products.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }

  async create(input: ProductInput): Promise<AdminProduct> {
    if (await this.products.slugTaken(input.slug)) throw new SlugTakenError(input.slug);
    await this.assertCategory(input.categoryId);
    return this.products.create(input);
  }

  async update(id: string, input: ProductInput): Promise<AdminProduct> {
    await this.get(id);
    if (await this.products.slugTaken(input.slug, id)) throw new SlugTakenError(input.slug);
    await this.assertCategory(input.categoryId);
    return this.products.update(id, input);
  }

  private async assertCategory(categoryId: string | null): Promise<void> {
    if (categoryId && !(await this.categories.findById(categoryId))) throw new CategoryNotFoundError(categoryId);
  }

  async setActive(id: string, active: boolean): Promise<void> {
    const product = await this.get(id);
    if (active) {
      if (product.kind === 'digital' && product.files.length === 0) {
        throw new CannotPublishError('Un producto digital necesita al menos un PDF antes de publicarse.');
      }
      if (product.images.length === 0) {
        throw new CannotPublishError('Subí al menos una foto antes de publicar.');
      }
    }
    await this.products.setActive(id, active);
  }

  async updatePrice(id: string, priceCents: number): Promise<void> {
    await this.get(id);
    if (!Number.isInteger(priceCents) || priceCents <= 0) throw new InvalidPriceError('El precio debe ser mayor a cero.');
    await this.products.setPrice(id, priceCents);
  }

  /** Applies `percent` to every listed product; refuses the whole batch if any result is invalid. */
  async adjustPrices(ids: string[], percent: number, roundTo = 1): Promise<number> {
    if (!Number.isFinite(percent) || percent < MAX_PRICE_DROP_PERCENT || percent > MAX_PRICE_RISE_PERCENT) {
      throw new InvalidPriceError(`El porcentaje debe estar entre ${MAX_PRICE_DROP_PERCENT}% y ${MAX_PRICE_RISE_PERCENT}%.`);
    }
    const changes = [];
    for (const id of new Set(ids)) {
      const product = await this.get(id);
      const priceCents = adjustCents(product.priceCents, percent, roundTo);
      if (priceCents <= 0) throw new InvalidPriceError(`"${product.name}" quedaría con precio cero o negativo.`);
      changes.push({ id, priceCents });
    }
    await this.products.setPrices(changes);
    return changes.length;
  }

  // ---- uploads: the browser talks to storage directly, we only issue tickets ----

  async prepareUpload(productId: string, kind: UploadKind, request: UploadRequest): Promise<UploadTicket> {
    const product = await this.get(productId);
    const policy = UPLOAD_POLICY[kind];

    if (kind === 'file' && product.kind !== 'digital') {
      throw new InvalidUploadError('Solo los productos digitales llevan archivos.');
    }
    if (!policy.mimeTypes.includes(request.contentType)) {
      throw new InvalidUploadError(`Tipo de archivo no permitido: ${request.contentType}`);
    }
    if (request.sizeBytes <= 0 || request.sizeBytes > policy.maxBytes) {
      throw new InvalidUploadError(`El archivo supera el máximo de ${Math.round(policy.maxBytes / 1024 / 1024)} MB.`);
    }

    const path = `${productId}/${this.randomId()}-${sanitizeFilename(request.filename)}`;
    const signed = await this.storage.createSignedUpload(policy.bucket, path);
    return { bucket: policy.bucket, ...signed };
  }

  async confirmImageUpload(productId: string, path: string): Promise<ProductImage> {
    await this.assertUploaded(productId, 'image', path);
    return this.products.addImage(productId, path);
  }

  async confirmFileUpload(productId: string, path: string, filename: string, sizeBytes: number): Promise<ProductFile> {
    await this.assertUploaded(productId, 'file', path);
    return this.products.addFile(productId, { storagePath: path, filename, sizeBytes });
  }

  async removeImage(imageId: string): Promise<void> {
    const removed = await this.products.removeImage(imageId);
    if (removed) await this.storage.remove(BUCKETS.images, [removed.storagePath]);
  }

  async removeFile(fileId: string): Promise<void> {
    const removed = await this.products.removeFile(fileId);
    if (removed) await this.storage.remove(BUCKETS.files, [removed.storagePath]);
  }

  /**
   * A ticket is only valid for the product it was issued for, and the object
   * must actually be in the bucket — otherwise a stale form could attach
   * arbitrary paths.
   */
  private async assertUploaded(productId: string, kind: UploadKind, path: string): Promise<void> {
    await this.get(productId);
    if (!path.startsWith(`${productId}/`) || path.includes('..')) {
      throw new InvalidUploadError('Ruta de archivo inválida.');
    }
    if (!(await this.storage.exists(UPLOAD_POLICY[kind].bucket, path))) {
      throw new InvalidUploadError('El archivo no llegó al storage. Volvé a intentarlo.');
    }
  }
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'archivo';
  return base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'archivo';
}
