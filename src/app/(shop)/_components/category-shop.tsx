import Image from 'next/image';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import type { Cents } from '@/domain/shared/money';
import { softCard } from '@/components/ui/soft-card';
import { formatPrice } from '@/lib/format';

import { PaintedFlower } from '@/components/illustrations/painted-sheets';
import { PlayOnView } from './play-on-view';
import { SectionHeading, sectionSpacing } from './section-heading';

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
    detail: 'Rompecabezas, pistas y juegos de madera.\nEstimulan la motricidad, la atención y la imaginación.',
    cta: 'Ver juguetes',
    bg: 'bg-[#dcebf7]',
    art: (
      <Image
        src="/home/pista-trenes.png"
        alt=""
        fill
        sizes="(min-width: 768px) 45vw, 90vw"
        className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
      />
    ),
  },
  {
    key: 'imprimibles',
    title: 'Imprimibles',
    detail: 'Láminas en PDF para colorear: trazo y creatividad, listas para imprimir.\nTe llegan al instante.',
    cta: 'Ver imprimibles',
    bg: 'bg-[#e2f0dc]',
    art: (
      <span className="absolute inset-0 flex items-center justify-center">
        {/* The sheet colors itself in each time the card comes into view, like the printables section. */}
        <PlayOnView className="flex aspect-[3/4] h-[78%] items-center justify-center rounded-lg bg-white text-tinta shadow-[0_20px_40px_-20px_rgb(26_23_20/0.4)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
          <PaintedFlower className="w-[70%]" firstTurn={0} />
        </PlayOnView>
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
    <section className={sectionSpacing}>
      <div className="mx-auto max-w-[75rem]">
        <SectionHeading eyebrow="La tienda" title="Qué estás buscando" />
        <ul className={`mt-6 grid gap-5 ${cards.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {cards.map((c) => (
            <li key={c.key}>
              <Link
                href={CATALOG_LINKS[c.key]}
                className={`group flex h-full flex-col overflow-hidden ${softCard} text-tinta transition-transform duration-300 hover:-translate-y-1 hover:text-tinta`}
              >
                <span className={`relative block aspect-[5/2] md:aspect-[2/1] ${c.bg}`}>{c.art}</span>
                <span className="flex flex-1 flex-col gap-1 p-4 md:p-5">
                  <span className="text-xl font-bold">{c.title}</span>
                  <span className="whitespace-pre-line text-sm text-tinta-medio">{c.detail}</span>
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
