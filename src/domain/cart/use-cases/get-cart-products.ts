import type { CartProduct } from '@/domain/cart/cart';
import { coverImage, type Product } from '@/domain/catalog/product';
import type { ProductRepository } from '@/domain/catalog/product-repository';

export interface CartProductView extends CartProduct {
  /** Storage path of the cover photo, if any. The caller turns it into a URL. */
  coverPath: string | null;
}

/** Looks up the current, public state of the products a browser's cart refers to. */
export class GetCartProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(ids: string[]): Promise<CartProductView[]> {
    const found = await this.products.findActiveByIds([...new Set(ids)]);
    return found.map(toView);
  }
}

function toView(p: Product): CartProductView {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    priceCents: p.priceCents,
    stock: p.stock,
    coverPath: coverImage(p)?.storagePath ?? null,
  };
}
