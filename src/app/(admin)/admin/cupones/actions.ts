'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import type { CouponInput } from '@/domain/coupons/coupon';
import { DomainError } from '@/domain/shared/errors';
import { requireAdmin } from '@/lib/auth-guards';
import { container } from '@/lib/container';

export type ActionResult = { ok: true } | { ok: false; error: string };

const idSchema = z.string().min(1);

function toResultError(err: unknown): ActionResult {
  if (err instanceof DomainError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? 'Datos inválidos' };
  throw err;
}

/** Runs one admin change and refreshes the list. Every action checks the guard itself. */
async function run(change: () => Promise<unknown>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await change();
  } catch (err) {
    return toResultError(err);
  }
  revalidatePath('/admin/cupones');
  return { ok: true };
}

export async function createCoupon(input: CouponInput): Promise<ActionResult> {
  return run(() => container.coupons.create(input));
}

export async function updateCoupon(id: string, input: CouponInput): Promise<ActionResult> {
  return run(() => container.coupons.update(idSchema.parse(id), input));
}

export async function setCouponActive(id: string, active: boolean): Promise<ActionResult> {
  return run(() => container.coupons.setActive(idSchema.parse(id), z.boolean().parse(active)));
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  return run(() => container.coupons.delete(idSchema.parse(id)));
}
