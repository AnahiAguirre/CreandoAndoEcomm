import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/domain/orders/order';
import { requireUser } from '@/lib/auth-guards';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Mis pedidos' };
export const dynamic = 'force-dynamic';

const STATUS: Record<OrderStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  paid: { label: 'Pagado', tone: 'success' },
  pending: { label: 'Esperando el pago', tone: 'warning' },
  rejected: { label: 'No se pudo pagar', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
};

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

// A pending order older than this is an abandoned checkout, not a payment still in flight.
const RECENT_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_SYNCS = 5;

/**
 * Pending orders that are recent get one look at Mercado Pago, so a payment that
 * was approved while the webhook was late (or never came, as on localhost) shows
 * up as paid here without the buyer doing anything. Failures are not fatal.
 */
async function settleRecentPending(orders: Order[]): Promise<boolean> {
  const now = Date.now();
  const candidates = orders
    .filter((o) => o.status === 'pending' && now - o.createdAt.getTime() < RECENT_MS)
    .slice(0, MAX_SYNCS);
  if (candidates.length === 0) return false;

  const results = await Promise.allSettled(candidates.map((o) => container.payments.confirm.syncOrder(o.id)));
  return results.some((r) => r.status === 'fulfilled' && r.value.kind === 'paid');
}

export default async function MyOrdersPage() {
  const user = await requireUser('/mis-pedidos');

  let orders = await container.orders.listForUser(user.id);
  if (await settleRecentPending(orders)) orders = await container.orders.listForUser(user.id);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">Mis pedidos</h1>
      <p className="mt-2 text-tinta-medio">
        Todo lo que compraste con <strong>{user.email}</strong>. Tus imprimibles están en{' '}
        <Link href="/mis-descargas" className="underline">
          Mis descargas
        </Link>
        .
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-borde-suave bg-white p-10 text-center">
          <p className="font-semibold">Todavía no hiciste ninguna compra.</p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS[order.status];
            return (
              <li key={order.id} className="rounded-3xl border border-borde-suave bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <span className="text-sm text-tinta-medio">{dateFormat.format(order.createdAt)}</span>
                  <span className="ml-auto text-lg font-bold">{formatPrice(order.totalCents)}</span>
                </div>

                <ul className="mt-3 flex flex-col gap-1 text-sm">
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.name}`}>
                      {item.quantity} × {item.name}
                    </li>
                  ))}
                  {order.shipping && (
                    <li className="text-tinta-medio">
                      {order.shipping.method === 'domicilio' ? 'Envío a domicilio' : 'Retiro en sucursal'} ·{' '}
                      {order.shipping.postalCode}
                    </li>
                  )}
                </ul>

                <Link href={`/pedido/${order.id}`} className="mt-4 inline-block text-sm font-semibold underline">
                  Ver detalle
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
