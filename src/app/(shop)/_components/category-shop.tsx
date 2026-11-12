import Image from 'next/image';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import type { Cents } from '@/domain/shared/money';
import { formatPrice } from '@/lib/format';

import { FlowerArt } from './illustrations/line-art';

export interface KindPrices {
  juguetes: Cents | null;
  imprimibles: Cents | null;
}

interface Card {
  key: keyof KindPrices;
  title: string;
  detail: string;
  cta: string;
  bg: string;
  art: React.ReactNode;
}

const CARDS: Card[] = [
  {
    key: 'juguetes',
    title: 'Juguetes',
    detail: 'Rompecabezas, pistas y juegos de madera que estimulan la motricidad, la atención y la imaginación.',
    cta: 'Ver juguetes',
    bg: 'bg-[#dcebf7]',
    art: (
      <Image
        src="/home/pista-trenes.png"
        alt=""
        fill
        sizes="(min-width: 768px) 45vw, 90vw"
        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
      />
    ),
  },
  {
    key: 'imprimibles',
    title: 'Imprimibles',
    detail: 'Láminas en PDF para colorear: trazo y creatividad, listas para imprimir. Te llegan al instante.',
    cta: 'Ver imprimibles',
    bg: 'bg-[#e2f0dc]',
    art: (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex aspect-[3/4] h-[78%] items-center justify-center rounded-lg bg-white text-tinta shadow-[0_20px_40px_-20px_rgb(26_23_20/0.4)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
          <FlowerArt className="w-[70%]" />
        </span>
      </span>
    ),
  },
];

/** Two ways into the catalog, as in the menu, each with the lowest price it starts at. */
export function CategoryShop({ prices }: { prices: KindPrices }) {
  // A card with nothing to buy behind it would send people to an empty list.
  const cards = CARDS.filter((c) => prices[c.key] !== null);
  if (cards.length === 0) return null;

  return (
    <section className="bg-white px-4 py-10 md:py-12">
      <div className="mx-auto max-w-[75rem]">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Qué estás buscando</h2>
        <ul className={`mt-6 grid gap-5 ${cards.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {cards.map((c) => (
            <li key={c.key}>
              <Link
                href={CATALOG_LINKS[c.key]}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-borde-suave bg-white text-tinta transition-shadow duration-300 hover:text-tinta hover:shadow-[0_24px_50px_-28px_rgb(26_23_20/0.4)]"
              >
                <span className={`relative block aspect-[16/10] md:aspect-[2/1] ${c.bg}`}>{c.art}</span>
                <span className="flex flex-1 flex-col gap-1 p-5">
                  <span className="text-xl font-bold">{c.title}</span>
                  <span className="text-sm text-tinta-medio">{c.detail}</span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-tinta-medio">
                      desde <strong className="text-base text-tinta">{formatPrice(prices[c.key]!)}</strong>
                    </span>
                    <span className="font-semibold text-azul group-hover:underline">
                      {c.cta} <span aria-hidden="true">›</span>
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
