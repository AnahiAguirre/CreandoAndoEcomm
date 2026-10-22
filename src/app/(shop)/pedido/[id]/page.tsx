import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Order } from '@/domain/orders/order';
import { requireUser } from '@/lib/auth-guards';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

import { ClearCartOnPaid, PendingRefresh } from './order-effects';

export const metadata: Metadata = { title: 'Tu pedido' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  // Mercado Pago appends ?payment_id=…&status=…&external_reference=… when it sends the buyer back.
  searchParams: Promise<{ payment_id?: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { payment_id: paymentId } = await searchParams;
  const user = await requireUser(`/pedido/${id}`);
  if (!UUID.test(id)) notFound();

  let order = await container.orders.findById(id);
  // Someone else's order is "not found", same as a made-up one: ids can't be probed.
  if (!order || order.userId !== user.id) notFound();

  if (order.status === 'pending') {
    // The webhook may be late (or unable to reach localhost): confirm it ourselves.
    // Safe to repeat: the result is the same as the webhook's, and it is idempotent.
    try {
      if (paymentId) await container.payments.confirm.fromPaymentId(paymentId);
      await container.payments.confirm.syncOrder(order.id);
    } catch (err) {
      console.error('[pedido] no se pudo confirmar el pago de', order.id, err);
    }
    order = (await container.orders.findById(id)) ?? order;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <Status order={order} />
      <Detail order={order} />
      <Link href="/mis-pedidos" className="mt-6 inline-block text-sm font-semibold underline">
        Ver todos mis pedidos
      </Link>
    </section>
  );
}

function Status({ order }: { order: Order }) {
  if (order.status === 'paid') {
    const hasDigital = order.items.some((i) => i.kind === 'digital');
    return (
      <div className="rounded-3xl bg-verde-soft p-8">
        <ClearCartOnPaid />
        <h1 className="text-3xl font-bold">¡Gracias por tu compra!</h1>
        <p className="mt-2">Recibimos tu pago. Te dejamos el detalle acá abajo.</p>
        {hasDigital && (
          <Link
            href="/mis-descargas"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
          >
            Ir a Mis descargas
          </Link>
        )}
        {order.shipping && <p className="mt-4 text-sm">Preparamos tu envío y te avisamos cuando salga.</p>}
      </div>
    );
  }

  if (order.status === 'pending') {
    return (
      <div className="rounded-3xl bg-amarillo-soft p-8">
        <PendingRefresh />
        <h1 className="text-3xl font-bold">Estamos esperando la confirmación del pago</h1>
        <p className="mt-2">
          Puede demorar unos segundos. Esta página se actualiza sola; si ya pagaste, no hace falta que hagas nada más.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-borde-suave">
      <h1 className="text-3xl font-bold">El pago no se pudo completar</h1>
      <p className="mt-2 text-tinta-medio">No se te cobró nada. Tu carrito sigue como lo dejaste, podés intentarlo de nuevo.</p>
      <Link
        href="/carrito"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
      >
        Volver al carrito
      </Link>
    </div>
  );
}

function Detail({ order }: { order: Order }) {
  return (
    <div className="mt-6 rounded-3xl border border-borde-suave bg-white p-6 text-sm">
      <p className="text-xs text-tinta-medio">Pedido {order.id}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.name}`} className="flex justify-between gap-4">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span className="font-medium">{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
        {order.shippingCents > 0 && (
          <li className="flex justify-between gap-4 text-tinta-medio">
            <span>{order.shipping?.quoteLabel ?? 'Envío'}</span>
            <span>{formatPrice(order.shippingCents)}</span>
          </li>
        )}
      </ul>
      <p className="mt-4 flex justify-between border-t border-borde-suave pt-4 text-base font-bold">
        <span>Total</span>
        <span>{formatPrice(order.totalCents)}</span>
      </p>
      {order.shipping && (
        <div className="mt-4 border-t border-borde-suave pt-4 text-tinta-medio">
          <p className="font-semibold text-tinta">
            {order.shipping.method === 'domicilio' ? 'Se envía a' : 'Retiro en sucursal'}
          </p>
          <p>{order.shipping.recipient} · {order.shipping.phone}</p>
          <p>{order.shipping.address ?? order.shipping.agency} (CP {order.shipping.postalCode})</p>
        </div>
      )}
    </div>
  );
}
