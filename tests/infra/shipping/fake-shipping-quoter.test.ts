import { describe, expect, it } from 'vitest';

import { FakeShippingQuoter } from '@/infra/shipping/fake-shipping-quoter';

const quoter = new FakeShippingQuoter();
const parcel = (weightG: number) => ({ weightG, lengthCm: 30, widthCm: 20, heightCm: 10 });

describe('FakeShippingQuoter', () => {
  it('charges the base price up to 1 kg and $1.200 per extra kg', async () => {
    expect((await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel: parcel(900) })).priceCents).toBe(450000);
    expect((await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel: parcel(1000) })).priceCents).toBe(450000);
    expect((await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel: parcel(2500) })).priceCents).toBe(
      450000 + 2 * 120000,
    );
  });

  it('is cheaper to pick up at a branch', async () => {
    const home = await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel: parcel(1000) });
    const pickup = await quoter.quote({ postalCode: '1425', method: 'sucursal', parcel: parcel(1000) });
    expect(pickup.priceCents).toBeLessThan(home.priceCents);
  });

  it('always says it is simulated, so nobody mistakes it for a real price', async () => {
    expect((await quoter.quote({ postalCode: '1425', method: 'domicilio', parcel: parcel(1) })).label).toContain('simulado');
  });

  it('lists branches with stable ids per postal code', async () => {
    const first = await quoter.agencies('1425');
    const again = await quoter.agencies('1425');
    expect(first).toHaveLength(3);
    expect(first.map((a) => a.id)).toEqual(again.map((a) => a.id));
  });
});
