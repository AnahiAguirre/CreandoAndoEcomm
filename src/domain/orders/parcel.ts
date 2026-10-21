import type { Parcel } from './ports';

/** What a physical product ships as when the admin hasn't loaded its weight and size yet. */
export const DEFAULT_PARCEL: Parcel = { weightG: 1000, lengthCm: 30, widthCm: 20, heightCm: 10 };

interface Packable {
  weightG: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
}

/**
 * One box for the whole order: weights add up, the footprint is the largest
 * item's, and the heights stack. Crude on purpose; the carrier's real quote
 * (second stage) refines it, this only has to be stable and monotonic.
 */
export function parcelFor(units: { product: Packable; quantity: number }[]): Parcel {
  const box = { weightG: 0, lengthCm: 0, widthCm: 0, heightCm: 0 };
  for (const { product, quantity } of units) {
    box.weightG += (product.weightG ?? DEFAULT_PARCEL.weightG) * quantity;
    box.lengthCm = Math.max(box.lengthCm, product.lengthCm ?? DEFAULT_PARCEL.lengthCm);
    box.widthCm = Math.max(box.widthCm, product.widthCm ?? DEFAULT_PARCEL.widthCm);
    box.heightCm += (product.heightCm ?? DEFAULT_PARCEL.heightCm) * quantity;
  }
  return box;
}
