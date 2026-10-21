import { and, desc, eq, gte, ne, sql } from 'drizzle-orm';

import type { NewOrder, Order, OrderItem, OrderStatus } from '@/domain/orders/order';
import type { MarkPaidResult, OrderRepository } from '@/domain/orders/ports';

import type { Db } from '../client';
import { orderItems, orders, products } from '../schema';

type OrderRow = typeof orders.$inferSelect;
type ItemRow = typeof orderItems.$inferSelect;

function toItem(row: ItemRow): OrderItem {
  return {
    productId: row.productId,
    name: row.name,
    kind: row.kind,
    unitPriceCents: row.unitPriceCents,
    quantity: row.quantity,
  };
}

function toOrder(row: OrderRow & { items: ItemRow[] }): Order {
  return {
    id: row.id,
    userId: row.userId,
    email: row.email,
    status: row.status,
    items: row.items.map(toItem),
    subtotalCents: row.subtotalCents,
    shippingCents: row.shippingCents,
    totalCents: row.totalCents,
    shipping: row.shipping,
    mpPaymentId: row.mpPaymentId,
    needsStockReview: row.needsStockReview,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
  };
}

const withItems = { items: true } as const;

export class DrizzleOrderRepository implements OrderRepository {
  constructor(private readonly db: Db) {}

  async create(input: NewOrder): Promise<Order> {
    const id = await this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(orders)
        .values({
          userId: input.userId,
          email: input.email,
          subtotalCents: input.subtotalCents,
          shippingCents: input.shippingCents,
          totalCents: input.totalCents,
          shipping: input.shipping,
        })
        .returning({ id: orders.id });
      await tx.insert(orderItems).values(input.items.map((item) => ({ ...item, orderId: row.id })));
      return row.id;
    });
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.query.orders.findFirst({ where: eq(orders.id, id), with: withItems });
    return row ? toOrder(row) : null;
  }

  async listForUser(userId: string): Promise<Order[]> {
    const rows = await this.db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: desc(orders.createdAt),
      with: withItems,
    });
    return rows.map(toOrder);
  }

  async listAll(): Promise<Order[]> {
    const rows = await this.db.query.orders.findMany({ orderBy: desc(orders.createdAt), with: withItems });
    return rows.map(toOrder);
  }

  async markPaid(id: string, mpPaymentId: string): Promise<MarkPaidResult> {
    const changed = await this.db.transaction(async (tx) => {
      // The status guard is what makes this idempotent: the second caller updates zero rows.
      const [flipped] = await tx
        .update(orders)
        .set({ status: 'paid', mpPaymentId, paidAt: new Date() })
        .where(and(eq(orders.id, id), ne(orders.status, 'paid')))
        .returning({ id: orders.id });
      if (!flipped) return false;

      const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      let short = false;
      for (const line of lines) {
        if (line.kind !== 'physical' || !line.productId) continue;
        // Conditional decrement: stock can never go negative, even with two buyers at once.
        const [taken] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(and(eq(products.id, line.productId), gte(products.stock, line.quantity)))
          .returning({ id: products.id });
        if (!taken) short = true;
      }
      if (short) await tx.update(orders).set({ needsStockReview: true }).where(eq(orders.id, id));
      return true;
    });
    return { order: (await this.findById(id))!, changed };
  }

  async markUnpaid(
    id: string,
    status: Extract<OrderStatus, 'rejected' | 'cancelled'>,
    mpPaymentId: string,
  ): Promise<void> {
    await this.db
      .update(orders)
      .set({ status, mpPaymentId })
      .where(and(eq(orders.id, id), eq(orders.status, 'pending')));
  }
}
