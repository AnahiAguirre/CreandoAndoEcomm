import Link from 'next/link';

import { FarmPuzzle } from './farm-puzzle';
import { pillButton } from './pill-button';

interface Props {
  buyHref: string;
}

/**
 * Dark, full-width opener. The copy and the puzzle settle in on load; once you
 * scroll past, the puzzle shrinks and fades as the next section takes over.
 */
export function HomeHero({ buyHref }: Props) {
  return (
    <section
      id="top"
      className="flex flex-col items-center overflow-hidden bg-tinta px-4 pb-20 pt-12 text-white md:h-[980px] md:pb-0 md:pt-16"
    >
      <p className="hero-in text-lg font-semibold text-amarillo md:text-[22px]">Nuevo</p>
      <h1 className="hero-in mt-2.5 text-center text-5xl font-extrabold leading-none tracking-[-0.045em] sm:text-7xl md:text-[112px]">
        Rompecabezas Granja
      </h1>
      <p className="hero-in mt-5 text-center text-xl font-medium leading-[1.3] text-tinta-muted [animation-delay:0.15s] md:text-[28px]">
        Nueve piezas. Pintado a mano.
        <br />
        Hecho para pasar de mano en mano.
      </p>
      <div className="hero-in mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[19px] [animation-delay:0.3s]">
        <Link href={buyHref} className={pillButton}>
          Comprar
        </Link>
        <a href="#armar" className="text-link-oscuro transition-opacity duration-300 ease-suave hover:opacity-70">
          Mirá cómo se arma <span aria-hidden="true">›</span>
        </a>
      </div>

      <div className="hero-out mt-12 w-full max-w-[600px] md:mt-[60px]">
        <div className="hero-puzzle-in -rotate-5 drop-shadow-[0_50px_80px_rgb(0_0_0/0.55)]">
          <FarmPuzzle label="Rompecabezas de una granja: granero rojo, sol, árbol y una oveja" />
        </div>
      </div>
    </section>
  );
}
