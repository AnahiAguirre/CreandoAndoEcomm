import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Reveal } from '@/components/reveal';
import { isDigital, isInStock } from '@/domain/catalog/product';
import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

import { ProductGallery } from './_components/product-gallery';

export const dynamic = 'force-dynamic';

interface Props {
  // Next 16: route params are always a Promise.
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    return await container.catalog.getBySlug.execute(slug);
  } catch (err) {
    if (err instanceof ProductNotFoundError) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  const available = isInStock(product);

  const images = [...product.images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ id: img.id, url: container.assetUrls.publicImageUrl(img.storagePath) }));

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <Reveal>
        <Link href="/" className="text-sm text-tinta-soft transition-colors hover:text-tinta">
          ← Volver al catálogo
        </Link>
      </Reveal>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
        <Reveal>
          <ProductGallery images={images} productName={product.name} />
        </Reveal>

        {/* Sticky like an Apple product page: the photos scroll, the buy box stays. */}
        <Reveal delay={90} className="md:sticky md:top-24 md:self-start">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-tinta-soft">
            {isDigital(product) ? 'Imprimible en PDF · entrega inmediata' : 'Juguete de madera · envío a todo el país'}
          </span>

          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold tracking-tight">{formatPrice(product.priceCents)}</p>

          {available ? (
            !isDigital(product) && (
              <p className="mt-1 text-sm font-medium text-verde">
                {product.stock <= 3 ? `Últimas ${product.stock} unidades` : 'Disponible'}
              </p>
            )
          ) : (
            <p className="mt-1 text-sm font-medium text-rojo">Sin stock por el momento</p>
          )}

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-tinta-soft">{product.description}</p>
          )}

          {/* El carrito llega en el próximo paso de la fase 3. */}
          <button
            type="button"
            disabled
            className="mt-8 h-12 w-full rounded-full bg-rojo px-7 font-medium text-white opacity-40 sm:w-auto"
          >
            Agregar al carrito
          </button>
        </Reveal>
      </div>
    </article>
  );
}
