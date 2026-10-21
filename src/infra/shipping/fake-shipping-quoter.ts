import type { ShippingMethod } from '@/domain/orders/order';
import type { Agency, Parcel, ShippingQuote, ShippingQuoter } from '@/domain/orders/ports';

const BASE_CENTS = 450_000; // $4.500
const PER_EXTRA_KG_CENTS = 120_000; // $1.200 for each kg after the first
const PICKUP_DISCOUNT = 0.3;

/**
 * STAND-IN for Correo Argentino: deterministic made-up prices and branches so the
 * whole purchase can be built and tested before the carrier's API credentials
 * exist. The real quoter (MiCorreo) implements the same `ShippingQuoter` port and
 * replaces this one in `src/lib/container.ts`; nothing else changes.
 */
export class FakeShippingQuoter implements ShippingQuoter {
  async quote({ method, parcel }: { postalCode: string; method: ShippingMethod; parcel: Parcel }): Promise<ShippingQuote> {
    const extraKg = Math.max(0, Math.ceil(parcel.weightG / 1000) - 1);
    const home = BASE_CENTS + extraKg * PER_EXTRA_KG_CENTS;
    return method === 'sucursal'
      ? { priceCents: Math.round(home * (1 - PICKUP_DISCOUNT)), label: 'Retiro en sucursal (simulado)', etaDays: 5 }
      : { priceCents: home, label: 'Envío a domicilio (simulado)', etaDays: 4 };
  }

  async agencies(postalCode: string): Promise<Agency[]> {
    return [
      { id: `${postalCode}-centro`, name: 'Sucursal Centro', address: 'Av. Siempre Viva 123' },
      { id: `${postalCode}-norte`, name: 'Sucursal Norte', address: 'Calle Falsa 456' },
      { id: `${postalCode}-estacion`, name: 'Sucursal Estación', address: 'Plaza de la Estación s/n' },
    ];
  }
}
