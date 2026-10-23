import Link from 'next/link';

import { PaintedDino, PaintedFish, PaintedFlower } from './illustrations/painted-sheets';
import { pillButton } from './pill-button';
import { PlayOnView } from './play-on-view';

/**
 * Where the section sends the shopper: the catalog filtered to the printables.
 * It's the category's slug in the admin; if it is ever renamed there, this link breaks.
 */
const PRINTABLES_HREF = '/catalogo?categoria=imprimibles';

// Centered with margins, not a transform, so .fan-page can animate from `none`.
const sheet =
  'fan-page absolute left-1/2 -ml-[75px] flex h-[200px] w-[150px] items-center justify-center rounded-lg bg-white text-tinta ring-1 ring-arena-dark md:-ml-[150px] md:h-[400px] md:w-[300px]';

/**
 * Three coloring sheets stacked on arrival that open like a fan as they come into
 * view, and then get colored in by themselves, one area at a time. The whole fan
 * and the button below lead to the printables.
 */
export function PrintablesFan() {
  return (
    <section className="relative isolate flex flex-col items-center overflow-hidden bg-linear-to-b from-amarillo-crema to-hero-fondo px-4 py-24 md:h-[880px] md:pb-0 md:pt-[100px]">
      {/* Soft color spots behind the sheets (decoration only). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-40 size-72 rounded-full bg-amarillo/30 blur-3xl md:size-96" />
        <div className="absolute -right-20 top-72 size-72 rounded-full bg-[#8cc8ee]/35 blur-3xl md:size-96" />
        <div className="absolute bottom-10 left-1/3 size-64 rounded-full bg-[#f28cb1]/25 blur-3xl md:size-80" />
        <div className="absolute bottom-24 right-1/4 size-56 rounded-full bg-verde/15 blur-3xl md:size-72" />
      </div>

      <p className="scroll-rise text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-[15px]">
        Imprimibles en PDF
      </p>
      <h2 className="scroll-rise mt-3 text-center text-5xl font-extrabold leading-none tracking-[-0.045em] md:text-[80px]">
        Imprimí. Pintá. Repetí.
      </h2>
      <p className="scroll-rise mt-[18px] text-center text-lg text-tinta-medio md:text-[22px]">
        PDF listo para imprimir en A4. Entrega inmediata después del pago.
      </p>

      <Link
        href={PRINTABLES_HREF}
        aria-label="Ver los imprimibles para colorear"
        className="group mt-14 block w-full max-w-[900px] rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta"
      >
        <PlayOnView className="relative h-[240px] transition-transform duration-500 ease-suave group-hover:-translate-y-2 md:h-[440px]">
          <div
            className={`${sheet} top-2.5 shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)] [transform:translateX(-125px)_rotate(-11deg)] md:top-5 md:[transform:translateX(-250px)_rotate(-11deg)]`}
          >
            <PaintedFish className="w-[76%]" firstTurn={4} />
          </div>
          <div
            className={`${sheet} top-2.5 shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)] [transform:translateX(125px)_rotate(11deg)] md:top-5 md:[transform:translateX(250px)_rotate(11deg)]`}
          >
            <PaintedDino className="w-[80%]" firstTurn={7} />
          </div>
          <div className={`${sheet} top-0 shadow-[0_30px_60px_-24px_rgb(26_23_20/0.5)] [transform:translateY(-10px)]`}>
            <PaintedFlower className="w-[76%]" firstTurn={0} />
          </div>
        </PlayOnView>
      </Link>

      <Link href={PRINTABLES_HREF} className={`${pillButton} mt-6`}>
        Ver imprimibles <span aria-hidden="true">&nbsp;›</span>
      </Link>
    </section>
  );
}
