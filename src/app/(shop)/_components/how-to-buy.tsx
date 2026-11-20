import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import { Reveal } from '@/components/reveal';
import { softCard } from '@/components/ui/soft-card';

import { pillButton } from './pill-button';
import { SectionHeading, sectionSpacing } from './section-heading';

const STEPS = [
  { title: 'Elegí', detail: 'Juguetes de madera o imprimibles.\nLos sumás al carrito desde acá o desde el catálogo.' },
  { title: 'Pagá con Mercado Pago', detail: 'Tarjeta, débito o dinero en cuenta.\nCompra segura.' },
  { title: 'Recibilo', detail: 'Los imprimibles te llegan al instante por email. Los juguetes los retirás gratis o te los mandamos.' },
];

/** The doubts before paying, answered in three steps, ending in the button to start. */
export function HowToBuy() {
  return (
    <section className={sectionSpacing}>
      <div className="mx-auto max-w-[75rem]">
        <SectionHeading title="Cómo comprar" />
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {/* The steps come in one after the other, every time the section comes into view. */}
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} repeat delay={i * 250} className={`${softCard} p-6`}>
              <span className="flex size-10 items-center justify-center rounded-full bg-azul font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 whitespace-pre-line text-tinta-medio">{s.detail}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={CATALOG_LINKS.todo} className={pillButton}>
            Empezá a comprar <span aria-hidden="true">&nbsp;›</span>
          </Link>
          <Link href="/envios" className="font-semibold text-azul hover:underline">
            Envíos y retiro <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
