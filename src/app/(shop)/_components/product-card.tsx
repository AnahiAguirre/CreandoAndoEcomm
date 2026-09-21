import Image from 'next/image';
import Link from 'next/link';

import { isDigital, isInStock, type Product } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';

interface Props {
  product: Product;
  /** Already-resolved URL of the cover image, or null when the product has none. */
  coverUrl: string | null;
}

export function ProductCard({ product, coverUrl }: Props) {
  const available = isInStock(product);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">Sin imagen</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium">
          {isDigital(product) ? 'PDF imprimible' : 'Juguete'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h2 className="font-medium leading-tight">{product.name}</h2>
        <p className="mt-auto text-lg font-semibold">{formatPrice(product.priceCents)}</p>
        {!available && <p className="text-xs text-red-600">Sin stock</p>}
      </div>
    </Link>
  );
}
