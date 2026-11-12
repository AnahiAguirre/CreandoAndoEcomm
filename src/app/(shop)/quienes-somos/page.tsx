import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';

export const metadata: Metadata = { title: 'Quiénes somos' };

// PROVISIONAL copy: replace it with the shop's own story, values and contact.
// The photos fall back to the home's drawings until real ones are in /public/quienes-somos.
const STORY = [
  'CreandoAndo nació en un taller chico, con ganas de que los chicos jueguen con las manos: tocar, encastrar, armar, desarmar e inventar.',
  'Cada juguete se corta, se lija y se pinta a mano, pieza por pieza. Por eso no hay dos exactamente iguales.',
  'Las láminas para colorear las dibujamos nosotros, para imprimir en casa todas las veces que quieran.',
];

const VALUES = [
  { title: 'Hechos a mano', detail: 'Cortamos, lijamos y pintamos cada pieza en el taller.' },
  { title: 'Sin pantallas', detail: 'Juguetes para jugar en la mesa, en el piso y en familia.' },
  { title: 'Pensados para durar', detail: 'Madera resistente y piezas grandes, fáciles de agarrar.' },
];

const PHOTOS = [
  { src: '/home/rompecabezas-animales.png', alt: 'Rompecabezas de animales de madera' },
  { src: '/home/pista-trenes.png', alt: 'Pista de trenes de madera' },
  { src: '/home/autopista.png', alt: 'Autopista de madera con autos y señales' },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-arena px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-[75rem] items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-sm">Quiénes somos</p>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-5xl">
              Juguetes hechos a mano, para jugar sin pantallas.
            </h1>
            <div className="mt-6 flex max-w-xl flex-col gap-4 text-lg text-tinta-medio">
              {STORY.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] bg-white">
            <Image src="/home/logo.jpeg" alt="Logo de CreandoAndo" fill priority sizes="384px" className="object-contain p-10" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:py-20">
        <div className="mx-auto max-w-[75rem]">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Cómo lo hacemos</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <li key={v.title} className="rounded-3xl bg-arena p-6">
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="mt-1 text-tinta-medio">{v.detail}</p>
              </li>
            ))}
          </ul>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PHOTOS.map((p) => (
              <li key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-arena">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-contain p-6" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 bg-tinta px-4 py-16 text-center text-white md:py-20">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">¿Lo querés en tu casa?</h2>
        <p className="max-w-md text-tinta-muted">Retiro gratis o envío a todo el país. Los imprimibles te llegan al instante.</p>
        <Link
          href={CATALOG_LINKS.todo}
          className="inline-flex items-center rounded-full bg-azul px-[26px] py-[13px] font-medium text-white transition-colors duration-300 ease-suave hover:bg-azul-dark hover:text-white"
        >
          Ver la tienda <span aria-hidden="true">&nbsp;›</span>
        </Link>
      </section>
    </>
  );
}
