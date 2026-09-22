import { describe, expect, it } from 'vitest';

import { centsToPriceString, productInputSchema, slugify } from '@/domain/catalog/product-input';

const valid = {
  name: 'Cuaderno para colorear: Animales',
  kind: 'digital',
  price: '2500',
};

describe('productInputSchema', () => {
  describe('price → integer cents', () => {
    it.each([
      ['2500', 250000],
      ['2500,50', 250050],
      ['2500.50', 250050],
      ['0', 0],
      ['18500,5', 1850050],
    ])('parses %s as %d cents', (price, cents) => {
      expect(productInputSchema.parse({ ...valid, price }).price).toBe(cents);
    });

    it('rejects more than two decimals, negatives and garbage', () => {
      for (const price of ['1,234', '-5', 'abc', '10,', '']) {
        expect(productInputSchema.safeParse({ ...valid, price }).success, price).toBe(false);
      }
    });

    it('never produces a float (avoids 0.1 + 0.2 style errors)', () => {
      const { price } = productInputSchema.parse({ ...valid, price: '19,99' });
      expect(Number.isInteger(price)).toBe(true);
      expect(price).toBe(1999);
    });
  });

  describe('slug', () => {
    it('derives the slug from the name when empty', () => {
      expect(productInputSchema.parse(valid).slug).toBe('cuaderno-para-colorear-animales');
    });

    it('keeps an explicit slug, lower-cased and trimmed', () => {
      expect(productInputSchema.parse({ ...valid, slug: '  Mi-Slug-1 ' }).slug).toBe('mi-slug-1');
    });

    it('rejects slugs with spaces, accents or symbols', () => {
      for (const slug of ['con espacio', 'acentós', 'a_b', '-inicio', 'fin-']) {
        expect(productInputSchema.safeParse({ ...valid, slug }).success, slug).toBe(false);
      }
    });
  });

  describe('kind-specific normalization', () => {
    it('digital products drop stock and dimensions whatever the form sent', () => {
      const out = productInputSchema.parse({ ...valid, stock: '7', weightG: '100', lengthCm: '10' });
      expect(out.stock).toBe(0);
      expect(out.weightG).toBeNull();
      expect(out.lengthCm).toBeNull();
      expect(out.widthCm).toBeNull();
      expect(out.heightCm).toBeNull();
    });

    it('physical products keep stock and dimensions; empty strings become null', () => {
      const out = productInputSchema.parse({
        ...valid,
        kind: 'physical',
        stock: '5',
        weightG: '400',
        lengthCm: '',
        widthCm: '25',
      });
      expect(out.stock).toBe(5);
      expect(out.weightG).toBe(400);
      expect(out.lengthCm).toBeNull();
      expect(out.widthCm).toBe(25);
      expect(out.heightCm).toBeNull();
    });

    it('rejects negative stock and non-positive dimensions', () => {
      expect(productInputSchema.safeParse({ ...valid, kind: 'physical', stock: '-1' }).success).toBe(false);
      expect(productInputSchema.safeParse({ ...valid, kind: 'physical', weightG: '0' }).success).toBe(false);
    });
  });

  it('requires a name of at least 2 chars and a known kind', () => {
    expect(productInputSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...valid, kind: 'service' }).success).toBe(false);
  });

  it('defaults description to empty string', () => {
    expect(productInputSchema.parse(valid).description).toBe('');
  });
});

describe('slugify', () => {
  it.each([
    ['Cuaderno para colorear: Animales', 'cuaderno-para-colorear-animales'],
    ['  Rompecabezas   de Madera ', 'rompecabezas-de-madera'],
    ['Niños & Niñas — ¡Édición 2026!', 'ninos-ninas-edicion-2026'],
    ['', ''],
  ])('slugify(%j) → %j', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('caps length at 140', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(140);
  });
});

describe('centsToPriceString', () => {
  it('round-trips with the schema price parser, using a comma', () => {
    expect(centsToPriceString(250050)).toBe('2500,50');
    expect(centsToPriceString(100000)).toBe('1000,00');
    expect(productInputSchema.parse({ ...valid, price: centsToPriceString(1999) }).price).toBe(1999);
  });
});
