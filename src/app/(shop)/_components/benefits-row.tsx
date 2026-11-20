import type { ReactNode } from 'react';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const BENEFITS: { title: string; detail: string; icon: ReactNode }[] = [
  {
    title: 'Envíos a todo el país',
    detail: 'Por Correo Argentino',
    icon: (
      <>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
        <path d="M1 10h4M1 13h3" />
      </>
    ),
  },
  {
    title: 'Retiro en el local',
    detail: 'Sin costo',
    icon: (
      <>
        <path d="M4 10l1.5-5h13L20 10" />
        <path d="M4 10a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
        <path d="M5 12v8h14v-8" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    title: 'Compra segura',
    detail: 'Con Mercado Pago',
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

/** What a buyer wants to know before paying, right under the first screen. */
export function BenefitsRow() {
  return (
    <section className="px-4 pt-10 md:pt-12">
      <ul className="mx-auto grid max-w-[75rem] gap-5 sm:grid-cols-3 sm:gap-0">
        {BENEFITS.map((b) => (
          <li
            key={b.title}
            className="flex items-center gap-4 sm:justify-center sm:border-l sm:border-tinta/10 sm:px-4 sm:first:border-l-0"
          >
            <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true" className="shrink-0 text-tinta" {...stroke}>
              {b.icon}
            </svg>
            <span className="flex flex-col">
              <span className="font-display text-lg font-extrabold leading-tight text-tinta">{b.title}</span>
              <span className="text-[15px] text-azul">{b.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
