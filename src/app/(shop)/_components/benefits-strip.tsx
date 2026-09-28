import type { ReactNode } from 'react';

import { Reveal } from '@/components/reveal';

interface Benefit {
  icon: ReactNode;
  title: string;
  detail: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: (
      <>
        <path d="M18 3l3 3-9 9-4 1 1-4z" />
        <path d="M7 17c-2 0-3 1.5-3 4 2.5 0 4-1 4-3" />
      </>
    ),
    title: 'Pintado a mano',
    detail: 'Pieza por pieza',
  },
  {
    icon: (
      <>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
      </>
    ),
    title: 'Envío a domicilio',
    detail: '[Plazo y zonas de envío]',
  },
  {
    icon: (
      <>
        <path d="M12 4v11" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),
    title: 'Descarga inmediata',
    detail: 'PDF listo apenas pagás',
  },
];

/** A quiet strip of trust signals, between the catalog and the picker. */
export function BenefitsStrip() {
  return (
    <section className="border-y border-borde-suave bg-white px-4 py-8">
      <Reveal className="mx-auto grid max-w-[75rem] grid-cols-1 gap-6 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-icono-azul-fondo text-azul">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {b.icon}
              </svg>
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-extrabold">{b.title}</span>
              <span className="text-sm text-tinta-calida">{b.detail}</span>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
