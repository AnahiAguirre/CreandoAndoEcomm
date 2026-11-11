import { DomainError } from '@/domain/shared/errors';
import type { Cents } from '@/domain/shared/money';

import type { NewOrder, Order, OrderStatus, Parcel, ProvinceCode, ShipmentState, ShippingMethod } from './order';

export type { Parcel };

// ---------- orders ----------

export interface MarkPaidResult {
  order: Order;
  /** `false` when it was already paid (webhook retry, or the return page got there first). */
  changed: boolean;
}

export interface OrderRepository {
  create(order: NewOrder): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  listForUser(userId: string): Promise<Order[]>;
  /** Admin view: newest first. */
  listAll(): Promise<Order[]>;
  /**
   * All-or-nothing and idempotent. Flips the order to `paid` only if it wasn't,
   * and in the same transaction takes the physical items off the shelf. A line
   * whose stock ran out is NOT an error (the money is already taken): the order
   * is flagged `needsStockReview` for the admin instead.
   */
  markPaid(id: string, mpPaymentId: string): Promise<MarkPaidResult>;
  /** Only moves a still-`pending` order (a paid one is never downgraded). */
  markUnpaid(id: string, status: Extract<OrderStatus, 'rejected' | 'cancelled'>, mpPaymentId: string): Promise<void>;
  /** Records how registering the shipment went. A shipment already `created` is never overwritten. */
  setShipment(id: string, shipment: ShipmentState): Promise<void>;
}

// ---------- payments ----------

export type PaymentStatus = 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded';

export interface GatewayPayment {
  id: string;
  status: PaymentStatus;
  /** Our order id, echoed back as Mercado Pago's `external_reference`. */
  orderId: string | null;
  amountCents: Cents;
}

export class PaymentsUnavailableError extends DomainError {
  constructor() {
    super('Los pagos todavía no están habilitados.', 'PAYMENTS_UNAVAILABLE');
  }
}

export interface PaymentGateway {
  /** Starts a hosted checkout for this order and returns where to send the buyer. */
  createCheckout(order: Order): Promise<{ redirectUrl: string }>;
  /** The truth about a payment, asked to the provider: webhook payloads are never trusted. */
  getPayment(paymentId: string): Promise<GatewayPayment | null>;
  /** Latest payment for an order (the return page uses it when the webhook is late or can't reach us). */
  findPaymentByOrder(orderId: string): Promise<GatewayPayment | null>;
}

// ---------- shipping ----------

export interface ShippingQuote {
  priceCents: Cents;
  label: string;
  etaDays: number;
  /** `true` for the stand-in quoter: the price is made up and the UI says so. */
  simulated: boolean;
}

export interface Agency {
  /** The carrier's branch code. */
  id: string;
  name: string;
  address: string;
}

/** The carrier could not be reached or refused: the buyer sees the message and can try again. */
export class ShippingUnavailableError extends DomainError {
  constructor(message = 'No pudimos calcular el envío ahora. Probá de nuevo en unos minutos.') {
    super(message, 'SHIPPING_UNAVAILABLE');
  }
}

export interface ShippingQuoter {
  quote(input: { postalCode: string; method: ShippingMethod; parcel: Parcel }): Promise<ShippingQuote>;
  /** Branches to pick up at, the ones closest to `postalCode` first. */
  agencies(input: { provinceCode: ProvinceCode; postalCode: string }): Promise<Agency[]>;
}

export class ShipmentFailedError extends Error {}

export interface ShipmentCreator {
  /**
   * Registers the shipment of a paid order with the carrier. Resolves `created`
   * when it is in the carrier's system, `manual` when there is no carrier
   * connection and someone has to do it by hand. Throws `ShipmentFailedError`.
   */
  create(order: Order): Promise<'created' | 'manual'>;
}
