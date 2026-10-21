import { DomainError } from '@/domain/shared/errors';
import type { Cents } from '@/domain/shared/money';

import type { NewOrder, Order, OrderStatus, ShippingMethod } from './order';

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

export interface Parcel {
  weightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ShippingQuote {
  priceCents: Cents;
  label: string;
  etaDays: number;
}

export interface Agency {
  id: string;
  name: string;
  address: string;
}

export interface ShippingQuoter {
  quote(input: { postalCode: string; method: ShippingMethod; parcel: Parcel }): Promise<ShippingQuote>;
  agencies(postalCode: string): Promise<Agency[]>;
}
