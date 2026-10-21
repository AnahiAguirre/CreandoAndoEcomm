'use server';

import { z } from 'zod';

import type { CartLine } from '@/domain/cart/cart';
import { CartChangedError, postalCodeSchema, SHIPPING_METHODS } from '@/domain/orders/order';
import type { Agency, ShippingQuote } from '@/domain/orders/ports';
import { DomainError } from '@/domain/shared/errors';
import { requireUser } from '@/lib/auth-guards';
import { container } from '@/lib/container';
import { paymentsEnabled } from '@/lib/env';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// A cart is a handful of lines; anything bigger is not a real cart.
const linesSchema = z
  .array(z.object({ productId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(99) }))
  .min(1, 'Tu carrito está vacío.')
  .max(50);

function toError(err: unknown): ActionResult<never> {
  if (err instanceof CartChangedError) {
    return { ok: false, error: `${err.message} ${err.adjustments.map((a) => a.message).join(' ')}` };
  }
  if (err instanceof DomainError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) {
    const { fieldErrors, formErrors } = z.flattenError(err);
    return {
      ok: false,
      error: formErrors[0] ?? 'Revisá los datos ingresados.',
      fieldErrors: fieldErrors as Record<string, string[]>,
    };
  }
  throw err;
}

/** The cart as the catalog sees it now, for the checkout summary. Signed-in buyers only. */
export async function previewCheckout(lines: CartLine[]) {
  await requireUser('/checkout');
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return null;
  return container.checkout.preview(parsed.data);
}

const quoteSchema = z.object({
  lines: linesSchema,
  postalCode: postalCodeSchema,
  method: z.enum(SHIPPING_METHODS),
});

export async function quoteShipping(
  request: z.input<typeof quoteSchema>,
): Promise<ActionResult<{ quote: ShippingQuote; agencies: Agency[] }>> {
  await requireUser('/checkout');
  try {
    const { lines, postalCode, method } = quoteSchema.parse(request);
    const [quote, agencies] = await Promise.all([
      container.checkout.quoteShipping(lines, postalCode, method),
      method === 'sucursal' ? container.checkout.agencies(postalCode) : Promise.resolve([]),
    ]);
    return { ok: true, data: { quote, agencies } };
  } catch (err) {
    return toError(err);
  }
}

const startSchema = z.object({
  lines: linesSchema,
  // Shape and rules are checked by the domain (shippingInputSchema); absent for digital-only carts.
  shipping: z.unknown().optional(),
});

/** Creates the order and returns where to send the buyer to pay. */
export async function startCheckout(request: z.input<typeof startSchema>): Promise<ActionResult<{ redirectUrl: string }>> {
  const user = await requireUser('/checkout');
  if (!paymentsEnabled) return { ok: false, error: 'Los pagos todavía no están habilitados.' };
  try {
    const { lines, shipping } = startSchema.parse(request);
    const { redirectUrl } = await container.checkout.start({ userId: user.id, email: user.email }, lines, shipping);
    return { ok: true, data: { redirectUrl } };
  } catch (err) {
    return toError(err);
  }
}
