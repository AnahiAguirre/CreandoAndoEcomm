import type { Product } from '../product';
import type { ProductRepository } from '../product-repository';

export class ProductNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`Product not found: ${slug}`);
    this.name = 'ProductNotFoundError';
  }
}

export class GetProductBySlug {
  constructor(private readonly products: ProductRepository) {}

  async execute(slug: string): Promise<Product> {
    const product = await this.products.findActiveBySlug(slug);
    if (!product) throw new ProductNotFoundError(slug);
    return product;
  }
}
