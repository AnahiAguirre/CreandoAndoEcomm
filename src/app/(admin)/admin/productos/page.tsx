import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { coverImage } from '@/domain/catalog/product';
import { container } from '@/lib/container';

import { BulkPriceAdjust } from './_components/bulk-price-adjust';
import { PriceCell } from './_components/price-cell';

export const metadata: Metadata = { title: 'Productos' };
export const dynamic = 'force-dynamic';

/** A data cell; in the card layout it shows its column's name above the value. */
const cell =
  'px-4 py-3 @max-2xl:flex @max-2xl:flex-col @max-2xl:items-start @max-2xl:gap-1 @max-2xl:p-0 @max-2xl:before:text-xs @max-2xl:before:font-medium @max-2xl:before:uppercase @max-2xl:before:tracking-wide @max-2xl:before:text-neutral-500';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const [products, categories] = await Promise.all([
    container.catalog.admin.list(q),
    container.catalog.categories.list(),
  ]);
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo" className={buttonVariants()}>
          Nuevo producto
        </Link>
      </div>

      <form className="flex max-w-md gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder="Buscar por nombre o slug…" aria-label="Buscar" />
        <button type="submit" className={buttonVariants({ variant: 'secondary' })}>
          Buscar
        </button>
      </form>

      {products.length > 0 && <BulkPriceAdjust productIds={products.map((p) => p.id)} filtered={q.trim() !== ''} />}

      {products.length === 0 ? (
        <p className="text-neutral-500">{q ? 'Sin resultados.' : 'Todavía no hay productos. Creá el primero.'}</p>
      ) : (
        // Below ~42rem of width (a phone, or a narrow window) each row becomes a card:
        // the header row goes away and every cell carries its own label.
        <div
          role="region"
          aria-label="Lista de productos"
          tabIndex={0}
          className="@container overflow-x-auto rounded-xl border border-black/10 bg-white"
        >
          <table className="w-full text-sm @max-2xl:block">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500 @max-2xl:hidden">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 @max-2xl:block">
              {products.map((p) => {
                const cover = coverImage(p);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-neutral-50 @max-2xl:grid @max-2xl:grid-cols-2 @max-2xl:gap-x-4 @max-2xl:gap-y-2 @max-2xl:p-4"
                  >
                    <th scope="row" className="px-4 py-3 text-left font-normal @max-2xl:col-span-2 @max-2xl:p-0">
                      <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3">
                        <span className="relative block size-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                          {cover && (
                            <Image
                              src={container.assetUrls.publicImageUrl(cover.storagePath)}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium">{p.name}</span>
                          <span className="block break-all text-xs text-neutral-500">/{p.slug}</span>
                        </span>
                      </Link>
                    </th>
                    <td className={`${cell} text-neutral-600 @max-2xl:before:content-['Categoría']`}>
                      {(p.categoryId && categoryNames.get(p.categoryId)) || <span className="text-neutral-400">—</span>}
                    </td>
                    <td className={`${cell} @max-2xl:before:content-['Tipo']`}>
                      <Badge tone={p.kind === 'digital' ? 'info' : 'neutral'}>
                        {p.kind === 'digital' ? 'PDF' : 'Físico'}
                      </Badge>
                    </td>
                    <td className={`${cell} text-right @max-2xl:text-left @max-2xl:before:content-['Precio']`}>
                      <PriceCell productId={p.id} priceCents={p.priceCents} />
                    </td>
                    <td className={`${cell} text-right tabular-nums @max-2xl:text-left @max-2xl:before:content-['Stock']`}>
                      {p.kind === 'digital' ? '∞' : p.stock}
                    </td>
                    <td className={`${cell} @max-2xl:before:content-['Estado']`}>
                      <Badge tone={p.active ? 'success' : 'warning'}>{p.active ? 'Publicado' : 'Borrador'}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
