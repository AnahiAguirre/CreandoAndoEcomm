import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import { Reveal } from '@/components/reveal';
import { FREE_SHIPPING_FROM } from '@/lib/shipping-copy';

import { pillButton } from './pill-button';
import { homeContainer, sectionSpacing } from './section-heading';

/** What a family asks before paying, answered with what the shop actually does. */
const QUESTIONS: { q: string; a: string }[] = [
  {
    q: '¿Cómo pago?',
    a: 'Con Mercado Pago: tarjeta, débito o dinero en cuenta.',
  },
  {
    q: '¿Hacen envíos?',
    a: `Sí, a todo el país por Correo Argentino, y es gratis en compras desde ${FREE_SHIPPING_FROM}. Si preferís, lo retirás sin costo en el local.`,
  },
  {
    q: '¿Cuándo me llegan los imprimibles?',
    a: 'Al instante: te llegan por email apenas pagás, listos para imprimir en A4.',
  },
  {
    q: '¿Puedo comprar desde acá?',
    a: 'Sí. Sumás juguetes o láminas al carrito desde esta página o desde el catálogo.',
  },
];

/**
 * The close of the home: the doubts before paying, answered plainly, one after
 * the other as they come into view, and the button to start.
 */
export function FamilyQuestions() {
  return (
    <section id="preguntas" className={`scroll-mt-16 ${sectionSpacing}`}>
      <div className={`${homeContainer} grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16`}>
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="text-balance font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.02em] [overflow-wrap:break-word] md:text-[48px]">
            Lo que preguntan las familias
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={CATALOG_LINKS.todo} className={pillButton}>
              Empezá a comprar<span aria-hidden="true">&nbsp;›</span>
            </Link>
            <Link href="/envios" className="font-semibold text-azul hover:underline">
              Envíos y retiro<span aria-hidden="true">&nbsp;›</span>
            </Link>
          </div>
        </div>
        <dl className="border-t border-borde-suave">
          {QUESTIONS.map((item, i) => (
            <Reveal key={item.q} repeat delay={i * 150} className="border-b border-borde-suave py-6 md:py-7">
              <dt className="font-display text-xl font-extrabold leading-snug md:text-2xl">{item.q}</dt>
              <dd className="mt-2 max-w-[56ch] text-pretty text-lg text-tinta-medio">{item.a}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
