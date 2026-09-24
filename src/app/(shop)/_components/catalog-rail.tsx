import { Reveal } from '@/components/reveal';
import type { Product } from '@/domain/catalog/product';

import { ProductCard } from './product-card';

interface Props {
  products: Product[];
  coverUrl: (product: Product) => string | null;
}

/**
 * The whole catalog in one row. From tablet up the section is tall and its
 * stage sticks, so scrolling down slides the row sideways; on a phone it is a
 * plain swipeable carousel.
 */
export function CatalogRail({ products, coverUrl }: Props) {
  // Enough vertical runway for the row to travel; more products, longer ride.
  const runway = Math.max(160, 60 + products.length * 45);

  return (
    <section
      id="catalogo"
      className="catalog-rail relative scroll-mt-14 bg-arena md:h-[var(--runway)]"
      style={{ '--runway': `${runway}svh` } as React.CSSProperties}
    >
      <div className="flex flex-col justify-center gap-10 overflow-hidden py-20 md:sticky md:top-14 md:h-[calc(100svh-3.5rem)] md:py-0">
        <Reveal className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-4xl font-extrabold leading-none tracking-[-0.04em] md:text-6xl">Todo el catálogo.</h2>
        </Reveal>

        <div className="no-scrollbar overflow-x-auto md:overflow-visible">
          <ul className="catalog-rail-track flex w-max snap-x snap-mandatory gap-5 px-4 md:gap-6 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            {products.map((p) => (
              <li key={p.id} className="w-[78vw] max-w-[26rem] shrink-0 snap-start md:w-[26rem]">
                <ProductCard product={p} coverUrl={coverUrl(p)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
