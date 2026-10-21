import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

import type { Order } from '@/domain/orders/order';
import type { GatewayPayment, PaymentGateway, PaymentStatus } from '@/domain/orders/ports';

const MAX_TITLE = 250;

function toStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
    case 'expired':
      return 'cancelled';
    case 'refunded':
    case 'charged_back':
      return 'refunded';
    // pending, in_process, in_mediation, authorized: not settled yet.
    default:
      return 'pending';
  }
}

const toPesos = (cents: number) => Math.round(cents) / 100;

/** Mercado Pago Checkout Pro: the buyer pays on Mercado Pago's own page, never on ours. */
export class MercadoPagoGateway implements PaymentGateway {
  private readonly preferences: Preference;
  private readonly payments: Payment;

  constructor(
    accessToken: string,
    /** Where this deployment lives (no trailing slash): back URLs and the webhook point here. */
    private readonly baseUrl: string,
  ) {
    const config = new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
    this.preferences = new Preference(config);
    this.payments = new Payment(config);
  }

  async createCheckout(order: Order): Promise<{ redirectUrl: string }> {
    const items = order.items.map((item) => ({
      id: item.productId ?? item.name,
      title: item.name.slice(0, MAX_TITLE),
      quantity: item.quantity,
      unit_price: toPesos(item.unitPriceCents),
      currency_id: 'ARS',
    }));
    if (order.shippingCents > 0) {
      items.push({ id: 'envio', title: 'Envío', quantity: 1, unit_price: toPesos(order.shippingCents), currency_id: 'ARS' });
    }

    const back = `${this.baseUrl}/pedido/${order.id}`;
    // Mercado Pago only accepts public HTTPS URLs for these two; on localhost they are
    // left out and the return page (/pedido/[id]) confirms the payment by itself.
    const isHttps = this.baseUrl.startsWith('https://');

    const preference = await this.preferences.create({
      body: {
        items,
        external_reference: order.id,
        payer: { email: order.email },
        back_urls: { success: back, failure: back, pending: back },
        ...(isHttps ? { auto_return: 'approved', notification_url: `${this.baseUrl}/api/webhooks/mercadopago` } : {}),
        // One shot: approved or rejected right away, no "pending" limbo for cards.
        binary_mode: true,
      },
    });
    if (!preference.init_point) throw new Error('Mercado Pago no devolvió el link de pago.');
    return { redirectUrl: preference.init_point };
  }

  async getPayment(paymentId: string): Promise<GatewayPayment | null> {
    try {
      const payment = await this.payments.get({ id: paymentId });
      return {
        id: String(payment.id),
        status: toStatus(payment.status),
        orderId: payment.external_reference ?? null,
        amountCents: Math.round((payment.transaction_amount ?? 0) * 100),
      };
    } catch (err) {
      if ((err as { status?: number }).status === 404) return null;
      throw err;
    }
  }

  async findPaymentByOrder(orderId: string): Promise<GatewayPayment | null> {
    const { results } = await this.payments.search({
      options: { external_reference: orderId, sort: 'date_created', criteria: 'desc' },
    });
    // An approved payment wins over later failed attempts for the same order.
    const found = results?.find((p) => p.status === 'approved') ?? results?.[0];
    if (!found?.id) return null;
    return {
      id: String(found.id),
      status: toStatus(found.status),
      orderId,
      amountCents: Math.round((found.transaction_amount ?? 0) * 100),
    };
  }
}
