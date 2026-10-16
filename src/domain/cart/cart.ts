import { isDigital, type Product } from '@/domain/catalog/product';
import type { Cents } from '@/domain/shared/money';

/**
 * What the browser remembers: only ids and quantities. Names, prices and stock
 * are NEVER trusted from there — they are re-read from the catalog every time
 * (see `reconcileCart`), and checkout will recompute everything again.
 */
export interface CartLine {
  productId: string;
  quantity: number;
}

/** The slice of a product the cart needs to price and limit a line. */
export type CartProduct = Pick<Product, 'id' | 'slug' | 'name' | 'kind' | 'priceCents' | 'stock'>;

export interface CartItem {
  product: CartProduct;
  quantity: number;
  lineTotalCents: Cents;
}

export interface CartAdjustment {
  productId: string;
  message: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotalCents: Cents;
  itemCount: number;
  adjustments: CartAdjustment[];
}

/** A printable is bought once; a toy is limited by what's on the shelf. */
export function maxQuantity(product: Pick<Product, 'kind' | 'stock'>): number {
  return isDigital(product) ? 1 : Math.max(0, product.stock);
}

function clamp(quantity: number, product: Pick<Product, 'kind' | 'stock'>): number {
  return Math.min(Math.max(0, Math.trunc(quantity)), maxQuantity(product));
}

/** Adds one unit (or sets 1 for a digital). Out-of-stock products are not added. */
export function addLine(lines: CartLine[], product: CartProduct, quantity = 1): CartLine[] {
  const current = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const next = clamp(current + quantity, product);
  if (next === 0) return lines;
  return current === 0
    ? [...lines, { productId: product.id, quantity: next }]
    : lines.map((l) => (l.productId === product.id ? { ...l, quantity: next } : l));
}

/** Sets an exact quantity. 0 (or less) removes the line. */
export function setQuantity(lines: CartLine[], product: CartProduct, quantity: number): CartLine[] {
  const next = clamp(quantity, product);
  if (next === 0) return removeLine(lines, product.id);
  return lines.map((l) => (l.productId === product.id ? { ...l, quantity: next } : l));
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/**
 * Turns remembered lines into what the shopper actually sees: drops products
 * that vanished or were unpublished, lowers quantities to the current stock,
 * and says so in `adjustments` so nothing changes silently.
 */
export function reconcileCart(lines: CartLine[], products: CartProduct[]): CartSummary {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: CartItem[] = [];
  const adjustments: CartAdjustment[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      adjustments.push({ productId: line.productId, message: 'Un producto de tu carrito ya no está disponible y lo sacamos.' });
      continue;
    }
    const quantity = clamp(line.quantity, product);
    if (quantity === 0) {
      adjustments.push({ productId: product.id, message: `“${product.name}” se quedó sin stock y lo sacamos del carrito.` });
      continue;
    }
    if (quantity < line.quantity) {
      adjustments.push({
        productId: product.id,
        message: isDigital(product)
          ? `“${product.name}” es un imprimible: alcanza con una unidad.`
          : `Bajamos “${product.name}” a ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} por el stock disponible.`,
      });
    }
    items.push({ product, quantity, lineTotalCents: product.priceCents * quantity });
  }

  return {
    items,
    subtotalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    adjustments,
  };
}

/** The lines that survive reconciliation, ready to be saved back. */
export function linesOf(summary: CartSummary): CartLine[] {
  return summary.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
}
