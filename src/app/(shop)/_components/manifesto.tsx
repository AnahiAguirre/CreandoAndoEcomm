import { Reveal } from '@/components/reveal';

/** Figures shown as a counter. `count` animates; `label` sits under it. */
const FIGURES = [
  { count: 3, label: 'maneras de jugar: armar, recorrer y pintar', color: 'text-rojo-vivo' },
  { count: 20, label: 'láminas en el cuaderno de Animales', color: 'text-azul' },
  { count: 16, label: 'láminas en el cuaderno de Dinosaurios', color: 'text-verde' },
] as const;

const figure = 'text-7xl font-extrabold leading-none tracking-[-0.05em] md:text-[88px]';
const figureLabel = 'text-lg leading-[1.35] text-tinta-medio md:text-[19px]';

/** One line of what the shop is about, and the numbers that count up under it. */
export function Manifesto() {
  return (
    <section id="detalles" className="scroll-mt-16 bg-white px-4 py-24 md:py-32">
      <div className="mx-auto max-w-[70rem]">
        <Reveal repeat>
          <p className="text-center text-3xl font-bold leading-[1.15] tracking-[-0.035em] md:text-5xl">
            Pensados para jugar sin pantallas.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-6 gap-y-12 border-t border-arena-dark pt-14 md:grid-cols-4">
          {FIGURES.map((f) => (
            <Reveal repeat key={f.label} className="flex flex-col gap-2">
              {/* The number itself is drawn by CSS (.count-up); screen readers get it here. */}
              <span className="sr-only">{f.count}</span>
              <span
                aria-hidden="true"
                className={`count-up ${figure} ${f.color}`}
                style={{ '--count': f.count } as React.CSSProperties}
              />
              <span className={figureLabel}>{f.label}</span>
            </Reveal>
          ))}
          <Reveal repeat className="flex flex-col gap-2">
            <span className={`${figure} text-amarillo-dark`}>A4</span>
            <span className={figureLabel}>PDF listo para imprimir en casa</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
