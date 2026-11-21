import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OrderStatus, ShipmentState } from '@/domain/orders/order';
import { PICKUP_LABEL } from '@/domain/orders/pickup';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

import { retryShipment } from './actions';

export const metadata: Metadata = { title: 'Pedidos' };
export const dynamic = 'force-dynamic';

const STATUS: Record<OrderStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  paid: { label: 'Pagado', tone: 'success' },
  pending: { label: 'Pendiente', tone: 'warning' },
  rejected: { label: 'Rechazado', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
};

const SHIPMENT: Record<ShipmentState['status'], { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  created: { label: 'Envío cargado en MiCorreo', tone: 'success' },
  failed: { label: 'Falló el alta en MiCorreo', tone: 'warning' },
  manual: { label: 'Cargalo a mano en MiCorreo', tone: 'warning' },
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
                {order.discountCents > 0 && (
                  <p className="mt-1 text-green-700">
                    Cupón {order.couponCode}: − {formatPrice(order.discountCents)}
                  </p>
                )}

                {order.shipping && (
                  <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                    <p className="font-medium">
                      {order.shipping.method === 'retiro'
                        ? PICKUP_LABEL
                        : `${order.shipping.method === 'domicilio' ? 'Envío a domicilio' : 'Retiro en sucursal'} · ${formatPrice(order.shippingCents)} (${order.shipping.quoteLabel})`}
                    </p>
                    <p>
                      {order.shipping.recipient} · {order.shipping.phone}
                    </p>
                    {order.shipping.method !== 'retiro' && (
                      <p>
                        {order.shipping.address ?? order.shipping.agency} · CP {order.shipping.postalCode}
                      </p>
                    )}
                    {order.shipping.method !== 'retiro' && order.shippingCents === 0 && !order.shipping.freeShipping && (
                      <p className="text-amber-700">Falta coordinar y cobrar el costo del envío con el comprador.</p>
                    )}
                    {order.shipping.freeShipping && (
                      <p className="text-green-700">Envío gratis: la compra superó el mínimo, no se le cobra el envío.</p>
                    )}
                    {order.status === 'paid' && order.shipping.method !== 'retiro' && order.shipping.shipment && (
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <Badge tone={SHIPMENT[order.shipping.shipment.status].tone}>
                          {SHIPMENT[order.shipping.shipment.status].label}
                        </Badge>
                        {order.shipping.shipment.error && <span className="text-amber-700">{order.shipping.shipment.error}</span>}
                        {order.shipping.shipment.status !== 'created' && (
                          <form action={retryShipment.bind(null, order.id)}>
                            <Button type="submit" variant="secondary" size="sm">
                              Reintentar alta
                            </Button>
                          </form>
                        )}
                      </div>
                    )}
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
