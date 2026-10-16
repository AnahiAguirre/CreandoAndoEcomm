'use server';

import { z } from 'zod';

import type { CartProductPublic } from '@/components/cart/types';
import { container } from '@/lib/container';

// A cart is a handful of lines; anything bigger is not a real cart.
const idsSchema = z.array(z.string().min(1).max(64)).max(50);

/**
 * Public on purpose: it only returns what the catalog already shows to anyone
 * (name, price, stock, photo). The cart itself lives in the browser.
 */
export async function loadCartProducts(ids: string[]): Promise<CartProductPublic[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  const products = await container.cart.products.execute(parsed.data);
  return products.map(({ coverPath, ...p }) => ({
    ...p,
    imageUrl: coverPath ? container.assetUrls.publicImageUrl(coverPath) : null,
  }));
}
