import { describe, expect, it } from 'vitest';

import { ManualShippingQuoter } from '@/infra/shipping/manual-shipping-quoter';

describe('ManualShippingQuoter', () => {
  const quoter = new ManualShippingQuoter();

  it('adds nothing to the payment: the carrier cost is agreed by message', async () => {
    const quote = await quoter.quote();
    expect(quote.priceCents).toBe(0);
    expect(quote.label).toContain('a coordinar');
  });

  it('has no branches to choose from', async () => {
    expect(await quoter.agencies()).toEqual([]);
  });
});
