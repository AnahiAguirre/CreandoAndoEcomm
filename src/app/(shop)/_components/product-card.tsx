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
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-madera-dark/35 transition-shadow duration-500 ease-suave hover:shadow-[0_18px_40px_-28px_var(--color-tinta)]"
    >
      <div className="relative aspect-square overflow-hidden bg-madera-soft">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            /* Apple-ish: the photo breathes a little on hover. No tilt, no bounce. */
            className="object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-tinta-soft">Sin foto</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-crema/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
          {isDigital(product) ? 'PDF imprimible' : 'Juguete de madera'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-balance font-medium leading-snug">{product.name}</h3>
        <p className="mt-auto pt-2 text-xl font-bold tracking-tight">{formatPrice(product.priceCents)}</p>
        {!available && <p className="text-xs font-medium text-rojo">Sin stock</p>}
      </div>
    </Link>
  );
}
