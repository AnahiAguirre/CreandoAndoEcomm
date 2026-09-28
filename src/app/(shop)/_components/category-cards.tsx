import Link from 'next/link';
import type { ReactNode } from 'react';

import { CarPuzzle } from './illustrations/car-puzzle';
import { ColoringSheet } from './illustrations/coloring-sheet';
import { Stage } from './illustrations/stage';
import { TrainTrackArt } from './illustrations/train-track';

interface Category {
  href: string;
  bg: string;
  title: string;
  desc: string;
  cta: string;
  art: ReactNode;
}

const CATEGORIES: Category[] = [
  {
    href: '/#armar',
    bg: 'bg-categoria-rompecabezas',
    title: 'Rompecabezas',
    desc: 'Piezas grandes de madera, fáciles de agarrar. Para armar, desarmar y volver a armar.',
    cta: 'Ver rompecabezas',
    art: (
      <Stage width={600} height={620} className="[--s:0.36]">
        <CarPuzzle motion="drop" />
      </Stage>
    ),
  },
  {
    href: '/#pistas',
    bg: 'bg-categoria-pistas',
    title: 'Pistas de tren',
    desc: 'Tramos de madera que encastran: subidas, bajadas y un recorrido nuevo cada día.',
    cta: 'Ver pistas',
    art: <TrainTrackArt className="w-[250px] rounded-[28px]" />,
  },
  {
    href: '/#imprimibles',
    bg: 'bg-amarillo-crema',
    title: 'Imprimibles',
    desc: 'Cuadernos para colorear en PDF, listos para imprimir en A4.',
    cta: 'Ver imprimibles',
    art: (
      <Stage width={420} height={560} className="[--s:0.4]">
        <ColoringSheet />
      </Stage>
    ),
  },
];

/** Three doors into the catalog: rompecabezas, pistas y imprimibles. */
export function CategoryCards() {
  return (
    <section className="bg-white px-4 py-[88px] md:pb-24">
      <div className="mx-auto max-w-[75rem]">
        <h2 className="text-4xl font-bold md:text-[40px]">Explorá por categoría</h2>
        <p className="mt-2 text-lg text-tinta-calida md:text-[17px]">
          Juguetes de madera e imprimibles para jugar y aprender sin pantallas.
        </p>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group flex flex-col overflow-hidden rounded-[20px] text-tinta ring-1 ring-borde-suave transition-transform duration-[600ms] ease-suave hover:-translate-y-1.5 hover:text-tinta hover:shadow-[0_20px_40px_-32px_rgb(26_23_20/0.35)]"
            >
              <div className={`flex h-60 items-center justify-center overflow-hidden ${c.bg}`}>
                <div className="transition-transform duration-[600ms] ease-suave group-hover:scale-[1.03]">{c.art}</div>
              </div>
              <div className="flex flex-col gap-2 px-6 pb-[26px] pt-[22px]">
                <h3 className="text-[22px] font-bold">{c.title}</h3>
                <span className="text-[15px] leading-normal text-tinta-calida">{c.desc}</span>
                <span className="mt-2.5 text-[15px] font-bold text-azul">
                  {c.cta} <span aria-hidden="true">›</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
