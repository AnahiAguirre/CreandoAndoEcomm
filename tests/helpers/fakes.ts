import type { Product, ProductFile, ProductImage } from '@/domain/catalog/product';
import type { ProductInput } from '@/domain/catalog/product-input';
import type { AdminCategory, Category } from '@/domain/catalog/category';
import type { CategoryFields, CategoryRepository } from '@/domain/catalog/category-repository';
import type { AdminProduct, NewProductFile, ProductRepository } from '@/domain/catalog/product-repository';
import type { DeliverableFile, Entitlement, LibraryItem } from '@/domain/delivery/entitlement';
import type { EntitlementRepository, NewEntitlement } from '@/domain/delivery/entitlement-repository';
import type { MailMessage, MailSender } from '@/domain/notifications/mail-sender';
import type { Bucket, FileStorage, SignedDownloadOptions, SignedUpload } from '@/domain/storage/file-storage';

// ---------- builders ----------

let seq = 0;
export const nextId = () => `id-${++seq}`;

export function buildProduct(overrides: Partial<AdminProduct> = {}): AdminProduct {
  const id = overrides.id ?? nextId();
  return {
    id,
    slug: `producto-${id}`,
    name: `Producto ${id}`,
    description: '',
    kind: 'digital',
    priceCents: 100000,
    categoryId: null,
    active: false,
    stock: 0,
    images: [],
    files: [],
    weightG: null,
    lengthCm: null,
    widthCm: null,
    heightCm: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function buildImage(overrides: Partial<ProductImage> = {}): ProductImage {
  const id = overrides.id ?? nextId();
  return { id, storagePath: `p/${id}.jpg`, position: 0, ...overrides };
}

export function buildFile(overrides: Partial<ProductFile> = {}): ProductFile {
  const id = overrides.id ?? nextId();
  return { id, storagePath: `p/${id}.pdf`, filename: `${id}.pdf`, sizeBytes: 1024, ...overrides };
}

// ---------- in-memory ports ----------

export class InMemoryProductRepository implements ProductRepository {
  readonly items = new Map<string, AdminProduct>();

  constructor(seed: AdminProduct[] = []) {
    for (const p of seed) this.items.set(p.id, p);
  }

  private toPublic(p: AdminProduct): Product {
    // Only the storefront fields — private file paths and admin metadata stay out.
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      kind: p.kind,
      priceCents: p.priceCents,
      categoryId: p.categoryId,
      active: p.active,
      stock: p.stock,
      images: p.images,
      createdAt: p.createdAt,
    };
  }

  async listActive(filter?: { categoryId?: string }): Promise<Product[]> {
    return [...this.items.values()]
      .filter((p) => p.active && (!filter?.categoryId || p.categoryId === filter.categoryId))
      .map((p) => this.toPublic(p));
  }

  async findActiveBySlug(slug: string): Promise<Product | null> {
    const p = [...this.items.values()].find((x) => x.slug === slug && x.active);
    return p ? this.toPublic(p) : null;
  }

  async listAll(search?: string): Promise<AdminProduct[]> {
    const all = [...this.items.values()];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q));
  }

  async findById(id: string): Promise<AdminProduct | null> {
    return this.items.get(id) ?? null;
  }

  async slugTaken(slug: string, excludeId?: string): Promise<boolean> {
    return [...this.items.values()].some((p) => p.slug === slug && p.id !== excludeId);
  }

  async create(input: ProductInput): Promise<AdminProduct> {
    const product = buildProduct({ ...this.fromInput(input), id: nextId() });
    this.items.set(product.id, product);
    return product;
  }

  async update(id: string, input: ProductInput): Promise<AdminProduct> {
    const current = this.items.get(id)!;
    const updated = { ...current, ...this.fromInput(input), updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  async setActive(id: string, active: boolean): Promise<void> {
    this.items.set(id, { ...this.items.get(id)!, active });
  }

  async setPrice(id: string, priceCents: number): Promise<void> {
    this.items.set(id, { ...this.items.get(id)!, priceCents });
  }

  async setPrices(changes: { id: string; priceCents: number }[]): Promise<void> {
    for (const { id, priceCents } of changes) await this.setPrice(id, priceCents);
  }

  async addImage(productId: string, storagePath: string): Promise<ProductImage> {
    const p = this.items.get(productId)!;
    const image = buildImage({ storagePath, position: p.images.length });
    this.items.set(productId, { ...p, images: [...p.images, image] });
    return image;
  }

  async removeImage(imageId: string): Promise<ProductImage | null> {
    for (const p of this.items.values()) {
      const image = p.images.find((i) => i.id === imageId);
      if (image) {
        this.items.set(p.id, { ...p, images: p.images.filter((i) => i.id !== imageId) });
        return image;
      }
    }
    return null;
  }

  async addFile(productId: string, file: NewProductFile): Promise<ProductFile> {
    const p = this.items.get(productId)!;
    const created = buildFile(file);
    this.items.set(productId, { ...p, files: [...p.files, created] });
    return created;
  }

  async removeFile(fileId: string): Promise<ProductFile | null> {
    for (const p of this.items.values()) {
      const file = p.files.find((f) => f.id === fileId);
      if (file) {
        this.items.set(p.id, { ...p, files: p.files.filter((f) => f.id !== fileId) });
        return file;
      }
    }
    return null;
  }

  private fromInput(input: ProductInput) {
    return {
      slug: input.slug,
      name: input.name,
      description: input.description,
      kind: input.kind,
      priceCents: input.price,
      categoryId: input.categoryId,
      stock: input.stock,
      weightG: input.weightG,
      lengthCm: input.lengthCm,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
    };
  }
}

/** Mirrors the DB: deleting a category leaves its products uncategorized. */
export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items = new Map<string, Category>();

  constructor(private readonly products?: InMemoryProductRepository) {}

  private count(id: string): number {
    return [...(this.products?.items.values() ?? [])].filter((p) => p.categoryId === id).length;
  }

  async listAll(): Promise<AdminCategory[]> {
    return [...this.items.values()]
      .map((c) => ({ ...c, productCount: this.count(c.id) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Category | null> {
    return this.items.get(id) ?? null;
  }

  async slugTaken(slug: string, excludeId?: string): Promise<boolean> {
    return [...this.items.values()].some((c) => c.slug === slug && c.id !== excludeId);
  }

  async create(fields: CategoryFields): Promise<Category> {
    const category = { id: crypto.randomUUID(), ...fields };
    this.items.set(category.id, category);
    return category;
  }

  async update(id: string, fields: CategoryFields): Promise<Category> {
    const updated = { ...this.items.get(id)!, ...fields };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
    for (const p of this.products?.items.values() ?? []) {
      if (p.categoryId === id) this.products!.items.set(p.id, { ...p, categoryId: null });
    }
  }
}

export class FakeFileStorage implements FileStorage {
  readonly objects = new Set<string>();
  readonly signed: { bucket: Bucket; path: string }[] = [];
  readonly removed: { bucket: Bucket; paths: string[] }[] = [];
  readonly downloads: ({ bucket: Bucket; path: string } & SignedDownloadOptions)[] = [];

  /** Simulates the browser finishing its PUT. */
  put(bucket: Bucket, path: string) {
    this.objects.add(`${bucket}/${path}`);
  }

  async createSignedUpload(bucket: Bucket, path: string): Promise<SignedUpload> {
    this.signed.push({ bucket, path });
    return { path, token: `token-for-${path}` };
  }

  async createSignedDownload(bucket: Bucket, path: string, options: SignedDownloadOptions): Promise<string> {
    this.downloads.push({ bucket, path, ...options });
    return `https://storage.test/${bucket}/${path}?ttl=${options.expiresInSeconds}`;
  }

  async exists(bucket: Bucket, path: string): Promise<boolean> {
    return this.objects.has(`${bucket}/${path}`);
  }

  async remove(bucket: Bucket, paths: string[]): Promise<void> {
    this.removed.push({ bucket, paths });
    for (const p of paths) this.objects.delete(`${bucket}/${p}`);
  }
}

export class FakeMailSender implements MailSender {
  readonly sent: MailMessage[] = [];
  /** Set to make the next sends fail, like Resend being down. */
  failWith: Error | null = null;

  async send(message: MailMessage): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

/** Reads products (and their files) from the product fake, like the SQL joins do. */
export class InMemoryEntitlementRepository implements EntitlementRepository {
  readonly items: Entitlement[] = [];

  constructor(private readonly products: InMemoryProductRepository) {}

  async grant(input: NewEntitlement): Promise<{ entitlement: Entitlement; created: boolean }> {
    const existing = this.items.find((e) => e.email === input.email && e.productId === input.productId);
    if (existing) return { entitlement: existing, created: false };
    const entitlement: Entitlement = { id: nextId(), ...input, createdAt: new Date() };
    this.items.push(entitlement);
    return { entitlement, created: true };
  }

  async revoke(id: string): Promise<Entitlement | null> {
    const index = this.items.findIndex((e) => e.id === id);
    return index === -1 ? null : this.items.splice(index, 1)[0];
  }

  async listForProduct(productId: string): Promise<Entitlement[]> {
    return this.items.filter((e) => e.productId === productId);
  }

  async has(email: string, productId: string): Promise<boolean> {
    return this.items.some((e) => e.email === email && e.productId === productId);
  }

  async library(email: string): Promise<LibraryItem[]> {
    return this.items
      .filter((e) => e.email === email)
      .map((e) => {
        const p = this.products.items.get(e.productId)!;
        return {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          coverPath: p.images[0]?.storagePath ?? null,
          files: p.files.map((f) => ({ id: f.id, filename: f.filename, sizeBytes: f.sizeBytes })),
          grantedAt: e.createdAt,
        };
      });
  }

  async findFile(fileId: string): Promise<DeliverableFile | null> {
    for (const p of this.products.items.values()) {
      const f = p.files.find((x) => x.id === fileId);
      if (f) return { id: f.id, productId: p.id, storagePath: f.storagePath, filename: f.filename };
    }
    return null;
  }
}
