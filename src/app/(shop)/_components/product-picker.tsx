'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Reveal } from '@/components/reveal';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  toy: Option;
  printable: Option;
}

/** "¿Qué llevás hoy?": a segmented control that swaps between the two kinds of product. */
export function ProductPicker({ toy, printable }: Props) {
  const [kind, setKind] = useState<Kind>('toy');
  const options: Record<Kind, Option> = { toy, printable };
  const current = options[kind];

  return (
    <section id="comprar" className="scroll-mt-14 bg-arena px-4 py-24 md:py-32">
      <Reveal className="flex flex-col items-center">
        <h2 className="text-center text-4xl font-extrabold leading-none tracking-[-0.04em] md:text-6xl">¿Qué llevás hoy?</h2>

        <div role="group" aria-label="Tipo de producto" className="mt-9 flex gap-1 rounded-full bg-madera-dark p-1">
          {(Object.keys(options) as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                'min-h-11 rounded-full px-5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-400 ease-suave md:px-7 md:text-base',
                kind === k ? 'bg-white text-tinta shadow-[0_2px_8px_rgb(26_23_20/0.12)]' : 'text-tinta-soft hover:text-tinta',
              )}
            >
              {options[k].label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* key: remount on switch so the cards fade in again. */}
      <div key={kind} className="hero-in mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3 md:gap-6">
        {current.points.map((point) => (
          <div key={point.title} className="flex flex-col gap-2.5 rounded-3xl bg-white p-8">
            <h3 className="text-xl font-bold tracking-tight">{point.title}</h3>
            <p className="leading-relaxed text-tinta-soft">{point.body}</p>
          </div>
        ))}
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-tinta p-8 text-white">
          <p className="text-xl font-bold tracking-tight">
            {current.product}
            <span className="block font-medium text-tinta-muted">{current.price}</span>
          </p>
          <Link href={current.href} className={cn(buttonVariants(), 'self-start bg-azul hover:bg-azul/85')}>
            {current.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
