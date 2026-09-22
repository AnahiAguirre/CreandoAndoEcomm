import { z } from 'zod';

import { PRODUCT_KINDS } from './product';

/**
 * What the admin sends when creating/editing a product. Shared by the form
 * (client-side hints) and the Server Action (the real validation).
 * Prices arrive as a decimal string ("1850.50") and become integer cents here —
 * the domain never sees a float.
 */
export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(140)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'Solo minúsculas, números y guiones')
      .default(''),
    description: z.string().trim().max(5000).default(''),
    kind: z.enum(PRODUCT_KINDS),
    price: z
      .string()
      .trim()
      .regex(/^\d+(?:[.,]\d{1,2})?$/, 'Precio inválido (ej: 1850 o 1850,50)')
      .transform(toCents),
    stock: z.coerce.number().int().min(0).default(0),
    weightG: optionalPositiveInt(),
    lengthCm: optionalPositiveInt(),
    widthCm: optionalPositiveInt(),
    heightCm: optionalPositiveInt(),
  })
  .transform((data) => ({
    ...data,
    slug: data.slug || slugify(data.name),
    // Digital products have no stock or shipping dimensions, whatever the form sent.
    ...(data.kind === 'digital'
      ? { stock: 0, weightG: null, lengthCm: null, widthCm: null, heightCm: null }
      : {}),
  }));

export type ProductInput = z.output<typeof productInputSchema>;
export type ProductFormValues = z.input<typeof productInputSchema>;

function optionalPositiveInt() {
  return z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.coerce.number().int().positive().nullable(),
  );
}

function toCents(price: string): number {
  const [whole, fraction = ''] = price.replace(',', '.').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

/** Inverse of `toCents`, for pre-filling the edit form. */
export function centsToPriceString(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}
