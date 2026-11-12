import { describe, expect, it } from 'vitest';

import { fromPrice, fromPriceOfKind, heroProduct, heroToys, homeShowcase } from '@/domain/catalog/storefront';

import { buildProduct } from '../../helpers/fakes';

const day = (n: number) => new Date(2026, 0, n);

describe('homeShowcase', () => {
  it('puts what the admin featured first, then fills with the newest', () => {
    const old = buildProduct({ id: 'old', createdAt: day(1), featured: true });
    const newer = buildProduct({ id: 'newer', createdAt: day(5) });
    const newest = buildProduct({ id: 'newest', createdAt: day(9) });
    expect(homeShowcase([newer, old, newest]).map((p) => p.id)).toEqual(['old', 'newest', 'newer']);
  });

  it('shows the newest when nothing is featured, up to the limit', () => {
    const products = [1, 2, 3, 4].map((n) => buildProduct({ id: `p${n}`, createdAt: day(n) }));
    expect(homeShowcase(products, 3).map((p) => p.id)).toEqual(['p4', 'p3', 'p2']);
  });

  it('never leads with something that cannot be bought', () => {
    const soldOut = buildProduct({ id: 'soldout', kind: 'physical', stock: 0, featured: true, createdAt: day(9) });
    const toy = buildProduct({ id: 'toy', kind: 'physical', stock: 3, createdAt: day(1) });
    expect(homeShowcase([soldOut, toy]).map((p) => p.id)).toEqual(['toy', 'soldout']);
    expect(heroProduct([soldOut, toy])?.id).toBe('toy');
  });

  it('has no hero when nothing is for sale', () => {
    expect(heroProduct([])).toBeUndefined();
    expect(heroProduct([buildProduct({ kind: 'physical', stock: 0 })])).toBeUndefined();
  });
});

describe('heroToys', () => {
  it('rotates only toys that can be bought, featured first', () => {
    const pdf = buildProduct({ id: 'pdf', kind: 'digital', featured: true, createdAt: day(9) });
    const soldOut = buildProduct({ id: 'soldout', kind: 'physical', stock: 0, createdAt: day(8) });
    const car = buildProduct({ id: 'car', kind: 'physical', stock: 2, createdAt: day(7) });
    const track = buildProduct({ id: 'track', kind: 'physical', stock: 1, featured: true, createdAt: day(1) });
    expect(heroToys([pdf, soldOut, car, track]).map((p) => p.id)).toEqual(['track', 'car']);
  });
});

describe('fromPriceOfKind', () => {
  const toy = buildProduct({ kind: 'physical', stock: 2, priceCents: 900000 });
  const soldOutToy = buildProduct({ kind: 'physical', stock: 0, priceCents: 100 });
  const pdf = buildProduct({ kind: 'digital', priceCents: 250000 });

  it('is the cheapest of that kind that can be bought', () => {
    expect(fromPriceOfKind([toy, soldOutToy, pdf], 'physical')).toBe(900000);
    expect(fromPriceOfKind([toy, pdf], 'digital')).toBe(250000);
  });

  it('is null when there is nothing of that kind to buy', () => {
    expect(fromPriceOfKind([soldOutToy], 'physical')).toBeNull();
    expect(fromPriceOfKind([], 'digital')).toBeNull();
  });
});

describe('fromPrice', () => {
  const cheap = buildProduct({ categoryId: 'c1', priceCents: 900000, kind: 'physical', stock: 2 });
  const pricey = buildProduct({ categoryId: 'c1', priceCents: 2000000, kind: 'physical', stock: 2 });
  const soldOut = buildProduct({ categoryId: 'c1', priceCents: 100, kind: 'physical', stock: 0 });
  const other = buildProduct({ categoryId: 'c2', priceCents: 50 });

  it('is the cheapest product of that category that can be bought', () => {
    expect(fromPrice([cheap, pricey, soldOut, other], 'c1')).toBe(900000);
  });

  it('is null for an empty or unknown category', () => {
    expect(fromPrice([cheap], 'c3')).toBeNull();
    expect(fromPrice([cheap], undefined)).toBeNull();
  });
});
