import { type CartLine, type CartSummary, reconcileCart } from '@/domain/cart/cart';
import { isDigital } from '@/domain/catalog/product';
import type { ProductRepository } from '@/domain/catalog/product-repository';
import {
  type AppliedCoupon,
  assertCustomerMayUse,
  couponDiscount,
  CouponNotValidError,
  describeCoupon,
  normalizeCouponCode,
} from '@/domain/coupons/coupon';
import type { CouponRepository } from '@/domain/coupons/coupon-repository';
import { normalizeEmail } from '@/domain/delivery/entitlement';
import { DomainError } from '@/domain/shared/errors';

import { applyFreeShipping } from '../free-shipping';
import {
  computeOrderTotals,
  type OrderItem,
  type ShippingDetails,
  type ShippingInput,
  type CarrierMethod,
  type ProvinceCode,
  ShippingRequiredError,
  shippingInputSchema,
} from '../order';
import { parcelFor } from '../parcel';
import { PICKUP_LABEL } from '../pickup';
import type { Agency, OrderRepository, Parcel, PaymentGateway, ShippingQuote, ShippingQuoter } from '../ports';

/** "Av. Santa Fe 1234, 2º B, Palermo" for people (the order page, the admin). */
export function addressText(street: NonNullable<ShippingDetails['street']>): string {
  const flat = [street.floor && `piso ${street.floor}`, street.apartment && `depto ${street.apartment}`].filter(Boolean);
  return [`${street.name} ${street.number}`, ...flat, street.city].join(', ');
}

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
    private readonly coupons: CouponRepository,
  ) {}

  /**
   * Checks a coupon against the cart as it is now in the catalog. Used by the
   * "Aplicar" button; `start` checks it again, so an accepted coupon that expires
   * or runs out before paying is refused there.
   */
  async applyCoupon(buyer: Buyer, lines: CartLine[], rawCode: string): Promise<AppliedCoupon> {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const { subtotalCents } = reconcileCart(lines, found);
    return this.priceCoupon(buyer, rawCode, subtotalCents);
  }

  private async priceCoupon(buyer: Buyer, rawCode: string, subtotalCents: number): Promise<AppliedCoupon> {
    const code = normalizeCouponCode(rawCode);
    if (!code) throw new CouponNotValidError('Escribí el código del cupón.');
    const coupon = await this.coupons.findByCode(code);
    const discountCents = couponDiscount(coupon, subtotalCents);
    if (coupon!.customerLimit !== 'unlimited') {
      assertCustomerMayUse(coupon!, await this.orders.buyerHistory(normalizeEmail(buyer.email), code));
    }
    return { code, discountCents, label: describeCoupon(coupon!) };
  }

  /** The cart as it stands right now in the catalog (prices, stock, what vanished). */
  async preview(lines: CartLine[]): Promise<CheckoutPreview> {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const summary = reconcileCart(lines, found);
    return { ...summary, hasPhysical: summary.items.some((i) => !isDigital(i.product)) };
  }

  /**
   * Shipping price for what is in the cart, to a postal code. Used by the "Calcular envío" button.
   * Free once the cart reaches the minimum (see `free-shipping.ts`).
   */
  async quoteShipping(
    lines: CartLine[],
    postalCode: string,
    method: CarrierMethod,
  ): Promise<ShippingQuote & { free: boolean }> {
    const found = await this.products.findActiveByIds(lines.map((l) => l.productId));
    const { subtotalCents } = reconcileCart(lines, found);
    const parcel = await this.parcelOf(lines);
    const quote = await this.shippingQuoter.quote({ postalCode, method, parcel });
    return applyFreeShipping(quote, subtotalCents);
  }

  agencies(provinceCode: ProvinceCode, postalCode: string): Promise<Agency[]> {
    return this.shippingQuoter.agencies({ provinceCode, postalCode });
  }

  async start(
    buyer: Buyer,
    lines: CartLine[],
    shippingInput: unknown,
    couponCode?: string | null,
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
      if (input.method === 'retiro') {
        shipping = this.pickupDetails(input);
      } else {
        const { provinceCode, postalCode } = input;
        if (!provinceCode || !postalCode) throw new ShippingRequiredError();
        const quote = await this.quoteShipping(lines, postalCode, input.method);
        shipping = await this.shippingDetails({ ...input, provinceCode, postalCode }, quote, await this.parcelOf(lines));
        shippingCents = quote.priceCents;
      }
    }

    const coupon = couponCode ? await this.priceCoupon(buyer, couponCode, summary.subtotalCents) : null;
    const totals = computeOrderTotals(lines, found, shippingCents, coupon?.discountCents ?? 0);
    const order = await this.orders.create({
      userId: buyer.userId,
      email: normalizeEmail(buyer.email),
      items: totals.items satisfies OrderItem[],
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      discountCents: totals.discountCents,
      couponCode: coupon?.code ?? null,
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

  /** Free, no carrier: the buyer collects it at the shop. */
  private pickupDetails(input: ShippingInput): ShippingDetails {
    return {
      method: 'retiro',
      recipient: input.recipient,
      phone: input.phone,
      postalCode: '',
      address: null,
      agency: null,
      quoteLabel: `${PICKUP_LABEL} (gratis)`,
    };
  }

  private async shippingDetails(
    input: ShippingInput & { provinceCode: ProvinceCode; postalCode: string },
    quote: ShippingQuote & { free: boolean },
    parcel: Parcel,
  ): Promise<ShippingDetails> {
    let agency: string | null = null;
    let agencyCode: string | undefined;
    if (input.method === 'sucursal') {
      const agencies = await this.agencies(input.provinceCode, input.postalCode);
      const chosen = agencies.find((a) => a.id === input.agencyId);
      if (!chosen) throw new UnknownAgencyError();
      agency = `${chosen.name} — ${chosen.address}`;
      agencyCode = chosen.id;
    }
    const home = input.method === 'domicilio';
    const street = home
      ? {
          name: input.streetName!,
          number: input.streetNumber!,
          floor: input.floor || null,
          apartment: input.apartment || null,
          city: input.city!,
        }
      : undefined;
    return {
      method: input.method,
      recipient: input.recipient,
      phone: input.phone,
      postalCode: input.postalCode,
      address: street ? addressText(street) : null,
      agency,
      quoteLabel: quote.label,
      ...(quote.free && { freeShipping: true }),
      provinceCode: input.provinceCode,
      street,
      agencyCode,
      parcel,
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
