import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import { container } from '@/lib/container';

import { updateProduct } from '../actions';
import { FileManager } from '../_components/file-manager';
import { ImageManager } from '../_components/image-manager';
import { ProductForm } from '../_components/product-form';
import { PublishToggle } from '../_components/publish-toggle';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

async function loadProduct(id: string) {
  try {
    return await container.catalog.admin.get(id);
  } catch (err) {
    if (err instanceof ProductNotFoundError) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  return { title: product.name };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const product = await loadProduct(id);
  const images = product.images.map((img) => ({
    id: img.id,
    url: container.assetUrls.publicImageUrl(img.storagePath),
  }));

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/productos" className="text-sm text-neutral-500 hover:underline">
            ← Productos
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
          {product.active && (
            <Link href={`/producto/${product.slug}`} target="_blank" className="text-sm text-neutral-500 hover:underline">
              Ver en la tienda ↗
            </Link>
          )}
        </div>
        <PublishToggle productId={product.id} active={product.active} />
      </div>

      {created && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Producto creado como borrador. Cargá las fotos{product.kind === 'digital' ? ' y el PDF' : ''} y después
          publicalo.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <div>
          <h2 className="mb-4 font-semibold">Datos</h2>
          <ProductForm action={updateProduct.bind(null, product.id)} product={product} submitLabel="Guardar cambios" />
        </div>

        <div className="flex flex-col gap-8">
          <ImageManager productId={product.id} images={images} />
          {product.kind === 'digital' && <FileManager productId={product.id} files={product.files} />}
        </div>
      </div>
    </section>
  );
}
