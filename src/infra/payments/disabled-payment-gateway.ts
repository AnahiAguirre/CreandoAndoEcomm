import { type GatewayPayment, type PaymentGateway, PaymentsUnavailableError } from '@/domain/orders/ports';

/** Stands in while MP_ACCESS_TOKEN isn't configured: the shop works, paying says "muy pronto". */
export class DisabledPaymentGateway implements PaymentGateway {
  async createCheckout(): Promise<{ redirectUrl: string }> {
    throw new PaymentsUnavailableError();
  }

  async getPayment(): Promise<GatewayPayment | null> {
    return null;
  }

  async findPaymentByOrder(): Promise<GatewayPayment | null> {
    return null;
  }
}
