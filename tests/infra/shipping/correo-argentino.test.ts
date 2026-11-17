import { describe, expect, it, vi } from 'vitest';

import type { Order } from '@/domain/orders/order';
import { ShipmentFailedError, ShippingUnavailableError } from '@/domain/orders/ports';
import { CorreoClient } from '@/infra/shipping/correo-argentino/client';
import { CorreoQuoter } from '@/infra/shipping/correo-argentino/correo-quoter';
import { CorreoShipmentCreator } from '@/infra/shipping/correo-argentino/correo-shipment-creator';

const config = { env: 'test', user: 'api-user', password: 'api-pass', customerId: 'cust-1', originPostalCode: '1165' } as const;
const parcel = { weightG: 1000, lengthCm: 30, widthCm: 20, heightCm: 10 };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const FUTURE = () => new Date(Date.now() + 3_600_000).toISOString();

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;

/** A fake MiCorreo: answers /token itself and hands every other call to `handler`. */
function fakeCorreo(handler: Handler) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith('/token')) return json({ token: `jwt-${calls.filter((c) => c.url.endsWith('/token')).length}`, expires: FUTURE() });
    return handler(url, init);
  }) as unknown as typeof fetch;
  return { calls, client: new CorreoClient(config, fetchImpl), tokenCalls: () => calls.filter((c) => c.url.endsWith('/token')).length };
}

describe('CorreoClient', () => {
  it('authenticates with Basic auth against the test host and reuses the token', async () => {
    const { client, calls, tokenCalls } = fakeCorreo(() => json({ rates: [] }));
    await client.rates({ postalCodeDestination: '1425', deliveredType: 'D', weightG: 1000, lengthCm: 30, widthCm: 20, heightCm: 10 });
    await client.rates({ postalCodeDestination: '1425', deliveredType: 'D', weightG: 1000, lengthCm: 30, widthCm: 20, heightCm: 10 });

    expect(tokenCalls()).toBe(1);
    const auth = (calls[0]!.init.headers as Record<string, string>).Authorization;
    expect(calls[0]!.url).toBe('https://apitest.correoargentino.com.ar/micorreo/v1/token');
    expect(auth).toBe(`Basic ${Buffer.from('api-user:api-pass').toString('base64')}`);
    expect((calls[1]!.init.headers as Record<string, string>).Authorization).toBe('Bearer jwt-1');
  });

  it('sends the origin, customer and box to /rates', async () => {
    const { client, calls } = fakeCorreo(() => json({ rates: [] }));
    await client.rates({ postalCodeDestination: '5000', deliveredType: 'S', weightG: 2500, lengthCm: 40, widthCm: 25, heightCm: 8 });
    expect(JSON.parse(String(calls[1]!.init.body))).toEqual({
      customerId: 'cust-1',
      postalCodeOrigin: '1165',
      postalCodeDestination: '5000',
      deliveredType: 'S',
      dimensions: { weight: 2500, length: 40, width: 25, height: 8 },
    });
  });

  it('renews the token once on a 401 and retries', async () => {
    let first = true;
    const { client, tokenCalls } = fakeCorreo(() => {
      if (first) {
        first = false;
        return json({}, 401);
      }
      return json({ rates: [] });
    });
    await client.rates({ postalCodeDestination: '1425', deliveredType: 'D', weightG: 1, lengthCm: 1, widthCm: 1, heightCm: 1 });
    expect(tokenCalls()).toBe(2);
  });

  it('turns a failure, an unexpected answer and a dead network into one friendly error', async () => {
    const down = fakeCorreo(() => json({ message: 'boom' }, 500));
    await expect(down.client.agencies('C')).rejects.toBeInstanceOf(ShippingUnavailableError);

    const odd = fakeCorreo(() => json({ rates: 'nope' }));
    await expect(
      odd.client.rates({ postalCodeDestination: '1425', deliveredType: 'D', weightG: 1, lengthCm: 1, widthCm: 1, heightCm: 1 }),
    ).rejects.toBeInstanceOf(ShippingUnavailableError);

    const offline = new CorreoClient(config, (async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch);
    await expect(offline.agencies('C')).rejects.toBeInstanceOf(ShippingUnavailableError);
  });
});

describe('CorreoQuoter', () => {
  const rates = {
    rates: [
      { deliveredType: 'D', productName: 'Expreso', price: 9000.5, deliveryTimeMax: '3' },
      { deliveredType: 'D', productName: 'Clásico', price: 6500.25, deliveryTimeMax: '6' },
      { deliveredType: 'S', productName: 'Clásico a sucursal', price: 4800, deliveryTimeMax: '5' },
    ],
  };

  it('picks the cheapest rate of the asked kind and converts pesos to cents', async () => {
    const { client } = fakeCorreo(() => json(rates));
    const quoter = new CorreoQuoter(client);
    expect(await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel })).toEqual({
      priceCents: 650025,
      label: 'Clásico',
      etaDays: 6,
    });
    expect((await quoter.quote({ postalCode: 'C1425ABC', method: 'sucursal', parcel })).priceCents).toBe(480000);
  });

  it('prices by the 4-digit code even when the buyer typed a CPA', async () => {
    const { client, calls } = fakeCorreo(() => json(rates));
    await new CorreoQuoter(client).quote({ postalCode: 'C1425ABC', method: 'domicilio', parcel });
    expect(JSON.parse(String(calls[1]!.init.body)).postalCodeDestination).toBe('1425');
  });

  it('says so when the carrier does not reach that postal code', async () => {
    const { client } = fakeCorreo(() => json({ rates: [] }));
    await expect(new CorreoQuoter(client).quote({ postalCode: '9999', method: 'domicilio', parcel })).rejects.toThrow(
      /no llega/,
    );
  });

  it('refuses a box the carrier would reject, without asking', async () => {
    const { client, calls } = fakeCorreo(() => json(rates));
    await expect(
      new CorreoQuoter(client).quote({ postalCode: '1425', method: 'domicilio', parcel: { ...parcel, weightG: 30_000 } }),
    ).rejects.toBeInstanceOf(ShippingUnavailableError);
    expect(calls).toHaveLength(0);
  });

  const agency = (code: string, postalCode: string, extra: object = {}) => ({
    code,
    name: `Sucursal ${code}`,
    status: 'ACTIVE',
    services: { packageReception: true, pickupAvailability: true },
    location: { address: { streetName: 'Calle', streetNumber: '1', locality: 'Lugar', postalCode } },
    ...extra,
  });

  it('lists the branches nearest to the postal code first, without the inactive or no-pickup ones', async () => {
    const { client } = fakeCorreo(() =>
      json([
        agency('far', '1900'),
        agency('exact', '1425'),
        agency('off', '1425', { status: 'INACTIVE' }),
        agency('nopickup', '1425', { services: { pickupAvailability: false } }),
        agency('near', '1430'),
      ]),
    );
    const list = await new CorreoQuoter(client).agencies({ provinceCode: 'C', postalCode: '1425' });
    expect(list.map((a) => a.id)).toEqual(['exact', 'near', 'far']);
    expect(list[0]).toEqual({ id: 'exact', name: 'Sucursal exact', address: 'Calle 1, Lugar' });
  });

  it('asks for a province once and serves the next search from memory', async () => {
    const { client, calls } = fakeCorreo(() => json([agency('a', '1425')]));
    const quoter = new CorreoQuoter(client);
    await quoter.agencies({ provinceCode: 'C', postalCode: '1425' });
    await quoter.agencies({ provinceCode: 'C', postalCode: '1425' });
    expect(calls.filter((c) => c.url.includes('/agencies'))).toHaveLength(1);
  });
});

describe('CorreoShipmentCreator', () => {
  const base: Order = {
    id: 'abcdef12-0000-0000-0000-000000000000',
    userId: 'u1',
    email: 'ana@example.com',
    status: 'paid',
    items: [
      { productId: 't', name: 'Pista', kind: 'physical', unitPriceCents: 1850000, quantity: 2 },
      { productId: 'd', name: 'Cuaderno', kind: 'digital', unitPriceCents: 250000, quantity: 1 },
    ],
    subtotalCents: 3950000,
    shippingCents: 650025,
    discountCents: 0,
    couponCode: null,
    totalCents: 4600025,
    shipping: {
      method: 'domicilio',
      recipient: 'Ana Pérez',
      phone: '11 5555-1234',
      postalCode: '1425',
      address: 'Av. Santa Fe 1234, Palermo',
      agency: null,
      quoteLabel: 'Clásico',
      provinceCode: 'C',
      street: { name: 'Av. Santa Fe', number: '1234', floor: null, apartment: 'B', city: 'Palermo' },
      parcel: { weightG: 2000, lengthCm: 30, widthCm: 20, heightCm: 20 },
    },
    mpPaymentId: 'p1',
    needsStockReview: false,
    createdAt: new Date(),
    paidAt: new Date(),
  };

  const importBody = (calls: { url: string; init: RequestInit }[]) =>
    JSON.parse(String(calls.find((c) => c.url.endsWith('/shipping/import'))!.init.body));

  it('registers a home delivery with the address in pieces and the box that was quoted', async () => {
    const { client, calls } = fakeCorreo(() => json({ createdAt: new Date().toISOString() }));
    expect(await new CorreoShipmentCreator(client).create(base)).toBe('created');
    expect(importBody(calls)).toEqual({
      customerId: 'cust-1',
      extOrderId: base.id,
      orderNumber: 'abcdef12',
      recipient: { name: 'Ana Pérez', email: 'ana@example.com', phone: '11 5555-1234' },
      shipping: {
        deliveryType: 'D',
        address: {
          streetName: 'Av. Santa Fe',
          streetNumber: '1234',
          apartment: 'B',
          city: 'Palermo',
          provinceCode: 'C',
          postalCode: '1425',
        },
        weight: 2000,
        length: 30,
        width: 20,
        height: 20,
        declaredValue: 37000, // only the toys, in pesos
      },
    });
  });

  it('registers a pickup with the branch code', async () => {
    const { client, calls } = fakeCorreo(() => json({}));
    const pickup: Order = {
      ...base,
      shipping: { ...base.shipping!, method: 'sucursal', street: undefined, address: null, agency: 'Sucursal Centro', agencyCode: 'SUC-9' },
    };
    await new CorreoShipmentCreator(client).create(pickup);
    expect(importBody(calls).shipping).toMatchObject({ deliveryType: 'S', agency: 'SUC-9' });
    expect(importBody(calls).shipping.address).toBeUndefined();
  });

  it('fails clearly for an order made before the integration, without calling the carrier', async () => {
    const { client, calls } = fakeCorreo(() => json({}));
    const old: Order = { ...base, shipping: { ...base.shipping!, provinceCode: undefined, street: undefined } };
    await expect(new CorreoShipmentCreator(client).create(old)).rejects.toBeInstanceOf(ShipmentFailedError);
    expect(calls).toHaveLength(0);
  });

  it('turns a carrier refusal into a ShipmentFailedError', async () => {
    const { client } = fakeCorreo(() => json({ message: 'direccion invalida' }, 422));
    await expect(new CorreoShipmentCreator(client).create(base)).rejects.toBeInstanceOf(ShipmentFailedError);
  });
});
