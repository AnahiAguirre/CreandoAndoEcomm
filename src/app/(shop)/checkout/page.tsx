import type { Metadata } from 'next';
import Link from 'next/link';

import { requireUser } from '@/lib/auth-guards';
import { paymentsEnabled } from '@/lib/env';

import { CheckoutView } from './checkout-view';

export const metadata: Metadata = { title: 'Finalizar compra' };

/** Paying needs an account: the purchase is delivered to the buyer's verified Google email. */
export default async function CheckoutPage() {
  const user = await requireUser('/checkout');

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">Finalizar compra</h1>
      <p className="mt-2 text-tinta-medio">
        Compras como <strong>{user.email}</strong>. Los imprimibles te llegan a ese email y quedan en{' '}
        <Link href="/mis-descargas" className="underline">
          Mis descargas
        </Link>
        .
      </p>
      {paymentsEnabled ? (
        <CheckoutView />
      ) : (
        <p className="mt-10 rounded-3xl border border-borde-suave bg-white p-10 text-center text-tinta-medio">
          Muy pronto vas a poder pagar con Mercado Pago.
        </p>
      )}
    </section>
  );
}
