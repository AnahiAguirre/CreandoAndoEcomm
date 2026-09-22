import { and, asc, desc, eq, ilike, ne, or, sql } from 'drizzle-orm';

import type { Product, ProductFile, ProductImage } from '@/domain/catalog/product';
import type { ProductInput } from '@/domain/catalog/product-input';
import type { AdminProduct, NewProductFile, ProductRepository } from '@/domain/catalog/product-repository';

import type { Db } from '../client';
import { productFiles, productImages, products } from '../schema';

type ProductRow = typeof products.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;
type FileRow = typeof productFiles.$inferSelect;

const withImages = { images: { orderBy: asc(productImages.position) } } as const;
const withImagesAndFiles = { ...withImages, files: { orderBy: asc(productFiles.createdAt) } } as const;

function toImage(row: ImageRow): ProductImage {
  return { id: row.id, storagePath: row.storagePath, position: row.position };
}

function toFile(row: FileRow): ProductFile {
  return { id: row.id, storagePath: row.storagePath, filename: row.filename, sizeBytes: row.sizeBytes };
}

function toProduct(row: ProductRow & { images: ImageRow[] }): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    kind: row.kind,
    priceCents: row.priceCents,
    active: row.active,
    stock: row.stock,
    createdAt: row.createdAt,
    images: row.images.map(toImage),
  };
}

function toAdminProduct(row: ProductRow & { images: ImageRow[]; files: FileRow[] }): AdminProduct {
  return {
    ...toProduct(row),
    files: row.files.map(toFile),
    weightG: row.weightG,
    lengthCm: row.lengthCm,
    widthCm: row.widthCm,
    heightCm: row.heightCm,
    updatedAt: row.updatedAt,
  };
}

function toRow(input: ProductInput): Omit<typeof products.$inferInsert, 'id' | 'active' | 'createdAt'> {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    kind: input.kind,
    priceCents: input.price,
    stock: input.stock,
    weightG: input.weightG,
    lengthCm: input.lengthCm,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    updatedAt: new Date(),
  };
}

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: Db) {}

  // ---- storefront ----

  async listActive(): Promise<Product[]> {
    const rows = await this.db.query.products.findMany({
      where: eq(products.active, true),
      orderBy: desc(products.createdAt),
      with: withImages,
    });
    return rows.map(toProduct);
  }

  async findActiveBySlug(slug: string): Promise<Product | null> {
    const row = await this.db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.active, true)),
      with: withImages,
    });
    return row ? toProduct(row) : null;
  }

  // ---- admin ----

  async listAll(search?: string): Promise<AdminProduct[]> {
    const pattern = search ? `%${search}%` : undefined;
    const rows = await this.db.query.products.findMany({
      where: pattern ? or(ilike(products.name, pattern), ilike(products.slug, pattern)) : undefined,
      orderBy: desc(products.createdAt),
      with: withImagesAndFiles,
    });
    return rows.map(toAdminProduct);
  }

  async findById(id: string): Promise<AdminProduct | null> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.id, id),
      with: withImagesAndFiles,
    });
    return row ? toAdminProduct(row) : null;
  }

  async slugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.db.query.products.findFirst({
      columns: { id: true },
      where: excludeId ? and(eq(products.slug, slug), ne(products.id, excludeId)) : eq(products.slug, slug),
    });
    return Boolean(row);
  }

  async create(input: ProductInput): Promise<AdminProduct> {
    const [row] = await this.db.insert(products).values(toRow(input)).returning({ id: products.id });
    return (await this.findById(row.id))!;
  }

  async update(id: string, input: ProductInput): Promise<AdminProduct> {
    await this.db.update(products).set(toRow(input)).where(eq(products.id, id));
    return (await this.findById(id))!;
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.db.update(products).set({ active, updatedAt: new Date() }).where(eq(products.id, id));
  }

  async addImage(productId: string, storagePath: string): Promise<ProductImage> {
    // Append at the end: position = max + 1 for this product.
    const [row] = await this.db
      .insert(productImages)
      .values({
        productId,
        storagePath,
        position: sql<number>`coalesce((select max(${productImages.position}) + 1 from ${productImages} where ${productImages.productId} = ${productId}), 0)`,
      })
      .returning();
    return toImage(row);
  }

  async removeImage(imageId: string): Promise<ProductImage | null> {
    const [row] = await this.db.delete(productImages).where(eq(productImages.id, imageId)).returning();
    return row ? toImage(row) : null;
  }

  async addFile(productId: string, file: NewProductFile): Promise<ProductFile> {
    const [row] = await this.db
      .insert(productFiles)
      .values({ productId, ...file })
      .returning();
    return toFile(row);
  }

  async removeFile(fileId: string): Promise<ProductFile | null> {
    const [row] = await this.db.delete(productFiles).where(eq(productFiles.id, fileId)).returning();
    return row ? toFile(row) : null;
  }
}
