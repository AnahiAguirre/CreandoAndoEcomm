import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import type { Product } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

import { PhotoPuzzle } from './photo-puzzle';

interface Props {
  product: Product;
  imageUrl: string | null;
}

/**
 * Dark, full-width opener. The copy and the photo settle in on load; once you
 * scroll past, the photo shrinks and fades as the next section takes over.
 */
export function HomeHero({ product, imageUrl }: Props) {
  return (
    <section id="top" className="overflow-hidden bg-tinta px-4 pb-24 pt-14 text-white md:pt-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="hero-in text-lg font-semibold text-amarillo md:text-xl">Nuevo</p>
        <h1 className="hero-in mt-2 text-balance text-5xl font-extrabold leading-none tracking-[-0.045em] md:text-8xl">
          {product.name}
        </h1>
        {product.description && (
          <p className="hero-in mt-5 line-clamp-3 max-w-2xl text-pretty text-lg font-medium leading-snug text-tinta-muted [animation-delay:0.15s] md:text-2xl">
            {product.description.split('\n')[0]}
          </p>
        )}
        <div className="hero-in mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 [animation-delay:0.3s]">
          <Link href={`/producto/${product.slug}`} className={cn(buttonVariants({ size: 'lg' }), 'bg-azul hover:bg-azul/85')}>
            Comprar · {formatPrice(product.priceCents)}
          </Link>
          <a href="#armar" className="text-lg text-link-oscuro transition-opacity duration-300 ease-suave hover:opacity-70">
            Mirá cómo se arma <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="hero-out mt-14 w-full">
          {imageUrl ? (
            <div className="hero-puzzle-in relative mx-auto aspect-[3/2] w-full max-w-4xl overflow-hidden rounded-3xl shadow-[0_50px_80px_-20px_rgb(0_0_0/0.6)]">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="hero-puzzle-in mx-auto max-w-[600px] -rotate-5 drop-shadow-[0_50px_80px_rgb(0_0_0/0.55)]">
              <PhotoPuzzle label="Rompecabezas de una granja: granero rojo, sol, árbol y una oveja" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
