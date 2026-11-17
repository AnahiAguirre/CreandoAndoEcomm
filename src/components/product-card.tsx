import Image from 'next/image';
import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { PaintedFlower } from '@/components/illustrations/painted-sheets';
import type { CartProductPublic } from '@/components/cart/types';
import { softCard } from '@/components/ui/soft-card';
import { isDigital, isInStock, type Product } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';

const buyButton =
  'mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-azul px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-suave hover:bg-azul-dark hover:text-white active:scale-[0.97]';

/**
 * The small line above a product's name: its category ("Libros", "Rompecabezas"…),
 * or just what kind of product it is when it has none.
 */
export function productLabel(product: Pick<Product, 'kind'>, categoryName?: string): string {
  return categoryName ?? (isDigital(product) ? 'Imprimible PDF' : 'Juguete');
}

/** What the browser needs to put this product in the cart. */
export function toCartProduct(product: Product, imageUrl: string | null): CartProductPublic {
  const { id, slug, name, kind, priceCents, stock } = product;
  return { id, slug, name, kind, priceCents, stock, imageUrl };
}

interface Props {
  product: Product;
  /** Public URL of its cover photo, if it has one. */
  imageUrl: string | null;
  sizes: string;
  /** The name of its category, shown above the product's name. */
  categoryName?: string;
}

/**
 * A product in a grid, on the home and in the catalog: photo, name and price
 * lead to its page, and the button adds it to the cart right there.
 */
export function ProductCard({ product, imageUrl, sizes, categoryName }: Props) {
  return (
    <article className={`flex h-full flex-col gap-3 p-3 ${softCard}`}>
      <Link href={`/producto/${product.slug}`} className="group flex flex-1 flex-col gap-3 text-tinta hover:text-tinta">
        <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes={sizes}
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : isDigital(product) ? (
            // A printable with no photo yet: a colored-in sheet, so it still reads as a product.
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex aspect-[3/4] h-[78%] items-center justify-center rounded-md bg-white shadow-[0_14px_30px_-18px_rgb(26_23_20/0.45)]">
                <PaintedFlower className="w-[70%]" firstTurn={0} />
              </span>
            </span>
          ) : (
            // No photo loaded yet: the logo, faded, so the card never looks broken.
            <Image src="/home/logo.jpeg" alt="" fill sizes={sizes} className="object-contain p-[22%] opacity-40 mix-blend-multiply" />
          )}
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-tinta-soft">
            {productLabel(product, categoryName)}
          </span>
          <span className="font-semibold leading-snug">{product.name}</span>
          <span className="font-bold">{formatPrice(product.priceCents)}</span>
          {!isInStock(product) && <span className="text-sm font-medium text-rojo">Sin stock</span>}
        </span>
      </Link>
      <AddToCartButton product={toCartProduct(product, imageUrl)} className={buyButton} iconClassName="size-4" />
    </article>
  );
}
