import Image from 'next/image';
import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { CATALOG_LINKS } from '@/components/nav-links';
import { toCartProduct } from '@/components/product-card';
import type { Product } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';

import { pillButton } from './pill-button';

const ghostButton =
  'inline-flex items-center rounded-full border-[1.5px] border-azul bg-white px-[26px] py-[13px] font-medium text-azul transition-colors duration-300 ease-suave hover:bg-ghost-fondo';
const buyButton =
  'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-azul px-6 font-semibold text-white transition-[background-color,transform] duration-300 ease-suave hover:bg-azul-dark hover:text-white active:scale-[0.97]';

interface Props {
  /** The product the first screen sells. Absent when nothing is for sale yet. */
  product: Product | undefined;
  /** Its photo: the catalog's, or the home's own art for it. */
  imageUrl: string | null;
}

/**
 * The first screen: what the shop sells, in one line, and one real product with
 * its price and a button that puts it in the cart. Everything above the fold is
 * a way to buy.
 */
export function ShopHero({ product, imageUrl }: Props) {
  return (
    <section id="top" className="relative overflow-hidden bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-amarillo/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-[#8cc8ee]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[75rem] items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-sm">
            Juguetes de madera · Imprimibles en PDF
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Juguetes para jugar sin pantallas.
          </h1>
          <p className="mt-4 max-w-md text-lg text-tinta-medio">
            Juguetes de madera y láminas para colorear elegidos por profesionales de la salud: divierten y, además, estimulan el desarrollo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={CATALOG_LINKS.todo} className={pillButton}>
              Comprar ahora <span aria-hidden="true">&nbsp;›</span>
            </Link>
            <Link href={CATALOG_LINKS.imprimibles} className={ghostButton}>
              Ver imprimibles
            </Link>
          </div>
        </div>

        {product && (
          <div className="rounded-[2rem] bg-arena p-5 shadow-[0_30px_60px_-30px_rgb(26_23_20/0.35)] md:p-6">
            <Link href={`/producto/${product.slug}`} className="group block text-tinta hover:text-tinta">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    priority
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-tinta-soft">
                Destacado
              </span>
              <span className="mt-1 block text-xl font-bold leading-snug">{product.name}</span>
            </Link>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-2xl font-extrabold">{formatPrice(product.priceCents)}</span>
              <AddToCartButton product={toCartProduct(product, imageUrl)} className={buyButton} iconClassName="size-5" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
