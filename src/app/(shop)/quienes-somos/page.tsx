import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';

export const metadata: Metadata = { title: 'Quiénes somos' };

// We don't make the toys: we are health professionals who choose them for families.
// Still to add: who we are (professions, names, photo), where, and how to reach us.
const STORY = [
  'Somos profesionales de la salud. En nuestro trabajo con peques y familias vemos todos los días cuánto lugar ocupan las pantallas, y lo difícil que es encontrar alternativas que entusiasmen.',
  'Sabemos que el juego es mucho más que entretenimiento: es la forma en que los peques aprenden. Mientras arman, encastran, pintan o inventan, ejercitan la motricidad, la atención, el lenguaje y la manera de vincularse con otros.',
  'Por eso creamos CreandoAndo. No fabricamos los juguetes: los elegimos uno por uno, con la mirada de nuestra profesión, para que además de divertir estimulen el desarrollo. Y para que en casa sea más fácil decirle que sí al juego.',
  'También preparamos imprimibles: láminas y cuadernos para colorear en PDF, que se descargan al instante y se imprimen en casa todas las veces que quieran. Una propuesta simple para una tarde de lluvia, un viaje o una sala de espera.',
];

/** What playing with what we choose works on. Each one is a reason it was picked. */
const AREAS = [
  { title: 'Motricidad fina y coordinación', detail: 'Encastrar, agarrar piezas, trazar y pintar.' },
  { title: 'Atención y resolución de problemas', detail: 'Rompecabezas y recorridos que invitan a pensar, probar y volver a intentar.' },
  { title: 'Lenguaje e imaginación', detail: 'Juego simbólico para inventar historias y ponerles palabras.' },
  { title: 'Vínculo y juego compartido', detail: 'Propuestas para jugar en familia, en la mesa o en el piso, sin pantallas.' },
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
              Jugar también es crecer.
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
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Qué estimula el juego</h2>
          <p className="mt-2 max-w-2xl text-tinta-medio">
            Elegimos cada juguete y cada lámina por lo que aporta, además de lo divertido que es.
          </p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map((v) => (
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
        <p className="max-w-md text-tinta-muted">Juguetes y láminas elegidos por profesionales. Retiro gratis o envío a todo el país.</p>
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
