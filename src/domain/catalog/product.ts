import type { Cents } from '@/domain/shared/money';

export const PRODUCT_KINDS = ['physical', 'digital'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export interface ProductImage {
  id: string;
  /** Path inside the public `product-images` bucket. Never a full URL. */
  storagePath: string;
  position: number;
}

/** A downloadable file attached to a digital product (private bucket). */
export interface ProductFile {
  id: string;
  storagePath: string;
  filename: string;
  sizeBytes: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: ProductKind;
  priceCents: Cents;
  active: boolean;
  /** Only meaningful for `physical` products; digital ones are always in stock. */
  stock: number;
  images: ProductImage[];
  createdAt: Date;
}

export function isDigital(product: Pick<Product, 'kind'>): boolean {
  return product.kind === 'digital';
}

export function isInStock(product: Pick<Product, 'kind' | 'stock'>): boolean {
  return isDigital(product) || product.stock > 0;
}

export function coverImage(product: Pick<Product, 'images'>): ProductImage | undefined {
  return [...product.images].sort((a, b) => a.position - b.position)[0];
}
