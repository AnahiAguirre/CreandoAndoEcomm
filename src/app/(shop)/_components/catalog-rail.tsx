import Link from 'next/link';

import { CarPuzzleArt } from './illustrations/car-puzzle';
import { DinoArt, FishArt } from './illustrations/line-art';
import { TrainTrackArt } from './illustrations/train-track';

interface Props {
  trackHref: string;
  /** The track's real price, already formatted; null while it isn't in the catalog. */
  trackPrice: string | null;
  animalsHref: string;
  dinosaursHref: string;
}

const card =
  'group flex h-[560px] w-[80vw] max-w-[560px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-white text-tinta transition-[transform,box-shadow] duration-[600ms] ease-suave hover:-translate-y-1.5 hover:text-tinta hover:shadow-[0_30px_60px_-36px_rgb(26_23_20/0.55)] md:h-[600px] md:w-[560px]';
const art = 'flex h-[380px] items-center justify-center md:h-[420px]';
const eyebrow = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-tinta-soft';
const name = 'text-2xl font-bold tracking-[-0.02em] md:text-[28px]';
const price = 'text-lg text-tinta-medio md:text-[19px]';
const sheet =
  'flex h-[340px] w-[250px] items-center justify-center rounded-md bg-white text-tinta shadow-[0_20px_40px_-20px_rgb(26_23_20/0.45)]';

function CardText({ kind, title, detail }: { kind: string; title: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1.5 px-8 py-7">
      <span className={eyebrow}>{kind}</span>
      <span className={name}>{title}</span>
      <span className={price}>{detail}</span>
    </div>
  );
}

/**
 * The catalog in one row. From tablet up the section is tall and its stage
 * sticks, so scrolling down slides the row sideways; on a phone it is a plain
 * swipeable carousel.
 */
export function CatalogRail({ trackHref, trackPrice, animalsHref, dinosaursHref }: Props) {
  return (
    <section id="catalogo" className="catalog-rail relative scroll-mt-14 bg-arena md:h-[1600px]">
      <div className="flex flex-col justify-center gap-10 overflow-hidden py-20 md:sticky md:top-14 md:h-[calc(100svh-3.5rem)] md:max-h-[820px] md:gap-12 md:py-0">
        <div className="flex items-end justify-between gap-4 px-4 md:px-40">
          <h2 className="text-4xl font-extrabold leading-none md:text-[64px]">Todo el catálogo.</h2>
          <a href="#catalogo" className="shrink-0 text-lg text-azul md:text-[19px]">
            Ver todos <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="no-scrollbar snap-x snap-mandatory overflow-x-auto md:overflow-visible">
          <div className="catalog-rail-track flex w-max gap-5 px-4 md:gap-6 md:pl-40 md:pr-40">
            <a href="#comprar" className={card}>
              <div className={`${art} bg-azul-soft`}>
                <CarPuzzleArt className="w-[300px] -rotate-4 drop-shadow-[0_20px_24px_rgb(26_23_20/0.3)] md:w-[340px]" />
              </div>
              <CardText kind="Juguete de madera" title="Rompecabezas de madera" detail="$18.500" />
            </a>

            <Link href={trackHref} className={card}>
              <div className={`${art} bg-verde-menta`}>
                <TrainTrackArt className="w-[320px] rotate-3 rounded-[22px] shadow-[0_20px_40px_-20px_rgb(26_23_20/0.5)] md:w-[360px]" />
              </div>
              <CardText kind="Juguete de madera" title="Pista de tren" detail={trackPrice ?? '[PRECIO]'} />
            </Link>

            <Link href={animalsHref} className={card}>
              <div className={`${art} bg-amarillo-soft`}>
                <div className={`${sheet} rotate-3`}>
                  <FishArt className="w-[210px]" />
                </div>
              </div>
              <CardText kind="Imprimible en PDF" title="Cuaderno para colorear: Animales" detail="$2.500 · descarga inmediata" />
            </Link>

            <Link href={dinosaursHref} className={card}>
              <div className={`${art} bg-verde-soft`}>
                <div className={`${sheet} -rotate-3`}>
                  <DinoArt className="w-[220px]" />
                </div>
              </div>
              <CardText kind="Imprimible en PDF" title="Cuaderno para colorear: Dinosaurios" detail="$2.200 · descarga inmediata" />
            </Link>

            <a href="#catalogo" className={`${card} justify-between bg-tinta p-11 text-white hover:text-white`}>
              <span className="text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[44px]">
                Hay más.
                <br />
                <span className="text-tinta-muted">Mirá el catálogo completo.</span>
              </span>
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-tinta">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
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
