'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { productInputSchema } from '@/domain/catalog/product-input';
import type { UploadKind, UploadTicket } from '@/domain/catalog/use-cases/catalog-admin';
import { DomainError } from '@/domain/shared/errors';
import { requireAdmin } from '@/lib/auth-guards';
import { container } from '@/lib/container';

// ---------- product form ----------

export type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message?: string; fieldErrors?: Record<string, string[]> };

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

function toFormError(err: unknown): FormState {
  if (err instanceof z.ZodError) {
    const { fieldErrors, formErrors } = z.flattenError(err);
    const cleaned: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(fieldErrors as Record<string, string[] | undefined>)) {
      if (messages && messages.length > 0) cleaned[field] = messages;
    }
    return { status: 'error', message: formErrors[0], fieldErrors: cleaned };
  }
  if (err instanceof DomainError) return { status: 'error', message: err.message };
  throw err;
}

function toResultError(err: unknown): ActionResult<never> {
  if (err instanceof DomainError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? 'Datos inválidos' };
  throw err;
}

function revalidateProduct(id?: string) {
  revalidatePath('/admin/productos');
  if (id) revalidatePath(`/admin/productos/${id}`);
  // Storefront pages are dynamic, but keep the cache honest anyway.
  revalidatePath('/');
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  let id: string;
  try {
    const input = productInputSchema.parse(formToObject(formData));
    const product = await container.catalog.admin.create(input);
    id = product.id;
  } catch (err) {
    return toFormError(err);
  }
  revalidateProduct(id);
  redirect(`/admin/productos/${id}?created=1`);
}

export async function updateProduct(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const input = productInputSchema.parse(formToObject(formData));
    await container.catalog.admin.update(id, input);
  } catch (err) {
    return toFormError(err);
  }
  revalidateProduct(id);
  return { status: 'success' };
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.admin.setActive(id, active);
  } catch (err) {
    return toResultError(err);
  }
  revalidateProduct(id);
  return { ok: true, data: undefined };
}

// ---------- uploads (browser → Storage; we only issue and confirm tickets) ----------

const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export async function prepareUpload(
  productId: string,
  kind: UploadKind,
  request: z.input<typeof uploadRequestSchema>,
): Promise<ActionResult<UploadTicket>> {
  await requireAdmin();
  try {
    const ticket = await container.catalog.admin.prepareUpload(productId, kind, uploadRequestSchema.parse(request));
    return { ok: true, data: ticket };
  } catch (err) {
    return toResultError(err);
  }
}

export async function confirmImageUpload(productId: string, path: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.admin.confirmImageUpload(productId, path);
  } catch (err) {
    return toResultError(err);
  }
  revalidateProduct(productId);
  return { ok: true, data: undefined };
}

export async function confirmFileUpload(
  productId: string,
  path: string,
  filename: string,
  sizeBytes: number,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.admin.confirmFileUpload(productId, path, filename, sizeBytes);
  } catch (err) {
    return toResultError(err);
  }
  revalidateProduct(productId);
  return { ok: true, data: undefined };
}

export async function removeImage(productId: string, imageId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.admin.removeImage(imageId);
  } catch (err) {
    return toResultError(err);
  }
  revalidateProduct(productId);
  return { ok: true, data: undefined };
}

export async function removeFile(productId: string, fileId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await container.catalog.admin.removeFile(fileId);
  } catch (err) {
    return toResultError(err);
  }
  revalidateProduct(productId);
  return { ok: true, data: undefined };
}
