import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ClosingCta() {
  return (
    <section className="flex flex-col items-center gap-7 bg-tinta px-4 py-32 text-center text-white md:py-44">
      <h2 className="scroll-zoom text-6xl font-extrabold leading-none tracking-[-0.05em] md:text-8xl">A jugar.</h2>
      <p className="scroll-rise text-lg text-tinta-muted md:text-2xl">Juguetes de madera e imprimibles para colorear.</p>
      <div className="scroll-rise flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <a href="#catalogo" className={cn(buttonVariants({ size: 'lg' }), 'bg-azul hover:bg-azul/85')}>
          Ver catálogo
        </a>
        <a href="#top" className="text-lg text-link-oscuro transition-opacity duration-300 ease-suave hover:opacity-70">
          Volver arriba <span aria-hidden="true">›</span>
        </a>
      </div>
    </section>
  );
}
