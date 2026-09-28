import { pillButton } from './pill-button';

export function ClosingCta() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 bg-tinta px-4 py-28 text-center text-white md:h-[480px] md:py-0">
      <h2 className="scroll-zoom text-6xl font-bold leading-none md:text-[88px]">A jugar.</h2>
      <p className="scroll-rise-late text-lg text-tinta-muted md:text-xl">Juguetes de madera e imprimibles para colorear.</p>
      <div className="scroll-rise-late flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-base font-bold md:text-[17px]">
        <a href="#elegidos" className={`${pillButton} font-bold`}>
          Ver catálogo
        </a>
        <a href="#top" className="font-bold text-link-oscuro transition-opacity duration-300 ease-suave hover:opacity-70">
          Volver arriba <span aria-hidden="true">›</span>
        </a>
      </div>
    </section>
  );
}
