import { describe, expect, it } from 'vitest';

import { coverImage, isDigital, isInStock } from '@/domain/catalog/product';

import { buildImage } from '../../helpers/fakes';

describe('isDigital', () => {
  it('distinguishes PDFs from toys', () => {
    expect(isDigital({ kind: 'digital' })).toBe(true);
    expect(isDigital({ kind: 'physical' })).toBe(false);
  });
});

describe('isInStock', () => {
  it('digital products are always sellable regardless of stock', () => {
    expect(isInStock({ kind: 'digital', stock: 0 })).toBe(true);
  });

  it('physical products need stock > 0', () => {
    expect(isInStock({ kind: 'physical', stock: 1 })).toBe(true);
    expect(isInStock({ kind: 'physical', stock: 0 })).toBe(false);
  });
});

describe('coverImage', () => {
  it('returns the image with the lowest position, not the first in the array', () => {
    const second = buildImage({ position: 1 });
    const first = buildImage({ position: 0 });
    expect(coverImage({ images: [second, first] })).toBe(first);
  });

  it('does not mutate the original order', () => {
    const images = [buildImage({ position: 2 }), buildImage({ position: 1 })];
    coverImage({ images });
    expect(images[0].position).toBe(2);
  });

  it('is undefined for a product without images', () => {
    expect(coverImage({ images: [] })).toBeUndefined();
  });
});
