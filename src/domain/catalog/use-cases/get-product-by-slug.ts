import { DomainError } from '@/domain/shared/errors';

import type { Product } from '../product';
import type { ProductRepository } from '../product-repository';

export class ProductNotFoundError extends DomainError {
  constructor(readonly identifier: string) {
    super(`Product not found: ${identifier}`, 'PRODUCT_NOT_FOUND');
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
