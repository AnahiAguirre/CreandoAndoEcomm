import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/domain/catalog/product';

interface Props {
  products: { product: Product; imageUrl: string | null }[];
}

/** The real catalog on the home: featured first, each one ready to go to the cart. */
export function ProductShowcase({ products }: Props) {
  if (products.length === 0) return null;
  return (
    <section id="destacados" className="scroll-mt-16 bg-arena px-4 py-16 md:py-20">
      <div className="mx-auto max-w-[75rem]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Destacados</h2>
          <Link href={CATALOG_LINKS.todo} className="font-semibold text-azul hover:underline">
            Ver todo el catálogo <span aria-hidden="true">›</span>
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map(({ product, imageUrl }) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                imageUrl={imageUrl}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
