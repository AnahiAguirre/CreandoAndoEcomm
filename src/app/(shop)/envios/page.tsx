import type { Metadata } from 'next';
import Link from 'next/link';

import { CATALOG_LINKS } from '@/components/nav-links';
import { CARRIER_COST_NOTE, PICKUP_LABEL, PICKUP_NOTE } from '@/domain/orders/pickup';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/contact';
import { shippingEnabled } from '@/lib/env';
import { FREE_SHIPPING_FROM } from '@/lib/shipping-copy';

export const metadata: Metadata = { title: 'Envíos y retiro' };

const card = 'rounded-3xl border border-borde-suave bg-white p-6 md:p-8';

/** What a buyer asks before paying: how the order gets to them and what it costs. */
export default function ShippingInfoPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">Envíos y retiro</h1>
      <p className="mt-2 text-tinta-medio">
        Los juguetes de madera los podés retirar o te los mandamos. Los imprimibles no viajan: te llegan por email.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <article className={card}>
          <h2 className="text-xl font-semibold">{PICKUP_LABEL} · gratis</h2>
          <p className="mt-2 text-tinta-medio">{PICKUP_NOTE}</p>
        </article>

        <article className={card}>
          <h2 className="text-xl font-semibold">Envío por Correo Argentino · a todo el país</h2>
          <p className="mt-2 font-semibold text-verde">Gratis en compras desde {FREE_SHIPPING_FROM}.</p>
          <p className="mt-2 text-tinta-medio">
            {shippingEnabled
              ? 'En compras menores, el costo se calcula en el checkout con tu código postal. Podés elegir recibirlo en tu casa o retirarlo en una sucursal del Correo.'
              : `En compras menores: ${CARRIER_COST_NOTE.charAt(0).toLowerCase()}${CARRIER_COST_NOTE.slice(1)}`}
          </p>
          <p className="mt-2 text-tinta-medio">
            En el checkout te pedimos la dirección completa. Cuando lo despachamos, te avisamos por email.
          </p>
        </article>

        <article className={card}>
          <h2 className="text-xl font-semibold">Imprimibles en PDF · al instante</h2>
          <p className="mt-2 text-tinta-medio">
            Apenas se aprueba el pago te llega el PDF al email con el que compraste, y queda guardado en{' '}
            <Link href="/mis-descargas" className="underline">
              Mis descargas
            </Link>{' '}
            para bajarlo cuando quieras.
          </p>
        </article>
      </div>

      <p className="mt-8 text-tinta-medio">
        ¿Dudas sobre un envío o el retiro?{' '}
        <a
          href={whatsappLink('Hola, tengo una consulta sobre envíos y retiro.')}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-azul hover:underline"
        >
          Escribinos por WhatsApp al {WHATSAPP_DISPLAY}
        </a>
        .
      </p>

      <Link
        href={CATALOG_LINKS.todo}
        className="mt-10 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
      >
        Ver el catálogo
      </Link>
    </section>
  );
}
