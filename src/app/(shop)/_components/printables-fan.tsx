import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import type { Cents } from '@/domain/shared/money';
import { formatPrice } from '@/lib/format';

import { PaintedDino, PaintedFish, PaintedFlower } from '@/components/illustrations/painted-sheets';
import { pillButton } from './pill-button';
import { PlayOnView } from './play-on-view';
import { SectionHeading, sectionSpacing } from './section-heading';

// Centered with margins, not a transform, so .fan-page can animate from `none`.
const sheet =
  'fan-page absolute left-1/2 -ml-[75px] flex h-[200px] w-[150px] items-center justify-center rounded-lg bg-white text-tinta ring-1 ring-arena-dark md:-ml-[150px] md:h-[400px] md:w-[300px]';

// The side sheets open wide and tilt little, and sit a bit smaller and lower, so all three
// drawings are in view and the flower in the middle stays in front.
const sideShadow = 'shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)]';
const left = '[transform:translateX(-105px)_rotate(-8deg)_scale(.9)] md:[transform:translateX(-270px)_rotate(-8deg)_scale(.9)]';
const right = '[transform:translateX(105px)_rotate(8deg)_scale(.9)] md:[transform:translateX(270px)_rotate(8deg)_scale(.9)]';

/**
 * Three coloring sheets stacked on arrival that open like a fan as they come into
 * view, and then get colored in by themselves, one area at a time. The whole fan
 * and the button above it lead to the printables, with the price they start at.
 */
export function PrintablesFan({ fromPriceCents }: { fromPriceCents: Cents | null }) {
  return (
    // overflow-clip, not hidden: hidden would make the section the scroller of its own
    // scroll-driven animations, and they would freeze halfway.
    <section
      id="imprimibles"
      className={`relative isolate scroll-mt-16 overflow-clip ${sectionSpacing}`}
    >
      {/* Soft color spots behind the sheets (decoration only). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-amarillo/30 blur-3xl md:size-96" />
        <div className="absolute -right-20 top-60 size-72 rounded-full bg-[#8cc8ee]/35 blur-3xl md:size-96" />
        <div className="absolute bottom-10 left-1/3 size-64 rounded-full bg-[#f28cb1]/25 blur-3xl md:size-80" />
        <div className="absolute bottom-24 right-1/4 size-56 rounded-full bg-verde/15 blur-3xl md:size-72" />
      </div>

      <div className="mx-auto max-w-[75rem]">
        <SectionHeading
          eyebrow="Imprimibles en PDF"
          title="Imprimí. Pintá. Repetí."
          subtitle="Láminas listas para imprimir en A4. Te llegan por email apenas pagás."
          aside={
            <div className="flex flex-col items-start gap-1.5">
              <Link href={CATALOG_LINKS.imprimibles} className={pillButton}>
                Comprar imprimibles
                {fromPriceCents !== null && <span className="hidden sm:inline">&nbsp;· desde {formatPrice(fromPriceCents)}</span>}
                <span aria-hidden="true">&nbsp;›</span>
              </Link>
              {/* On a phone the price goes under the button, so the button fits on one line. */}
              {fromPriceCents !== null && (
                <span className="pl-2 text-sm text-tinta-medio sm:hidden">desde {formatPrice(fromPriceCents)}</span>
              )}
            </div>
          }
        />
      </div>

      <Link
        href={CATALOG_LINKS.imprimibles}
        aria-label="Ver los imprimibles para colorear"
        className="group mx-auto mt-14 block w-full max-w-[900px] rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta"
      >
        <PlayOnView className="relative h-[240px] transition-transform duration-500 ease-suave group-hover:-translate-y-2 md:h-[440px]">
          <div className={`${sheet} top-4 md:top-8 ${sideShadow} ${left}`}>
            <PaintedFish className="w-[76%]" firstTurn={4} />
          </div>
          <div className={`${sheet} top-4 md:top-8 ${sideShadow} ${right}`}>
            <PaintedDino className="w-[80%]" firstTurn={7} />
          </div>
          <div className={`${sheet} top-0 shadow-[0_30px_60px_-24px_rgb(26_23_20/0.5)] [transform:translateY(-10px)]`}>
            <PaintedFlower className="w-[76%]" firstTurn={0} />
          </div>
        </PlayOnView>
      </Link>
    </section>
  );
}
