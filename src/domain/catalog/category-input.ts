import { z } from 'zod';

/** What the admin sends when creating/renaming a category. */
export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'Solo minúsculas, números y guiones')
    .default(''),
});

export type CategoryInput = z.input<typeof categoryInputSchema>;
