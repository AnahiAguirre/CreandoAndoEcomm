import { Reveal } from '@/components/reveal';

import { DinoArt, FishArt, FlowerArt } from './line-art';

const sheet =
  'absolute left-1/2 top-0 grid aspect-[3/4] w-[44%] max-w-[300px] place-items-center rounded-lg bg-white text-tinta shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)] ring-1 ring-madera-dark';

/** Three coloring sheets stacked on arrival that open like a fan as they come into view. */
export function PrintablesFan() {
  return (
    <section id="imprimibles" className="scroll-mt-14 overflow-hidden bg-white px-4 py-24 md:py-32">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-sm">Imprimibles en PDF</p>
        <h2 className="mt-3 text-5xl font-extrabold leading-none tracking-[-0.045em] md:text-8xl">Imprimí. Pintá. Repetí.</h2>
        <p className="mt-5 text-pretty text-lg text-tinta-soft md:text-2xl">
          PDF listo para imprimir en A4. Entrega inmediata después del pago.
        </p>
      </Reveal>

      <div className="relative mx-auto mt-14 aspect-[2/1] w-full max-w-4xl">
        {/* Base transforms (centering included) are the fanned-out state; .fan-page animates from the centered stack. */}
        <div className={`fan-page ${sheet} [transform:translateX(-130%)_rotate(-11deg)]`}>
          <FishArt className="w-3/4" />
        </div>
        <div className={`fan-page ${sheet} [transform:translateX(30%)_rotate(11deg)]`}>
          <DinoArt className="w-3/4" />
        </div>
        <div className={`fan-page ${sheet} [transform:translate(-50%,-2%)]`}>
          <FlowerArt className="w-3/4" />
        </div>
      </div>
    </section>
  );
}
