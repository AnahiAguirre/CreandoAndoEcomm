import { coverImage } from '@/domain/catalog/product';
import { container } from '@/lib/container';

import { ProductCard } from './_components/product-card';

// The catalog is edited from the admin panel (fase 2) and must reflect changes
// immediately, so render per request. Caching comes later with tags.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await container.catalog.list.execute();

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>
      {products.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay productos publicados.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const cover = coverImage(p);
            return (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  coverUrl={cover ? container.assetUrls.publicImageUrl(cover.storagePath) : null}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
