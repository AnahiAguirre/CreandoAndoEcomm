import type { Order } from '../order';
import type { GatewayPayment, OrderRepository, PaymentGateway } from '../ports';

/** The one thing the payment flow needs from digital delivery: `DigitalDelivery.grant`. */
export interface DigitalGranter {
  grant(productId: string, email: string, orderId: string | null): Promise<unknown>;
}

export type ConfirmOutcome =
  | { kind: 'paid'; order: Order }
  | { kind: 'unpaid'; order: Order }
  | { kind: 'pending'; order: Order }
  /** Not ours, unknown order, or a payment we don't act on (e.g. a refund). */
  | { kind: 'ignored' }
  /** Approved, but for a different amount than the order: nothing is delivered. */
  | { kind: 'amount-mismatch'; order: Order };

/**
 * Applies what Mercado Pago says about a payment to its order. Called by the
 * webhook and, as a safety net, by the return page: both paths go through the
 * same code, and calling it twice for the same payment changes nothing.
 */
export class ConfirmPayment {
  constructor(
    private readonly orders: OrderRepository,
    private readonly gateway: PaymentGateway,
    private readonly delivery: DigitalGranter,
  ) {}

  /** Webhook entry: only a payment id arrives, and even that is just a pointer. */
  async fromPaymentId(paymentId: string): Promise<ConfirmOutcome> {
    const payment = await this.gateway.getPayment(paymentId);
    return payment ? this.apply(payment) : { kind: 'ignored' };
  }

  /** Return-page entry: look the order's payment up ourselves. */
  async syncOrder(orderId: string): Promise<ConfirmOutcome> {
    const payment = await this.gateway.findPaymentByOrder(orderId);
    if (payment) return this.apply(payment);
    const order = await this.orders.findById(orderId);
    return order ? { kind: 'pending', order } : { kind: 'ignored' };
  }

  private async apply(payment: GatewayPayment): Promise<ConfirmOutcome> {
    if (!payment.orderId) return { kind: 'ignored' };
    const order = await this.orders.findById(payment.orderId);
    if (!order) return { kind: 'ignored' };

    switch (payment.status) {
      case 'approved': {
        if (payment.amountCents !== order.totalCents) {
          console.error(
            `[orders] pago ${payment.id} aprobado por ${payment.amountCents} pero el pedido ${order.id} vale ${order.totalCents}`,
          );
          return { kind: 'amount-mismatch', order };
        }
        const { order: paid } = await this.orders.markPaid(order.id, payment.id);
        // Granting is idempotent and runs EVERY time, not only when this call flipped
        // the order: if an earlier attempt died between "paid" and "granted", the
        // retry is what finishes the job.
        await this.deliverDigitals(paid);
        return { kind: 'paid', order: paid };
      }
      case 'rejected':
      case 'cancelled': {
        await this.orders.markUnpaid(order.id, payment.status, payment.id);
        const fresh = (await this.orders.findById(order.id)) ?? order;
        return { kind: 'unpaid', order: fresh };
      }
      default:
        return { kind: 'pending', order };
    }
  }

  private async deliverDigitals(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.kind !== 'digital' || !item.productId) continue;
      try {
        await this.delivery.grant(item.productId, order.email, order.id);
      } catch (err) {
        // The money is in; one PDF that can't be handed over must not block the rest.
        console.error(`[orders] no se pudo entregar "${item.name}" del pedido ${order.id}:`, err);
      }
    }
  }
}
