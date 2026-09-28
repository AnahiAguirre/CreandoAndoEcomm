import Image from 'next/image';
import type { ReactNode } from 'react';

import { DinoArt, FishArt } from './illustrations/line-art';

interface PhotoCard {
  kind: 'photo';
  img: string;
  alt: string;
  title: string;
  price: string;
}

interface DrawnCard {
  kind: 'drawn';
  bg: string;
  art: ReactNode;
  title: string;
  price: string;
}

const CARDS: (PhotoCard | DrawnCard)[] = [
  {
    kind: 'photo',
    img: '/home/pista-trenes.png',
    alt: 'Pista de trenes de madera en forma de ocho, con tren, figuras, árboles y señales',
    title: 'Pista de trenes didáctica',
    price: '[PRECIO]',
  },
  {
    kind: 'photo',
    img: '/home/autopista.png',
    alt: 'Autopista de madera con tapete de ciudad, puente, autos, árboles y señales',
    title: 'Autopista didáctica',
    price: '[PRECIO]',
  },
  {
    kind: 'photo',
    img: '/home/rompecabezas-animales.png',
    alt: 'Rompecabezas de madera de animales: tigre, libélula y pez',
    title: 'Rompecabezas de animales',
    price: '[PRECIO]',
  },
  {
    kind: 'drawn',
    bg: 'bg-amarillo-soft',
    art: (
      <div className="flex h-[204px] w-[150px] rotate-3 items-center justify-center rounded-md bg-white shadow-[0_20px_40px_-20px_rgb(26_23_20/0.45)]">
        <FishArt className="w-[126px]" />
      </div>
    ),
    title: 'Cuaderno para colorear: Animales',
    price: '$2.500',
  },
  {
    kind: 'drawn',
    bg: 'bg-verde-soft',
    art: (
      <div className="flex h-[204px] w-[150px] -rotate-3 items-center justify-center rounded-md bg-white shadow-[0_20px_40px_-20px_rgb(26_23_20/0.45)]">
        <DinoArt className="w-[132px]" />
      </div>
    ),
    title: 'Cuaderno para colorear: Dinosaurios',
    price: '$2.200',
  },
];

const card =
  'flex h-[440px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] bg-white ring-1 ring-borde-suave transition-[transform,box-shadow] duration-[600ms] ease-suave hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-36px_rgb(26_23_20/0.55)] md:w-[300px]';

/**
 * The catalog's favorites, in one row. From tablet up the section is tall and
 * its stage sticks, so scrolling down slides the row sideways; on a phone it
 * is a plain swipeable carousel.
 */
export function FavoritesRail() {
  return (
    <section id="elegidos" className="catalog-rail relative scroll-mt-16 bg-elegidos-fondo md:h-[1300px]">
      <div className="flex flex-col justify-center gap-9 overflow-hidden py-16 md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:max-h-[760px] md:py-0">
        <div className="flex items-end justify-between gap-4 px-4 md:px-[120px]">
          <div>
            <h2 className="text-4xl font-bold md:text-[40px]">Los más elegidos</h2>
            <p className="mt-2 text-lg text-tinta-calida md:text-[17px]">Favoritos para jugar, armar y pintar todos los días.</p>
          </div>
          <a href="#elegidos" className="shrink-0 text-base font-bold md:text-[16px]">
            Ver todo el catálogo <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="no-scrollbar snap-x snap-mandatory overflow-x-auto md:overflow-visible">
          <div className="catalog-rail-track flex w-max gap-6 px-4 md:pl-[120px] md:pr-4">
            {CARDS.map((c) => (
              <div key={c.title} className={card}>
                <div className={`flex h-60 items-center justify-center ${c.kind === 'drawn' ? c.bg : 'bg-white'}`}>
                  {c.kind === 'photo' ? (
                    <div className="relative h-60 w-full">
                      <Image src={c.img} alt={c.alt} fill sizes="(min-width: 768px) 300px, 280px" className="object-contain" />
                    </div>
                  ) : (
                    c.art
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 px-5 pb-5 pt-[18px]">
                  <span className="text-base font-bold md:text-[17px]">{c.title}</span>
                  <span className="text-tinta-medio md:text-[16px]">{c.price}</span>
                </div>
              </div>
            ))}

            <a
              href="#elegidos"
              className="flex h-[440px] w-[280px] shrink-0 flex-col justify-between rounded-[18px] bg-tinta p-8 text-white transition-[transform,box-shadow] duration-[600ms] ease-suave hover:-translate-y-1.5 hover:text-white hover:shadow-[0_30px_60px_-36px_rgb(26_23_20/0.55)] md:w-[300px]"
            >
              <span className="font-display text-[32px] font-bold leading-[1.1]">
                Hay más.
                <br />
                <span className="text-tinta-muted">Mirá el catálogo completo.</span>
              </span>
              <span className="flex size-[52px] items-center justify-center rounded-full bg-white text-tinta">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
