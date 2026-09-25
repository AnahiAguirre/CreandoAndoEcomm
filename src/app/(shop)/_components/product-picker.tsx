'use client';

import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { pillButton } from './pill-button';

interface Option {
  label: string;
  points: { title: string; body: string }[];
  product: string;
  price: string;
  cta: string;
  href: string;
}

type Kind = 'toy' | 'printable';

interface Props {
  toyHref: string;
  printablesHref: string;
}

/** "¿Qué llevás hoy?": a segmented control that swaps between the two kinds of product. */
export function ProductPicker({ toyHref, printablesHref }: Props) {
  const [kind, setKind] = useState<Kind>('toy');

  const options: Record<Kind, Option> = {
    toy: {
      label: 'Juguete de madera',
      points: [
        { title: 'Pintado a mano', body: 'Madera pintada a mano, pieza por pieza.' },
        { title: 'Envío a domicilio', body: '[Plazo y zonas de envío]' },
      ],
      product: 'Rompecabezas',
      price: '$18.500',
      cta: 'Comprar',
      href: toyHref,
    },
    printable: {
      label: 'Imprimible en PDF',
      points: [
        { title: 'Descarga inmediata', body: 'Pagás y el PDF queda listo en Mis descargas.' },
        { title: 'Listo para A4', body: 'Láminas pensadas para imprimir en casa, sin ajustar nada.' },
      ],
      product: 'Cuadernos para colorear',
      price: 'desde $2.200',
      cta: 'Ver imprimibles',
      href: printablesHref,
    },
  };
  const current = options[kind];

  return (
    <section
      id="comprar"
      className="flex scroll-mt-14 flex-col items-center bg-arena px-4 py-24 md:h-[700px] md:pb-0 md:pt-24"
    >
      <h2 className="scroll-rise text-center text-4xl font-extrabold leading-none tracking-[-0.04em] md:text-[64px]">
        ¿Qué llevás hoy?
      </h2>

      <div role="group" aria-label="Tipo de producto" className="scroll-rise mt-9 flex gap-1 rounded-full bg-arena-dark p-1">
        {(Object.keys(options) as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={cn(
              'min-h-11 cursor-pointer rounded-full px-5 text-[15px] font-semibold transition-[background-color,color,box-shadow] duration-400 md:px-[26px] md:text-base',
              kind === k ? 'bg-white text-tinta shadow-[0_2px_8px_rgb(26_23_20/0.12)]' : 'text-tinta-medio hover:text-tinta',
            )}
          >
            {options[k].label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid w-full max-w-[1000px] gap-6 md:grid-cols-3">
        {current.points.map((point) => (
          <div key={point.title} className="flex flex-col gap-2.5 rounded-3xl bg-white p-8">
            <span className="text-[22px] font-bold tracking-[-0.02em]">{point.title}</span>
            <span className="text-[17px] leading-[1.45] text-tinta-medio">{point.body}</span>
          </div>
        ))}
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-tinta p-8 text-white">
          <span className="text-[22px] font-bold tracking-[-0.02em]">
            {current.product}
            <br />
            <span className="font-medium text-tinta-muted">{current.price}</span>
          </span>
          <Link href={current.href} className={cn(pillButton, 'self-start px-6 py-3 text-[17px]')}>
            {current.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
