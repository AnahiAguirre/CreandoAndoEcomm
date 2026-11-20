import Image from 'next/image';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import type { Cents } from '@/domain/shared/money';
import { softCard } from '@/components/ui/soft-card';
import { formatPrice } from '@/lib/format';

import { PaintedFlower } from '@/components/illustrations/painted-sheets';
import { PlayOnView } from './play-on-view';
import { SectionHeading, homeContainer, sectionSpacing } from './section-heading';

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
    detail: 'Rompecabezas, pistas y juegos de madera. Estimulan la motricidad, la atención y la imaginación.',
    cta: 'Ver juguetes',
    bg: 'bg-cielo',
    art: (
      <Image
        src="/home/pista-trenes.png"
        alt=""
        fill
        sizes="(min-width: 768px) 60vw, 90vw"
        // Fills its half edge to edge, so the photo's own pale background never shows as a box.
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ),
  },
  {
    key: 'imprimibles',
    title: 'Imprimibles',
    detail: 'Láminas en PDF para colorear: trazo y creatividad, listas para imprimir. Te llegan al instante.',
    cta: 'Ver imprimibles',
    bg: 'bg-brote',
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

/**
 * Two ways into the catalog, as in the menu, each with the lowest price it starts at.
 * With only one kind for sale it becomes one wide shelf (picture beside the words)
 * instead of a lonely half-empty card.
 */
export function CategoryShop({ prices }: { prices: KindPrices }) {
  // A card with nothing to buy behind it would send people to an empty list.
  const cards = CARDS.filter((c) => prices[c.key] !== null);
  if (cards.length === 0) return null;
  const single = cards.length === 1;

  return (
    // The first section under the hero's track: the same 128px of air as every other gap.
    <section className={`${sectionSpacing} md:pt-32`}>
      <div className={homeContainer}>
        <SectionHeading title="Qué estás buscando" />
        <ul className={`mt-8 grid gap-6 ${single ? '' : 'md:grid-cols-2'}`}>
          {cards.map((c) => (
            <li key={c.key} className="min-w-0">
              <Link
                href={CATALOG_LINKS[c.key]}
                className={`group flex h-full flex-col overflow-hidden ${softCard} text-tinta transition-transform duration-300 hover:-translate-y-1 hover:text-tinta ${
                  single ? 'md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''
                }`}
              >
                <span className={`relative block ${single ? 'aspect-[4/3] md:aspect-auto md:min-h-[360px]' : 'aspect-[4/3]'} ${c.bg}`}>
                  {c.art}
                </span>
                <span className={`flex flex-1 flex-col gap-2 p-5 md:p-8 ${single ? 'md:justify-center' : ''}`}>
                  <span className="font-display text-[28px] font-extrabold leading-tight md:text-4xl">{c.title}</span>
                  <span className="max-w-[40ch] text-pretty text-tinta-medio md:text-lg">{c.detail}</span>
                  <span className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="text-tinta-medio">
                      desde <strong className="font-display text-xl font-extrabold text-tinta">{formatPrice(prices[c.key]!)}</strong>
                    </span>
                    <span className="font-semibold text-azul group-hover:underline">
                      {c.cta}
                      <span aria-hidden="true">&nbsp;›</span>
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
