import { FarmPuzzle } from './farm-puzzle';

const caption = 'scene-caption text-3xl font-bold leading-[1.05] tracking-[-0.035em] md:text-[56px]';

/**
 * A tall section with a sticky stage: while you scroll through it the pieces
 * fly in and the captions light up one by one. The section's height is the
 * length of the animation.
 */
export function AssembleScene() {
  return (
    <section id="armar" className="assemble-scene relative h-[1800px] scroll-mt-14 bg-arena">
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] max-h-[820px] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 px-4 md:grid-cols-2 md:gap-0">
          <div className="flex flex-col gap-4 md:gap-9 md:pr-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-[15px]">
              Juguete de madera
            </p>
            <h2 className={`${caption} scene-caption-1`}>Nueve piezas encastrables.</h2>
            <h2 className={`${caption} scene-caption-2`}>Madera pintada a mano.</h2>
            <h2 className={`${caption} scene-caption-3`}>
              Se arma, se desarma, <span className="text-rojo">se vuelve a armar.</span>
            </h2>
          </div>

          <div className="flex justify-center">
            <FarmPuzzle
              scatter
              label="Rompecabezas de una granja: granero rojo, sol, árbol y una oveja"
              className="w-full max-w-[min(540px,40svh)] md:max-w-[540px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
