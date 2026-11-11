import type { ProvinceCode, ShippingMethod } from '@/domain/orders/order';
import {
  type Agency,
  type Parcel,
  type ShippingQuote,
  type ShippingQuoter,
  ShippingUnavailableError,
} from '@/domain/orders/ports';

import type { CorreoAgency, CorreoClient } from './client';

// MiCorreo refuses anything outside these limits.
const MAX_WEIGHT_G = 25_000;
const MAX_SIDE_CM = 150;
const MAX_AGENCIES = 40;
const AGENCIES_TTL_MS = 10 * 60_000;

export class CorreoQuoter implements ShippingQuoter {
  private readonly agencyCache = new Map<string, { at: number; list: CorreoAgency[] }>();

  constructor(private readonly client: CorreoClient) {}

  async quote({
    postalCode,
    method,
    parcel,
  }: {
    postalCode: string;
    method: ShippingMethod;
    parcel: Parcel;
  }): Promise<ShippingQuote> {
    if (parcel.weightG > MAX_WEIGHT_G || Math.max(parcel.lengthCm, parcel.widthCm, parcel.heightCm) > MAX_SIDE_CM) {
      throw new ShippingUnavailableError('Tu pedido es demasiado grande para un solo envío. Hacelo en dos compras.');
    }
    const deliveredType = method === 'sucursal' ? 'S' : 'D';
    const rates = await this.client.rates({
      postalCodeDestination: digits(postalCode),
      deliveredType,
      weightG: Math.max(1, Math.round(parcel.weightG)),
      lengthCm: Math.max(1, Math.round(parcel.lengthCm)),
      widthCm: Math.max(1, Math.round(parcel.widthCm)),
      heightCm: Math.max(1, Math.round(parcel.heightCm)),
    });
    const cheapest = rates.filter((r) => r.deliveredType === deliveredType).sort((a, b) => a.price - b.price)[0];
    if (!cheapest) throw new ShippingUnavailableError('Correo Argentino no llega a ese código postal.');
    return {
      priceCents: Math.round(cheapest.price * 100),
      label: cheapest.productName,
      etaDays: cheapest.deliveryTimeMax ?? 0,
      simulated: false,
    };
  }

  async agencies({ provinceCode, postalCode }: { provinceCode: ProvinceCode; postalCode: string }): Promise<Agency[]> {
    const wanted = Number(digits(postalCode));
    return (await this.inProvince(provinceCode))
      .filter((a) => a.status !== 'INACTIVE' && a.services?.pickupAvailability !== false)
      .map((agency) => ({ agency, distance: Math.abs(Number(digits(agency.location.address.postalCode ?? '')) - wanted) }))
      .sort((a, b) => a.distance - b.distance || a.agency.name.localeCompare(b.agency.name))
      .slice(0, MAX_AGENCIES)
      .map(({ agency }) => ({ id: agency.code, name: agency.name, address: addressOf(agency) }));
  }

  private async inProvince(provinceCode: string): Promise<CorreoAgency[]> {
    const hit = this.agencyCache.get(provinceCode);
    if (hit && Date.now() - hit.at < AGENCIES_TTL_MS) return hit.list;
    const list = await this.client.agencies(provinceCode);
    this.agencyCache.set(provinceCode, { at: Date.now(), list });
    return list;
  }
}

/** "C1425ABC" → "1425": the carrier prices by the 4-digit code. */
function digits(postalCode: string): string {
  return postalCode.replace(/\D/g, '');
}

function addressOf({ location: { address: a } }: CorreoAgency): string {
  const street = [a.streetName, a.streetNumber].filter(Boolean).join(' ');
  return [street, a.locality ?? a.city].filter(Boolean).join(', ');
}
