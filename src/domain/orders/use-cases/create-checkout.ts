import { type CartLine, type CartSummary, reconcileCart } from '@/domain/cart/cart';
import { isDigital } from '@/domain/catalog/product';
import type { ProductRepository } from '@/domain/catalog/product-repository';
import { normalizeEmail } from '@/domain/delivery/entitlement';
import { DomainError } from '@/domain/shared/errors';

import {
  computeOrderTotals,
  type OrderItem,
  type ShippingDetails,
  type ShippingInput,
  type ShippingMethod,
  ShippingRequiredError,
  shippingInputSchema,
} from '../order';
import { parcelFor } from '../parcel';
import type { Agency, OrderRepository, PaymentGateway, ShippingQuote, ShippingQuoter } from '../ports';

export class UnknownAgencyError extends DomainError {
  constructor() {
    super('La sucursal elegida ya no está disponible. Elegí otra.', 'UNKNOWN_AGENCY');
  }
}

/** A printable with no PDF uploaded yet can't be sold: the buyer would pay and receive nothing. */
export class DigitalNotReadyError extends DomainError {
  constructor(name: string) {
    super(`“${name}” todavía no está disponible para comprar. Probá más tarde.`, 'DIGITAL_NOT_READY');
  }
}

export interface Buyer {
  userId: string;
  email: string;
}

export interface CheckoutPreview extends CartSummary {
  hasPhysical: boolean;
}

/**
 * Turns a browser cart into a pending order and a Mercado Pago checkout. The
 * cart arrives as bare ids and quantities: everything that costs money
 * (prices, stock, shipping) is recomputed here, so nothing the browser says
 * about money is ever believed.
 */
export class CreateCheckout {
  constructor(
    private readonly products: ProductRepository,
    private readonly orders: OrderRepository,
    private readonly gateway: PaymentGateway,
    private readonly shippingQuoter: ShippingQuoter,
  ) {}

  /** The cart as it stands right now in the catalog (prices, stock, what vanished). */
  async preview(lines: CartLine[]): Promise<CheckoutPreview> {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const summary = reconcileCart(lines, found);
    return { ...summary, hasPhysical: summary.items.some((i) => !isDigital(i.product)) };
  }

  /** Shipping price for what is in the cart, to a postal code. Used by the "Calcular envío" button. */
  async quoteShipping(lines: CartLine[], postalCode: string, method: ShippingMethod): Promise<ShippingQuote> {
    const parcel = await this.parcelOf(lines);
    return this.shippingQuoter.quote({ postalCode, method, parcel });
  }

  agencies(postalCode: string): Promise<Agency[]> {
    return this.shippingQuoter.agencies(postalCode);
  }

  async start(
    buyer: Buyer,
    lines: CartLine[],
    shippingInput: unknown,
  ): Promise<{ orderId: string; redirectUrl: string }> {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const summary = reconcileCart(lines, found);
    const hasPhysical = summary.items.some((i) => !isDigital(i.product));
    await this.assertDigitalsDeliverable(summary);

    let shipping: ShippingDetails | null = null;
    let shippingCents = 0;
    if (hasPhysical) {
      if (!shippingInput) throw new ShippingRequiredError();
      const input = shippingInputSchema.parse(shippingInput);
      const quote = await this.quoteShipping(lines, input.postalCode, input.method);
      shipping = await this.shippingDetails(input, quote);
      shippingCents = quote.priceCents;
    }

    const totals = computeOrderTotals(lines, found, shippingCents);
    const order = await this.orders.create({
      userId: buyer.userId,
      email: normalizeEmail(buyer.email),
      items: totals.items satisfies OrderItem[],
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
      shipping,
    });

    const { redirectUrl } = await this.gateway.createCheckout(order);
    return { orderId: order.id, redirectUrl };
  }

  private async assertDigitalsDeliverable(summary: CartSummary): Promise<void> {
    for (const { product } of summary.items) {
      if (!isDigital(product)) continue;
      const full = await this.products.findById(product.id);
      if (!full || full.files.length === 0) throw new DigitalNotReadyError(product.name);
    }
  }

  private async shippingDetails(input: ShippingInput, quote: ShippingQuote): Promise<ShippingDetails> {
    let agency: string | null = null;
    if (input.method === 'sucursal') {
      const agencies = await this.shippingQuoter.agencies(input.postalCode);
      const chosen = agencies.find((a) => a.id === input.agencyId);
      if (!chosen) throw new UnknownAgencyError();
      agency = `${chosen.name} — ${chosen.address}`;
    }
    return {
      method: input.method,
      recipient: input.recipient,
      phone: input.phone,
      postalCode: input.postalCode,
      address: input.method === 'domicilio' ? (input.address ?? null) : null,
      agency,
      quoteLabel: quote.label,
    };
  }

  /** The box for the physical items of a cart (digital ones weigh nothing). */
  private async parcelOf(lines: CartLine[]) {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const summary = reconcileCart(lines, found);
    const units = [];
    for (const { product, quantity } of summary.items) {
      if (isDigital(product)) continue;
      const full = await this.products.findById(product.id);
      if (full) units.push({ product: full, quantity });
    }
    return parcelFor(units);
  }
}
