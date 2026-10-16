import type { CartProduct } from '@/domain/cart/cart';

/** A cart product as the browser sees it: public fields plus a ready-to-use photo URL. */
export interface CartProductPublic extends CartProduct {
  imageUrl: string | null;
}
