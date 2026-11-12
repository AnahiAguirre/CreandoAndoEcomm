import { DomainError } from '@/domain/shared/errors';

import type { Order } from '../order';
import { type OrderRepository, ShipmentFailedError, type ShipmentCreator } from '../ports';

export class NotShippableError extends DomainError {
  constructor() {
    super('Este pedido no está pagado o no tiene envío.', 'NOT_SHIPPABLE');
  }
}

/** The one thing the payment flow needs from shipping: `ShipOrder.ship`. */
export interface OrderShipper {
  ship(order: Order): Promise<void>;
}

/**
 * Registers a paid order's shipment with the carrier and records the outcome on
 * the order. Called right after a payment is approved; a failure here never
 * undoes the payment, it is stored so the admin can retry.
 */
export class ShipOrder implements OrderShipper {
  constructor(
    private readonly orders: OrderRepository,
    private readonly creator: ShipmentCreator,
  ) {}

  /** Automatic path: tries once, never throws, and leaves a mark (created, failed or manual). */
  async ship(order: Order): Promise<void> {
    if (!order.shipping || order.shipping.method === 'retiro' || order.status !== 'paid' || order.shipping.shipment) return;
    await this.attempt(order);
  }

  /** Admin button: tries again an order whose shipment failed or was left manual. */
  async retry(orderId: string): Promise<void> {
    const order = await this.orders.findById(orderId);
    if (!order?.shipping || order.shipping.method === 'retiro' || order.status !== 'paid') throw new NotShippableError();
    if (order.shipping.shipment?.status === 'created') return;
    await this.attempt(order);
  }

  private async attempt(order: Order): Promise<void> {
    try {
      const status = await this.creator.create(order);
      await this.orders.setShipment(order.id, { status, at: new Date().toISOString() });
    } catch (err) {
      const message = err instanceof ShipmentFailedError ? err.message : 'Error inesperado al crear el envío.';
      console.error(`[orders] no se pudo crear el envío del pedido ${order.id}:`, err);
      await this.orders.setShipment(order.id, { status: 'failed', error: message, at: new Date().toISOString() });
    }
  }
}
