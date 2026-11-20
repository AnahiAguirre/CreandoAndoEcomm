import Link from 'next/link';
import type { ReactNode } from 'react';

import { CATALOG_LINKS } from '@/components/nav-links';
import { Reveal } from '@/components/reveal';

import { pillButton } from './pill-button';
import { SectionHeading, homeContainer, sectionSpacing } from './section-heading';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** What playing with what we choose works on, in the colors of the logo's hands. */
const AREAS: { label: string; bg: string; ink: string; icon: ReactNode }[] = [
  {
    label: 'Motricidad fina',
    bg: 'bg-amarillo-soft',
    ink: 'text-amarillo-tinta',
    icon: (
      <>
        <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" />
        <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0V12" />
        <path d="M14 10.5a1.5 1.5 0 0 1 3 0V12" />
        <path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 15a1.6 1.6 0 0 1 2.6-1.9L8 14.5" />
      </>
    ),
  },
  {
    label: 'Atención',
    bg: 'bg-cielo',
    ink: 'text-azul-dark',
    icon: (
      <>
        <path d="M4 7h3a1 1 0 0 0 1-1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a2 2 0 0 0 0-4h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1" />
      </>
    ),
  },
  {
    label: 'Imaginación',
    bg: 'bg-rosa',
    ink: 'text-rosa-tinta',
    icon: (
      <>
        <path d="M12 3l1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L12 13.5 7.8 16l1.1-4.8L5.2 8l4.9-.4z" />
        <path d="M5 20h14" />
      </>
    ),
  },
  {
    label: 'Juego compartido',
    bg: 'bg-verde-soft',
    ink: 'text-verde',
    icon: (
      <>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20v-1a5 5 0 0 1 10 0v1" />
        <path d="M14 20v-.5a4 4 0 0 1 7 -2.6" />
      </>
    ),
  },
];

/**
 * The end of the home: who chooses the toys, what playing with them works on, and
 * the invitation to pick one, right on the page background.
 */
export function ClosingAbout() {
  return (
    <section className={sectionSpacing}>
      <div className={`${homeContainer} grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16`}>
        <ul className="grid grid-cols-2 gap-3 md:gap-4">
          {/* The tiles come in one after the other, every time the section comes into view. */}
          {AREAS.map((a, i) => (
            <Reveal
              as="li"
              key={a.label}
              repeat
              delay={i * 200}
              className={`flex items-center gap-3 rounded-2xl px-4 py-4 md:px-5 md:py-5 ${a.bg} ${a.ink}`}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className="shrink-0" {...stroke}>
                {a.icon}
              </svg>
              <span className="font-display text-lg font-extrabold leading-tight text-tinta md:text-xl">{a.label}</span>
            </Reveal>
          ))}
        </ul>
        <div>
          <SectionHeading
            title="Jugar también es crecer."
            subtitle="Somos profesionales de la salud. Elegimos cada juguete y cada lámina por lo que estimula, además de lo divertido que es."
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={CATALOG_LINKS.todo} className={pillButton}>
              Elegí el tuyo<span aria-hidden="true">&nbsp;›</span>
            </Link>
            <Link href="/quienes-somos" className="font-semibold text-azul hover:underline">
              Conocé nuestra historia<span aria-hidden="true">&nbsp;›</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
