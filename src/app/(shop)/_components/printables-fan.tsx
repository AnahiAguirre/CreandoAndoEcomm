import { DinoArt, FishArt, FlowerArt } from './line-art';

// Centered with margins, not a transform, so .fan-page can animate from `none`.
const sheet =
  'fan-page absolute left-1/2 -ml-[75px] flex h-[200px] w-[150px] items-center justify-center rounded-lg bg-white text-tinta ring-1 ring-arena-dark md:-ml-[150px] md:h-[400px] md:w-[300px]';

/** Three coloring sheets stacked on arrival that open like a fan as they come into view. */
export function PrintablesFan() {
  return (
    <section
      id="imprimibles"
      className="flex scroll-mt-14 flex-col items-center overflow-hidden bg-white px-4 py-24 md:h-[860px] md:pb-0 md:pt-[100px]"
    >
      <p className="scroll-rise text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-[15px]">
        Imprimibles en PDF
      </p>
      <h2 className="scroll-rise mt-3 text-center text-5xl font-extrabold leading-none tracking-[-0.045em] md:text-[80px]">
        Imprimí. Pintá. Repetí.
      </h2>
      <p className="scroll-rise mt-[18px] text-center text-lg text-tinta-medio md:text-[22px]">
        PDF listo para imprimir en A4. Entrega inmediata después del pago.
      </p>

      <div className="relative mt-14 h-[240px] w-full max-w-[900px] md:h-[440px]">
        <div
          className={`${sheet} top-2.5 shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)] [transform:translateX(-125px)_rotate(-11deg)] md:top-5 md:[transform:translateX(-250px)_rotate(-11deg)]`}
        >
          <FishArt className="w-[76%]" />
        </div>
        <div
          className={`${sheet} top-2.5 shadow-[0_24px_50px_-24px_rgb(26_23_20/0.45)] [transform:translateX(125px)_rotate(11deg)] md:top-5 md:[transform:translateX(250px)_rotate(11deg)]`}
        >
          <DinoArt className="w-[80%]" />
        </div>
        <div className={`${sheet} top-0 shadow-[0_30px_60px_-24px_rgb(26_23_20/0.5)] [transform:translateY(-10px)]`}>
          <FlowerArt className="w-[76%]" />
        </div>
      </div>
    </section>
  );
}
