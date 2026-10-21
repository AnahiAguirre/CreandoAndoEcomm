import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/domain/orders/order';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Pedidos' };
export const dynamic = 'force-dynamic';

const STATUS: Record<OrderStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  paid: { label: 'Pagado', tone: 'success' },
  pending: { label: 'Pendiente', tone: 'warning' },
  rejected: { label: 'Rechazado', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
};

const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

/** Everything needed to pack and ship an order by hand. The layout already ran requireAdmin(). */
export default async function AdminOrdersPage() {
  const orders = await container.orders.listAll();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay pedidos.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS[order.status];
            return (
              <li key={order.id} className="rounded-xl border border-black/10 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {order.needsStockReview && <Badge tone="warning">Revisar stock</Badge>}
                  <span className="text-neutral-500">{dateFormat.format(order.createdAt)}</span>
                  <span className="font-medium">{order.email}</span>
                  <span className="ml-auto font-bold">{formatPrice(order.totalCents)}</span>
                </div>

                <ul className="mt-3 flex flex-col gap-1">
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.name}`}>
                      {item.quantity} × {item.name}{' '}
                      <span className="text-neutral-500">
                        ({item.kind === 'digital' ? 'imprimible' : 'juguete'} · {formatPrice(item.unitPriceCents)})
                      </span>
                    </li>
                  ))}
                </ul>

                {order.shipping && (
                  <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                    <p className="font-medium">
                      {order.shipping.method === 'domicilio' ? 'Envío a domicilio' : 'Retiro en sucursal'} ·{' '}
                      {formatPrice(order.shippingCents)} ({order.shipping.quoteLabel})
                    </p>
                    <p>
                      {order.shipping.recipient} · {order.shipping.phone}
                    </p>
                    <p>
                      {order.shipping.address ?? order.shipping.agency} · CP {order.shipping.postalCode}
                    </p>
                  </div>
                )}

                {order.needsStockReview && (
                  <p className="mt-3 text-amber-700">
                    El pago entró pero algún juguete ya no tenía stock suficiente: revisá si podés cumplirlo o devolvé el
                    dinero desde Mercado Pago.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
