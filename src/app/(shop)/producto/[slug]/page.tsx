import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { isDigital, isInStock } from '@/domain/catalog/product';
import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

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
  const images = [...product.images].sort((a, b) => a.position - b.position);
  const available = isInStock(product);

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {images.length === 0 ? (
          <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
            Sin imagen
          </div>
        ) : (
          images.map((img, i) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={container.assetUrls.publicImageUrl(img.storagePath)}
                alt={`${product.name} ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-4">
        <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {isDigital(product) ? 'PDF imprimible · entrega inmediata' : 'Juguete · envío a todo el país'}
        </span>
        <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
        <p className="text-2xl font-semibold">{formatPrice(product.priceCents)}</p>
        {!available && <p className="font-medium text-red-600">Sin stock por el momento</p>}
        <p className="whitespace-pre-line text-neutral-700">{product.description}</p>

        {/* Carrito + checkout llegan en fase 3. */}
        <button
          type="button"
          disabled
          className="mt-4 w-fit rounded-lg bg-black px-5 py-3 font-medium text-white opacity-50"
          title="El carrito llega en la fase 3"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
