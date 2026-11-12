import type { Cents } from '@/domain/shared/money';

import { isDigital, isInStock, type Product } from './product';

/**
 * What the home shows to sell: the products the admin marked as featured, and
 * when there are none (or too few), the newest ones to fill the space. Products
 * without stock go last, so the first thing a buyer sees can be bought.
 */
export function homeShowcase(products: Product[], limit = 8): Product[] {
  const newestFirst = [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const featured = newestFirst.filter((p) => p.featured);
  const rest = newestFirst.filter((p) => !p.featured);
  const picked = [...featured, ...rest].slice(0, limit);
  return [...picked.filter((p) => isInStock(p)), ...picked.filter((p) => !isInStock(p))];
}

/** The one product the home's first screen sells: the first of the showcase that can be bought. */
export function heroProduct(products: Product[]): Product | undefined {
  return homeShowcase(products, products.length).find((p) => isInStock(p));
}

/** The toys the home's carousel rotates: physical, in stock, featured first. */
export function heroToys(products: Product[], limit = 6): Product[] {
  return homeShowcase(products, products.length)
    .filter((p) => !isDigital(p) && isInStock(p))
    .slice(0, limit);
}

/** "desde $X" for a category: the cheapest product in it that can be bought, or `null`. */
export function fromPrice(products: Product[], categoryId: string | undefined): Cents | null {
  if (!categoryId) return null;
  const prices = products.filter((p) => p.categoryId === categoryId && isInStock(p)).map((p) => p.priceCents);
  return prices.length > 0 ? Math.min(...prices) : null;
}
