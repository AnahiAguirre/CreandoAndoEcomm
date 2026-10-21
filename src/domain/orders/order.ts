import { z } from 'zod';

import { type CartAdjustment, type CartLine, type CartProduct, reconcileCart } from '@/domain/cart/cart';
import { isDigital, type ProductKind } from '@/domain/catalog/product';
import { DomainError } from '@/domain/shared/errors';
import type { Cents } from '@/domain/shared/money';

export const ORDER_STATUSES = ['pending', 'paid', 'rejected', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SHIPPING_METHODS = ['domicilio', 'sucursal'] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

/** Where a physical order goes. `null` on an order = digital only, nothing to ship. */
export interface ShippingDetails {
  method: ShippingMethod;
  recipient: string;
  phone: string;
  postalCode: string;
  /** Street address (method `domicilio`). */
  address: string | null;
  /** Chosen branch, e.g. "Sucursal Centro — Av. Siempre Viva 123" (method `sucursal`). */
  agency: string | null;
  /** What the buyer was shown when quoting, e.g. "Envío a domicilio (simulado)". */
  quoteLabel: string;
}

/** Name, kind and price are copied from the catalog at purchase time: later edits must not rewrite history. */
export interface OrderItem {
  productId: string | null;
  name: string;
  kind: ProductKind;
  unitPriceCents: Cents;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string | null;
  /** Normalized email of the signed-in buyer: where digital purchases are delivered. */
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalCents: Cents;
  shippingCents: Cents;
  totalCents: Cents;
  shipping: ShippingDetails | null;
  mpPaymentId: string | null;
  /** A paid physical item ran out of stock meanwhile: the admin must look at it. */
  needsStockReview: boolean;
  createdAt: Date;
  paidAt: Date | null;
}

export type NewOrder = Omit<Order, 'id' | 'status' | 'mpPaymentId' | 'needsStockReview' | 'createdAt' | 'paidAt'>;

export class EmptyCartError extends DomainError {
  constructor() {
    super('Tu carrito está vacío.', 'EMPTY_CART');
  }
}

/** Prices or stock moved since the buyer filled the cart: they must see the new state before paying. */
export class CartChangedError extends DomainError {
  constructor(readonly adjustments: CartAdjustment[]) {
    super('Tu carrito cambió: revisalo antes de pagar.', 'CART_CHANGED');
  }
}

export class ShippingRequiredError extends DomainError {
  constructor() {
    super('Completá los datos de envío.', 'SHIPPING_REQUIRED');
  }
}

export interface OrderTotals {
  items: OrderItem[];
  subtotalCents: Cents;
  shippingCents: Cents;
  totalCents: Cents;
  hasPhysical: boolean;
}

/**
 * The server's own arithmetic for an order. The browser only ever says WHICH
 * products and how many; every price comes from the catalog `products` passed in.
 * Throws instead of silently fixing: if reconciling had to change anything, the
 * buyer is shown the change (see `CartChangedError`) and confirms again.
 */
export function computeOrderTotals(lines: CartLine[], products: CartProduct[], shippingCents: Cents): OrderTotals {
  const summary = reconcileCart(lines, products);
  if (summary.adjustments.length > 0) throw new CartChangedError(summary.adjustments);
  if (summary.items.length === 0) throw new EmptyCartError();

  const items: OrderItem[] = summary.items.map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    kind: product.kind,
    unitPriceCents: product.priceCents,
    quantity,
  }));
  const hasPhysical = summary.items.some((i) => !isDigital(i.product));
  const shipping = hasPhysical ? shippingCents : 0;

  return {
    items,
    subtotalCents: summary.subtotalCents,
    shippingCents: shipping,
    totalCents: summary.subtotalCents + shipping,
    hasPhysical,
  };
}

// Argentine postal codes: 4 digits (old) or the CPA format (letter + 4 digits + 3 letters).
export const postalCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^([0-9]{4}|[A-Z][0-9]{4}[A-Z]{3})$/, 'Código postal inválido (ej. 1425 o C1425ABC).');

export const shippingInputSchema = z
  .object({
    method: z.enum(SHIPPING_METHODS),
    recipient: z.string().trim().min(2, 'Escribí el nombre de quien recibe.').max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{6,20}$/, 'Teléfono inválido.'),
    postalCode: postalCodeSchema,
    address: z.string().trim().max(200).optional(),
    agencyId: z.string().trim().max(60).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method === 'domicilio' && !v.address) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Escribí la dirección de entrega.' });
    }
    if (v.method === 'sucursal' && !v.agencyId) {
      ctx.addIssue({ code: 'custom', path: ['agencyId'], message: 'Elegí una sucursal.' });
    }
  });
export type ShippingInput = z.infer<typeof shippingInputSchema>;
