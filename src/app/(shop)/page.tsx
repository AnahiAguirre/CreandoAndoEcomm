import { Reveal } from '@/components/reveal';
import { coverImage, type Product } from '@/domain/catalog/product';
import { container } from '@/lib/container';

import { ProductCard } from './_components/product-card';
import { ProductShowcase } from './_components/product-showcase';

// The catalog is edited from the admin panel and must reflect changes
// immediately, so render per request. Caching comes later with tags.
export const dynamic = 'force-dynamic';

/** How many products get a full section of their own before the grid takes over. */
const SHOWCASED = 3;

export default async function HomePage() {
  const products = await container.catalog.list.execute();
  const cover = (p: Product) => {
    const image = coverImage(p);
    return image ? container.assetUrls.publicImageUrl(image.storagePath) : null;
  };

  const showcased = products.slice(0, SHOWCASED);
  const rest = products.slice(SHOWCASED);

  if (products.length === 0) {
    return (
      <section className="px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Todavía no hay productos publicados</h1>
        <p className="mt-3 text-tinta-soft">Cargalos desde el panel de administración.</p>
      </section>
    );
  }

  return (
    <>
      {showcased.map((product, i) => (
        <ProductShowcase
          key={product.id}
          product={product}
          imageUrl={cover(product)}
          tone={i % 2 === 0 ? 'light' : 'sand'}
          priority={i === 0}
        />
      ))}

      {rest.length > 0 && (
        <section className={showcased.length % 2 === 0 ? 'bg-white' : 'bg-arena'}>
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Todo el catálogo</h2>
            </Reveal>

            <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <Reveal as="li" key={p.id} delay={Math.min(i, 3) * 70}>
                  <ProductCard product={p} coverUrl={cover(p)} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
