import { pillButton } from './pill-button';

export function ClosingCta() {
  return (
    <section className="flex flex-col items-center justify-center gap-7 bg-tinta px-4 py-32 text-center text-white md:h-[560px] md:py-0">
      <h2 className="scroll-zoom text-6xl font-extrabold leading-none tracking-[-0.05em] md:text-[96px]">A jugar.</h2>
      <p className="scroll-rise text-lg text-tinta-muted md:text-2xl">Juguetes de madera e imprimibles para colorear.</p>
      <div className="scroll-rise flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[19px]">
        <a href="#catalogo" className={pillButton}>
          Ver catálogo
        </a>
        <a href="#top" className="text-link-oscuro transition-opacity duration-300 ease-suave hover:opacity-70">
          Volver arriba <span aria-hidden="true">›</span>
        </a>
      </div>
    </section>
  );
}
