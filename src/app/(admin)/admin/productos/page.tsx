import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { coverImage } from '@/domain/catalog/product';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Productos' };
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const products = await container.catalog.admin.list(q);

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

      {products.length === 0 ? (
        <p className="text-neutral-500">{q ? 'Sin resultados.' : 'Todavía no hay productos. Creá el primero.'}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.map((p) => {
                const cover = coverImage(p);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
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
                        <span>
                          <span className="block font-medium">{p.name}</span>
                          <span className="block text-xs text-neutral-500">/{p.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.kind === 'digital' ? 'info' : 'neutral'}>
                        {p.kind === 'digital' ? 'PDF' : 'Físico'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.priceCents)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.kind === 'digital' ? '∞' : p.stock}</td>
                    <td className="px-4 py-3">
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
