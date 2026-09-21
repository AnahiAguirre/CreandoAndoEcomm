import type { Product } from '../product';
import type { ProductRepository } from '../product-repository';

export class ListCatalog {
  constructor(private readonly products: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.products.listActive();
  }
}
