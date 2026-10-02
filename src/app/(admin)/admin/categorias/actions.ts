'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { DomainError } from '@/domain/shared/errors';
import { requireAdmin } from '@/lib/auth-guards';
import { container } from '@/lib/container';

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const inputSchema = z.object({ name: z.string(), slug: z.string().default('') });
const idSchema = z.string().min(1);

function toResultError(err: unknown): ActionResult<never> {
  if (err instanceof DomainError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? 'Datos inválidos' };
  throw err;
}

function revalidateCategories() {
  revalidatePath('/admin/categorias');
  // Product forms/lists and the storefront filter show category names.
  revalidatePath('/admin/productos');
  revalidatePath('/catalogo');
}

export async function createCategory(input: z.input<typeof inputSchema>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.categories.create(inputSchema.parse(input));
  } catch (err) {
    return toResultError(err);
  }
  revalidateCategories();
  return { ok: true, data: undefined };
}

export async function updateCategory(id: string, input: z.input<typeof inputSchema>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.categories.update(idSchema.parse(id), inputSchema.parse(input));
  } catch (err) {
    return toResultError(err);
  }
  revalidateCategories();
  return { ok: true, data: undefined };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.categories.delete(idSchema.parse(id));
  } catch (err) {
    return toResultError(err);
  }
  revalidateCategories();
  return { ok: true, data: undefined };
}
