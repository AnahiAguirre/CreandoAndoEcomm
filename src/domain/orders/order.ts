import { z } from 'zod';

import { type CartAdjustment, type CartLine, type CartProduct, reconcileCart } from '@/domain/cart/cart';
import { isDigital, type ProductKind } from '@/domain/catalog/product';
import { DomainError } from '@/domain/shared/errors';
import type { Cents } from '@/domain/shared/money';

export const ORDER_STATUSES = ['pending', 'paid', 'rejected', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** `retiro` = the buyer picks it up at the shop (free). The other two go by Correo Argentino. */
export const SHIPPING_METHODS = ['retiro', 'domicilio', 'sucursal'] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

/** The methods a carrier quotes and delivers. */
export const CARRIER_METHODS = ['domicilio', 'sucursal'] as const;
export type CarrierMethod = (typeof CARRIER_METHODS)[number];

/** The box an order ships as: what the quote was based on and what MiCorreo is told. */
export interface Parcel {
  weightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

/** Argentine provinces with the one-letter code Correo Argentino uses (ISO 3166-2:AR). */
export const PROVINCES = [
  { code: 'C', name: 'Ciudad Autónoma de Buenos Aires' },
  { code: 'B', name: 'Buenos Aires' },
  { code: 'K', name: 'Catamarca' },
  { code: 'H', name: 'Chaco' },
  { code: 'U', name: 'Chubut' },
  { code: 'X', name: 'Córdoba' },
  { code: 'W', name: 'Corrientes' },
  { code: 'E', name: 'Entre Ríos' },
  { code: 'P', name: 'Formosa' },
  { code: 'Y', name: 'Jujuy' },
  { code: 'L', name: 'La Pampa' },
  { code: 'F', name: 'La Rioja' },
  { code: 'M', name: 'Mendoza' },
  { code: 'N', name: 'Misiones' },
  { code: 'Q', name: 'Neuquén' },
  { code: 'R', name: 'Río Negro' },
  { code: 'A', name: 'Salta' },
  { code: 'J', name: 'San Juan' },
  { code: 'D', name: 'San Luis' },
  { code: 'Z', name: 'Santa Cruz' },
  { code: 'S', name: 'Santa Fe' },
  { code: 'G', name: 'Santiago del Estero' },
  { code: 'V', name: 'Tierra del Fuego' },
  { code: 'T', name: 'Tucumán' },
] as const;
export type ProvinceCode = (typeof PROVINCES)[number]['code'];
const PROVINCE_CODES = PROVINCES.map((p) => p.code) as [ProvinceCode, ...ProvinceCode[]];
export const provinceCodeSchema = z.enum(PROVINCE_CODES, { error: 'Elegí la provincia.' });

/** What happened when the shipment was registered with the carrier. */
export interface ShipmentState {
  /** `manual`: no carrier credentials, the admin ships it by hand. */
  status: 'created' | 'failed' | 'manual';
  error?: string;
  at?: string;
}

/** Where a physical order goes. `null` on an order = digital only, nothing to ship. */
export interface ShippingDetails {
  method: ShippingMethod;
  recipient: string;
  phone: string;
  postalCode: string;
  /** Street address as text (method `domicilio`). */
  address: string | null;
  /** Chosen branch, e.g. "Sucursal Centro — Av. Siempre Viva 123" (method `sucursal`). */
  agency: string | null;
  /** What the buyer was shown when quoting, e.g. "Correo Argentino Clásico". */
  quoteLabel: string;
  /** The cart reached the free-shipping minimum: Correo ships it at no cost to the buyer. */
  freeShipping?: boolean;
  // The fields below do not exist on orders made before the carrier integration.
  provinceCode?: ProvinceCode;
  street?: { name: string; number: string; floor: string | null; apartment: string | null; city: string };
  agencyCode?: string;
  /** The box that was quoted, so the shipment is registered with the same one the buyer paid for. */
  parcel?: Parcel;
  shipment?: ShipmentState;
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
  /** Taken off the products by a coupon (never off shipping). 0 without one. */
  discountCents: Cents;
  /** The coupon used. Kept even if the coupon is later deleted. */
  couponCode: string | null;
  /** subtotal − discount + shipping. */
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
  discountCents: Cents;
  totalCents: Cents;
  hasPhysical: boolean;
}

/**
 * The server's own arithmetic for an order. The browser only ever says WHICH
 * products and how many; every price comes from the catalog `products` passed in.
 * Throws instead of silently fixing: if reconciling had to change anything, the
 * buyer is shown the change (see `CartChangedError`) and confirms again.
 */
export function computeOrderTotals(
  lines: CartLine[],
  products: CartProduct[],
  shippingCents: Cents,
  discountCents: Cents = 0,
): OrderTotals {
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

  // A discount only ever comes off the products, never below zero.
  const discount = Math.min(Math.max(0, discountCents), summary.subtotalCents);

  return {
    items,
    subtotalCents: summary.subtotalCents,
    shippingCents: shipping,
    discountCents: discount,
    totalCents: summary.subtotalCents - discount + shipping,
    hasPhysical,
  };
}

// Argentine postal codes: 4 digits (old) or the CPA format (letter + 4 digits + 3 letters).
export const postalCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^([0-9]{4}|[A-Z][0-9]{4}[A-Z]{3})$/, 'Código postal inválido (ej. 1425 o C1425ABC).');

const text = (max: number) => z.string().trim().max(max);

export const shippingInputSchema = z
  .object({
    method: z.enum(SHIPPING_METHODS),
    recipient: z.string().trim().min(2, 'Escribí el nombre de quien recibe.').max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{6,20}$/, 'Teléfono inválido.'),
    // Not needed to pick it up at the shop.
    provinceCode: provinceCodeSchema.optional(),
    postalCode: postalCodeSchema.optional(),
    // Home delivery: the carrier wants the address in pieces.
    streetName: text(100).optional(),
    streetNumber: text(10).optional(),
    floor: text(10).optional(),
    apartment: text(10).optional(),
    city: text(80).optional(),
    // Pickup: the carrier's branch code.
    agencyId: text(60).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method !== 'retiro') {
      if (!v.provinceCode) ctx.addIssue({ code: 'custom', path: ['provinceCode'], message: 'Elegí la provincia.' });
      if (!v.postalCode) ctx.addIssue({ code: 'custom', path: ['postalCode'], message: 'Escribí el código postal.' });
    }
    if (v.method === 'domicilio') {
      if (!v.streetName) ctx.addIssue({ code: 'custom', path: ['streetName'], message: 'Escribí la calle.' });
      if (!v.streetNumber) ctx.addIssue({ code: 'custom', path: ['streetNumber'], message: 'Escribí la altura.' });
      if (!v.city) ctx.addIssue({ code: 'custom', path: ['city'], message: 'Escribí la localidad.' });
    }
    if (v.method === 'sucursal' && !v.agencyId) {
      ctx.addIssue({ code: 'custom', path: ['agencyId'], message: 'Elegí una sucursal.' });
    }
  });
export type ShippingInput = z.infer<typeof shippingInputSchema>;
