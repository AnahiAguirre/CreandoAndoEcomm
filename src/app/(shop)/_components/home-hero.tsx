import { CarPuzzle } from './illustrations/car-puzzle';
import { Stage } from './illustrations/stage';
import { pillButton } from './pill-button';

/**
 * Warm, light opener. The copy settles in on load, then the empty board
 * appears and the car's pieces drop into it one by one; once you scroll past,
 * the puzzle shrinks and fades as the next section takes over.
 */
export function HomeHero() {
  return (
    <section
      id="top"
      className="flex flex-col items-center overflow-hidden bg-crema-calida px-4 pb-20 pt-12 md:h-[1060px] md:pb-0 md:pt-16"
    >
      <p className="hero-in text-lg font-extrabold text-rojo-vivo md:text-[22px]">Nuevo</p>
      <h1 className="hero-in mt-2.5 text-center text-6xl font-bold leading-none sm:text-8xl md:text-[120px]">Rompecabezas</h1>
      <p className="hero-in hero-in-2 mt-5 text-center text-xl font-semibold leading-[1.3] text-tinta-calida md:text-[28px]">
        Piezas grandes de madera, fáciles de agarrar.
        <br />
        Para armar, desarmar y volver a armar.
      </p>
      <div className="hero-in hero-in-3 mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[19px]">
        <a href="#comprar" className={`${pillButton} font-bold`}>
          Comprar
        </a>
        <a href="#armar" className="font-bold text-azul transition-opacity duration-300 ease-suave hover:opacity-70">
          Mirá cómo se arma <span aria-hidden="true">›</span>
        </a>
      </div>

      <div className="hero-out mt-10 md:mt-14">
        <div className="hero-puzzle-in" style={{ transform: 'rotate(-4deg)' }}>
          <Stage width={600} height={620} className="[--s:0.55] sm:[--s:0.8] md:[--s:1]">
            <CarPuzzle motion="drop" />
          </Stage>
        </div>
      </div>
    </section>
  );
}
