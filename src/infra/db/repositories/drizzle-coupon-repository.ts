import { desc, eq } from 'drizzle-orm';

import type { Coupon, CouponFields } from '@/domain/coupons/coupon';
import type { CouponRepository } from '@/domain/coupons/coupon-repository';

import type { Db } from '../client';
import { coupons } from '../schema';

type CouponRow = typeof coupons.$inferSelect;

function toCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    kind: row.kind,
    value: row.value,
    minSubtotalCents: row.minSubtotalCents,
    maxDiscountCents: row.maxDiscountCents,
    maxUses: row.maxUses,
    customerLimit: row.customerLimit,
    usedCount: row.usedCount,
    expiresAt: row.expiresAt,
    active: row.active,
    createdAt: row.createdAt,
  };
}

export class DrizzleCouponRepository implements CouponRepository {
  constructor(private readonly db: Db) {}

  async listAll(): Promise<Coupon[]> {
    const rows = await this.db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return rows.map(toCoupon);
  }

  async findById(id: string): Promise<Coupon | null> {
    const [row] = await this.db.select().from(coupons).where(eq(coupons.id, id));
    return row ? toCoupon(row) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const [row] = await this.db.select().from(coupons).where(eq(coupons.code, code));
    return row ? toCoupon(row) : null;
  }

  async create(fields: CouponFields): Promise<Coupon> {
    const [row] = await this.db.insert(coupons).values(fields).returning();
    return toCoupon(row);
  }

  async update(id: string, fields: CouponFields): Promise<Coupon> {
    const [row] = await this.db
      .update(coupons)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return toCoupon(row);
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.db.update(coupons).set({ active, updatedAt: new Date() }).where(eq(coupons.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(coupons).where(eq(coupons.id, id));
  }
}
