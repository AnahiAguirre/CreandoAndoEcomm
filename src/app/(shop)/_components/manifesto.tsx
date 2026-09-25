import { Reveal } from '@/components/reveal';

const LINES = [
  'Juguetes de madera e imprimibles',
  'para colorear. Pensados para jugar',
  'sin pantallas, hechos para pasar',
  'de mano en mano.',
];

/** Figures shown as a counter. `count` animates; `label` sits under it. */
const FIGURES = [
  { count: 9, label: 'piezas encastrables en el Rompecabezas Granja', color: 'text-rojo' },
  { count: 20, label: 'láminas en el cuaderno de Animales', color: 'text-azul' },
  { count: 16, label: 'láminas en el cuaderno de Dinosaurios', color: 'text-verde' },
] as const;

const figure = 'text-7xl font-extrabold leading-none tracking-[-0.05em] md:text-[88px]';
const figureLabel = 'text-lg leading-[1.35] text-tinta-medio md:text-[19px]';

/** The statement that paints itself as you read it, and the numbers that count up under it. */
export function Manifesto() {
  return (
    <>
      <section className="flex items-center justify-center bg-white px-4 py-28 md:h-[700px] md:py-0">
        <p className="max-w-[1000px] text-4xl font-bold leading-[1.12] tracking-[-0.035em] md:text-[60px]">
          {LINES.map((line) => (
            <span key={line} className="paint-text md:block">
              {line}{' '}
            </span>
          ))}
        </p>
      </section>

      <section id="detalles" className="scroll-mt-14 bg-white px-4 pb-24 md:h-[460px] md:pb-0">
        <div className="mx-auto grid max-w-[70rem] grid-cols-2 gap-6 gap-y-12 border-t border-arena-dark pt-14 md:grid-cols-4">
          {FIGURES.map((f) => (
            <Reveal key={f.label} className="flex flex-col gap-2">
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
          <Reveal className="flex flex-col gap-2">
            <span className={`${figure} text-amarillo-dark`}>A4</span>
            <span className={figureLabel}>PDF listo para imprimir en casa</span>
          </Reveal>
        </div>
      </section>
    </>
  );
}
