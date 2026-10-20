import { describe, expect, it } from 'vitest';

import {
  addLine,
  cartCount,
  linesOf,
  maxQuantity,
  reconcileCart,
  removeLine,
  setQuantity,
  type CartProduct,
} from '@/domain/cart/cart';

const toy: CartProduct = { id: 't1', slug: 'pista', name: 'Pista de trenes', kind: 'physical', priceCents: 1850000, stock: 3 };
const pdf: CartProduct = { id: 'd1', slug: 'cuaderno', name: 'Cuaderno', kind: 'digital', priceCents: 250000, stock: 0 };
const soldOut: CartProduct = { ...toy, id: 't2', name: 'Autito', stock: 0 };

describe('maxQuantity', () => {
  it('is 1 for a digital and the stock for a physical', () => {
    expect(maxQuantity(pdf)).toBe(1);
    expect(maxQuantity(toy)).toBe(3);
    expect(maxQuantity(soldOut)).toBe(0);
  });
});

describe('addLine', () => {
  it('adds a new line and increments an existing one', () => {
    const once = addLine([], toy);
    expect(once).toEqual([{ productId: 't1', quantity: 1 }]);
    expect(addLine(once, toy)).toEqual([{ productId: 't1', quantity: 2 }]);
  });

  it('never goes past the stock', () => {
    let lines = addLine([], toy, 3);
    lines = addLine(lines, toy);
    expect(lines).toEqual([{ productId: 't1', quantity: 3 }]);
  });

  it('keeps a digital at one unit however many times it is added', () => {
    const lines = addLine(addLine([], pdf), pdf);
    expect(lines).toEqual([{ productId: 'd1', quantity: 1 }]);
  });

  it('does not add an out-of-stock product', () => {
    expect(addLine([], soldOut)).toEqual([]);
  });

  it('does not mutate its input', () => {
    const lines = [{ productId: 't1', quantity: 1 }];
    addLine(lines, toy);
    expect(lines).toEqual([{ productId: 't1', quantity: 1 }]);
  });
});

describe('setQuantity', () => {
  const lines = [{ productId: 't1', quantity: 2 }];

  it('sets an exact quantity within the stock', () => {
    expect(setQuantity(lines, toy, 3)).toEqual([{ productId: 't1', quantity: 3 }]);
  });

  it('clamps above the stock and truncates fractions', () => {
    expect(setQuantity(lines, toy, 99)).toEqual([{ productId: 't1', quantity: 3 }]);
    expect(setQuantity(lines, toy, 2.9)).toEqual([{ productId: 't1', quantity: 2 }]);
  });

  it('removes the line at zero or below', () => {
    expect(setQuantity(lines, toy, 0)).toEqual([]);
    expect(setQuantity(lines, toy, -4)).toEqual([]);
  });
});

describe('removeLine / cartCount', () => {
  it('removes by product id and counts units', () => {
    const lines = [
      { productId: 't1', quantity: 2 },
      { productId: 'd1', quantity: 1 },
    ];
    expect(cartCount(lines)).toBe(3);
    expect(removeLine(lines, 't1')).toEqual([{ productId: 'd1', quantity: 1 }]);
  });
});

describe('reconcileCart', () => {
  it('prices lines from the catalog, not from the browser', () => {
    const summary = reconcileCart(
      [
        { productId: 't1', quantity: 2 },
        { productId: 'd1', quantity: 1 },
      ],
      [toy, pdf],
    );
    expect(summary.subtotalCents).toBe(2 * 1850000 + 250000);
    expect(summary.itemCount).toBe(3);
    expect(summary.adjustments).toEqual([]);
    expect(summary.items.map((i) => i.lineTotalCents)).toEqual([3700000, 250000]);
  });

  it('drops products that no longer exist or were unpublished, and says so', () => {
    const summary = reconcileCart([{ productId: 'gone', quantity: 1 }], [toy]);
    expect(summary.items).toEqual([]);
    expect(summary.adjustments).toHaveLength(1);
    expect(summary.adjustments[0]!.productId).toBe('gone');
  });

  it('lowers a quantity to the current stock and explains it', () => {
    const summary = reconcileCart([{ productId: 't1', quantity: 5 }], [toy]);
    expect(summary.items[0]!.quantity).toBe(3);
    expect(summary.adjustments[0]!.message).toContain('3 unidades');
  });

  it('removes a product that ran out of stock', () => {
    const summary = reconcileCart([{ productId: 't2', quantity: 1 }], [soldOut]);
    expect(summary.items).toEqual([]);
    expect(summary.adjustments[0]!.message).toContain('sin stock');
  });

  it('collapses a digital with quantity > 1 down to one', () => {
    const summary = reconcileCart([{ productId: 'd1', quantity: 4 }], [pdf]);
    expect(summary.items[0]!.quantity).toBe(1);
    expect(summary.subtotalCents).toBe(250000);
    expect(summary.adjustments).toHaveLength(1);
  });

  it('linesOf returns what survived, ready to persist', () => {
    const summary = reconcileCart(
      [
        { productId: 't1', quantity: 9 },
        { productId: 'gone', quantity: 1 },
      ],
      [toy],
    );
    expect(linesOf(summary)).toEqual([{ productId: 't1', quantity: 3 }]);
  });
});
