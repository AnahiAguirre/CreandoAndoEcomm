import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';
import { buttonVariants } from '@/components/ui/button';
import { isDigital, isInStock, type Product } from '@/domain/catalog/product';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  product: Product;
  imageUrl: string | null;
  /** Alternating backgrounds, the way apple.com stacks its product sections. */
  tone: 'light' | 'sand';
  priority?: boolean;
}

/**
 * One product, one full section: eyebrow, big title, price, two calls to
 * action, and the photo as large as the viewport allows. No card, no frame —
 * the product floats on the background.
 */
export function ProductShowcase({ product, imageUrl, tone, priority = false }: Props) {
  const digital = isDigital(product);
  const available = isInStock(product);

  return (
    <section className={cn('px-4 py-20 md:py-28', tone === 'sand' ? 'bg-arena' : 'bg-white')}>
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft">
            {digital ? 'Imprimible en PDF' : 'Juguete de madera'}
          </p>

          <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            {product.name}
          </h2>

          {product.description && (
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-tinta-soft">
              {firstLine(product.description)}
            </p>
          )}

          <p className="mt-5 text-lg">
            <span className="font-semibold">{formatPrice(product.priceCents)}</span>
            {digital && <span className="text-tinta-soft"> · descarga inmediata</span>}
            {!digital && !available && <span className="text-rojo"> · sin stock</span>}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link href={`/producto/${product.slug}`} className={buttonVariants({ size: 'lg' })}>
              Comprar
            </Link>
            <Link
              href={`/producto/${product.slug}`}
              className="text-azul transition-opacity duration-300 ease-suave hover:opacity-70"
            >
              Ver detalle <span aria-hidden="true">›</span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mt-12 aspect-[16/10] w-full md:mt-16">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-contain mix-blend-multiply"
              />
            ) : (
              <div className="grid h-full place-items-center rounded-3xl bg-madera-soft text-sm text-tinta-soft">
                Sin foto todavía
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The showcase wants one punchy line; the full text lives on the product page. */
function firstLine(description: string): string {
  return description.split('\n')[0];
}
