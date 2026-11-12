import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';

import { pillButton } from './pill-button';

const STEPS = [
  { title: 'Elegí', detail: 'Juguetes de madera o imprimibles. Los sumás al carrito desde acá o desde el catálogo.' },
  { title: 'Pagá con Mercado Pago', detail: 'Tarjeta, débito o dinero en cuenta. Compra segura.' },
  { title: 'Recibilo', detail: 'Los imprimibles te llegan al instante por email. Los juguetes los retirás gratis o te los mandamos.' },
];

/** The doubts before paying, answered in three steps, ending in the button to start. */
export function HowToBuy() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-[75rem]">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">Cómo comprar</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl bg-arena p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-azul font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-tinta-medio">{s.detail}</p>
            </li>
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
