import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/reveal';
import { ProductCard } from '@/components/product-card';
import { coverImage, isDigital } from '@/domain/catalog/product';
import { container } from '@/lib/container';

export const metadata: Metadata = { title: 'Catálogo' };
export const dynamic = 'force-dynamic';

interface Props {
  /** `tipo=juguetes`: every physical product, whatever its category. */
  searchParams: Promise<{ categoria?: string; tipo?: string }>;
}

const chip = 'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ease-suave';

export default async function CatalogPage({ searchParams }: Props) {
  const { categoria, tipo } = await searchParams;
  const toysOnly = tipo === 'juguetes';
  if (tipo && !toysOnly) notFound();
  const categories = await container.catalog.storefrontCategories.execute();
  const selected = categoria ? categories.find((c) => c.slug === categoria) : undefined;
  if (categoria && !selected) notFound();

  const listed = await container.catalog.list.execute({ categoryId: selected?.id });
  const products = toysOnly ? listed.filter((p) => !isDigital(p)) : listed;
  const everything = !selected && !toysOnly;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <Reveal>
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {selected?.name ?? (toysOnly ? 'Juguetes' : 'Catálogo')}
        </h1>
      </Reveal>

      {categories.length > 0 && (
        <nav aria-label="Categorías" className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            aria-current={everything ? 'page' : undefined}
            className={`${chip} ${everything ? 'bg-tinta text-white' : 'bg-arena text-tinta-medio hover:bg-azul hover:text-white'}`}
          >
            Todos
          </Link>
          <Link
            href="/catalogo?tipo=juguetes"
            aria-current={toysOnly ? 'page' : undefined}
            className={`${chip} ${toysOnly ? 'bg-tinta text-white' : 'bg-arena text-tinta-medio hover:bg-azul hover:text-white'}`}
          >
            Todos los juguetes
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalogo?categoria=${c.slug}`}
              aria-current={selected?.id === c.id ? 'page' : undefined}
              className={`${chip} ${selected?.id === c.id ? 'bg-tinta text-white' : 'bg-arena text-tinta-medio hover:bg-azul hover:text-white'}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <p className="mt-8 text-tinta-soft">
          {selected || toysOnly
            ? `Todavía no hay productos en ${selected?.name ?? 'Juguetes'}. ¡Volvé pronto!`
            : 'Estamos preparando los primeros productos. ¡Volvé pronto!'}
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const cover = coverImage(p);
            return (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  imageUrl={cover ? container.assetUrls.publicImageUrl(cover.storagePath) : null}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
