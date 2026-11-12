import type { Agency, ShippingQuote, ShippingQuoter } from '@/domain/orders/ports';

/**
 * No carrier connection: shipping by Correo is shipped and charged by hand, so
 * nothing is added to the payment and there are no branches to choose from.
 * `CorreoQuoter` replaces this in `src/lib/container.ts` once the credentials are set.
 */
export class ManualShippingQuoter implements ShippingQuoter {
  async quote(): Promise<ShippingQuote> {
    return { priceCents: 0, label: 'Envío por Correo Argentino (costo a coordinar)', etaDays: 0 };
  }

  async agencies(): Promise<Agency[]> {
    return [];
  }
}
