import type { Product, ProductFile, ProductImage } from './product';
import type { ProductInput } from './product-input';

/** Admin view: everything, including drafts and the private files. */
export interface AdminProduct extends Product {
  files: ProductFile[];
  weightG: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  updatedAt: Date;
}

export interface NewProductFile {
  storagePath: string;
  filename: string;
  sizeBytes: number;
}

/**
 * Port: how the domain reads and writes the catalog. Implemented in infra (Drizzle).
 * Shoppers only ever see *active* products; the admin methods see everything.
 */
export interface ProductRepository {
  // --- storefront ---
  listActive(): Promise<Product[]>;
  findActiveBySlug(slug: string): Promise<Product | null>;

  // --- admin ---
  listAll(search?: string): Promise<AdminProduct[]>;
  findById(id: string): Promise<AdminProduct | null>;
  slugTaken(slug: string, excludeId?: string): Promise<boolean>;
  create(input: ProductInput): Promise<AdminProduct>;
  update(id: string, input: ProductInput): Promise<AdminProduct>;
  setActive(id: string, active: boolean): Promise<void>;

  addImage(productId: string, storagePath: string): Promise<ProductImage>;
  /** Returns the removed row so the caller can delete the object from storage. */
  removeImage(imageId: string): Promise<ProductImage | null>;
  addFile(productId: string, file: NewProductFile): Promise<ProductFile>;
  removeFile(fileId: string): Promise<ProductFile | null>;
}
