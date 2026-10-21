import { beforeEach, describe, expect, it } from 'vitest';

import { CartChangedError, ShippingRequiredError } from '@/domain/orders/order';
import { ConfirmPayment } from '@/domain/orders/use-cases/confirm-payment';
import { CreateCheckout, DigitalNotReadyError, UnknownAgencyError } from '@/domain/orders/use-cases/create-checkout';

import {
  buildFile,
  buildProduct,
  FakePaymentGateway,
  FakeShippingQuoter,
  InMemoryOrderRepository,
  InMemoryProductRepository,
} from '../../helpers/fakes';

const shipping = { method: 'domicilio', recipient: 'Ana Pérez', phone: '11 5555-1234', postalCode: '1425', address: 'Av. Santa Fe 1234' };

function setup() {
  const toy = buildProduct({ id: 'toy', slug: 'pista', name: 'Pista', kind: 'physical', priceCents: 1850000, stock: 5, active: true });
  const pdf = buildProduct({
    id: 'pdf',
    slug: 'cuaderno',
    name: 'Cuaderno',
    kind: 'digital',
    priceCents: 250000,
    active: true,
    files: [buildFile()],
  });
  const products = new InMemoryProductRepository([toy, pdf]);
  const orders = new InMemoryOrderRepository(products);
  const gateway = new FakePaymentGateway();
  const quoter = new FakeShippingQuoter();
  const granted: { productId: string; email: string; orderId: string | null }[] = [];
  const delivery = {
    async grant(productId: string, email: string, orderId: string | null) {
      granted.push({ productId, email, orderId });
    },
  };
  return {
    products,
    orders,
    gateway,
    quoter,
    granted,
    checkout: new CreateCheckout(products, orders, gateway, quoter),
    confirm: new ConfirmPayment(orders, gateway, delivery),
  };
}

const buyer = { userId: 'u1', email: 'Ana@Example.com' };

describe('CreateCheckout.start', () => {
  let t: ReturnType<typeof setup>;
  beforeEach(() => {
    t = setup();
  });

  it('creates a pending order priced from the catalog and sends the buyer to the gateway', async () => {
    const { orderId, redirectUrl } = await t.checkout.start(buyer, [{ productId: 'pdf', quantity: 1 }], undefined);
    const order = (await t.orders.findById(orderId))!;
    expect(order.status).toBe('pending');
    expect(order.email).toBe('ana@example.com');
    expect(order.totalCents).toBe(250000);
    expect(order.shipping).toBeNull();
    expect(redirectUrl).toContain(orderId);
  });

  it('re-quotes shipping itself for a physical order and adds it to the total', async () => {
    const { orderId } = await t.checkout.start(buyer, [{ productId: 'toy', quantity: 2 }], shipping);
    const order = (await t.orders.findById(orderId))!;
    expect(order.shippingCents).toBe(500000);
    expect(order.totalCents).toBe(2 * 1850000 + 500000);
    expect(order.shipping?.recipient).toBe('Ana Pérez');
    expect(t.quoter.quotes).toHaveLength(1);
  });

  it('refuses to sell a printable that has no PDF yet, so nobody pays for nothing', async () => {
    t.products.items.set('empty', buildProduct({ id: 'empty', kind: 'digital', priceCents: 100000, active: true, files: [] }));
    await expect(t.checkout.start(buyer, [{ productId: 'empty', quantity: 1 }], undefined)).rejects.toBeInstanceOf(
      DigitalNotReadyError,
    );
    expect(t.orders.items.size).toBe(0);
  });

  it('needs shipping details for a physical item', async () => {
    await expect(t.checkout.start(buyer, [{ productId: 'toy', quantity: 1 }], undefined)).rejects.toBeInstanceOf(
      ShippingRequiredError,
    );
  });

  it('refuses a branch that is not in the quoted list', async () => {
    const pickup = { ...shipping, method: 'sucursal', address: undefined, agencyId: 'otra' };
    await expect(t.checkout.start(buyer, [{ productId: 'toy', quantity: 1 }], pickup)).rejects.toBeInstanceOf(
      UnknownAgencyError,
    );
  });

  it('does not create an order when the cart changed', async () => {
    await expect(t.checkout.start(buyer, [{ productId: 'toy', quantity: 99 }], shipping)).rejects.toBeInstanceOf(
      CartChangedError,
    );
    expect(t.orders.items.size).toBe(0);
  });
});

describe('ConfirmPayment', () => {
  let t: ReturnType<typeof setup>;
  let orderId: string;

  beforeEach(async () => {
    t = setup();
    ({ orderId } = await t.checkout.start(
      buyer,
      [
        { productId: 'toy', quantity: 2 },
        { productId: 'pdf', quantity: 1 },
      ],
      shipping,
    ));
  });

  const pay = (status: 'approved' | 'rejected' | 'cancelled' | 'pending', amountCents?: number) => {
    const total = [...t.orders.items.values()][0]!.totalCents;
    t.gateway.payments.set('pay-1', { id: 'pay-1', status, orderId, amountCents: amountCents ?? total });
  };

  it('approved: marks paid, takes the stock off and delivers the PDF to the buyer', async () => {
    pay('approved');
    const outcome = await t.confirm.fromPaymentId('pay-1');
    expect(outcome.kind).toBe('paid');
    expect((await t.orders.findById(orderId))!.status).toBe('paid');
    expect(t.products.items.get('toy')!.stock).toBe(3);
    expect(t.granted).toEqual([{ productId: 'pdf', email: 'ana@example.com', orderId }]);
  });

  it('is idempotent: a webhook retry does not take the stock off twice', async () => {
    pay('approved');
    await t.confirm.fromPaymentId('pay-1');
    await t.confirm.fromPaymentId('pay-1');
    expect(t.products.items.get('toy')!.stock).toBe(3);
  });

  it('delivers on a retry even if the first attempt died after marking paid', async () => {
    pay('approved');
    await t.orders.markPaid(orderId, 'pay-1'); // "paid" happened, the grant did not
    await t.confirm.fromPaymentId('pay-1');
    expect(t.granted).toHaveLength(1);
  });

  it('never trusts the amount: a different amount delivers nothing', async () => {
    pay('approved', 100);
    const outcome = await t.confirm.fromPaymentId('pay-1');
    expect(outcome.kind).toBe('amount-mismatch');
    expect((await t.orders.findById(orderId))!.status).toBe('pending');
    expect(t.granted).toEqual([]);
  });

  it('flags the order for review when the stock ran out meanwhile, but still takes the payment', async () => {
    t.products.items.get('toy')!.stock = 1;
    pay('approved');
    await t.confirm.fromPaymentId('pay-1');
    const order = (await t.orders.findById(orderId))!;
    expect(order.status).toBe('paid');
    expect(order.needsStockReview).toBe(true);
  });

  it('rejected: the order is marked rejected and nothing is delivered', async () => {
    pay('rejected');
    const outcome = await t.confirm.fromPaymentId('pay-1');
    expect(outcome.kind).toBe('unpaid');
    expect((await t.orders.findById(orderId))!.status).toBe('rejected');
    expect(t.granted).toEqual([]);
  });

  it('a late rejection never downgrades an order that is already paid', async () => {
    pay('approved');
    await t.confirm.fromPaymentId('pay-1');
    t.gateway.payments.set('pay-2', { id: 'pay-2', status: 'rejected', orderId, amountCents: 1 });
    await t.confirm.fromPaymentId('pay-2');
    expect((await t.orders.findById(orderId))!.status).toBe('paid');
  });

  it('pending stays pending', async () => {
    pay('pending');
    expect((await t.confirm.fromPaymentId('pay-1')).kind).toBe('pending');
  });

  it('ignores an unknown payment and a payment without our order reference', async () => {
    expect((await t.confirm.fromPaymentId('nope')).kind).toBe('ignored');
    t.gateway.payments.set('x', { id: 'x', status: 'approved', orderId: null, amountCents: 1 });
    expect((await t.confirm.fromPaymentId('x')).kind).toBe('ignored');
  });

  it('syncOrder (the return page) reaches the same result without the webhook', async () => {
    pay('approved');
    const outcome = await t.confirm.syncOrder(orderId);
    expect(outcome.kind).toBe('paid');
    expect(t.granted).toHaveLength(1);
  });

  it('syncOrder with no payment yet reports pending', async () => {
    expect((await t.confirm.syncOrder(orderId)).kind).toBe('pending');
  });
});
