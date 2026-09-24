import { Reveal } from '@/components/reveal';

const LINES = [
  'Juguetes de madera e imprimibles',
  'para colorear. Pensados para jugar',
  'sin pantallas, hechos para pasar',
  'de mano en mano.',
];

/** Figures shown as a counter. `count` animates; `label` sits under it. */
const FIGURES = [
  { count: 20, label: 'láminas en el cuaderno de Animales', color: 'text-azul' },
  { count: 16, label: 'láminas en el cuaderno de Dinosaurios', color: 'text-verde' },
] as const;

/** The statement that paints itself as you read it, and the numbers that count up under it. */
export function Manifesto() {
  return (
    <section className="bg-white px-4 py-28 md:py-44">
      <p className="mx-auto max-w-5xl text-4xl font-bold leading-[1.12] tracking-[-0.035em] md:text-6xl">
        {LINES.map((line) => (
          <span key={line} className="paint-text md:block">
            {line}{' '}
          </span>
        ))}
      </p>

      <div className="mx-auto mt-24 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 border-t border-madera-dark pt-14 md:mt-36 md:grid-cols-3">
        {FIGURES.map((f) => (
          <Reveal key={f.label} className="flex flex-col gap-2">
            {/* The number itself is drawn by CSS (.count-up); screen readers get it here. */}
            <span className="sr-only">{f.count}</span>
            <span
              aria-hidden="true"
              className={`count-up text-7xl font-extrabold leading-none tracking-[-0.05em] md:text-8xl ${f.color}`}
              style={{ '--count': f.count } as React.CSSProperties}
            />
            <span className="text-lg leading-snug text-tinta-soft">{f.label}</span>
          </Reveal>
        ))}
        <Reveal className="flex flex-col gap-2">
          <span className="text-7xl font-extrabold leading-none tracking-[-0.05em] text-rojo md:text-8xl">A4</span>
          <span className="text-lg leading-snug text-tinta-soft">PDF listo para imprimir en casa</span>
        </Reveal>
      </div>
    </section>
  );
}
