import type { Coupon, CouponFields } from './coupon';

/**
 * Port: how the domain reads and writes coupons. Uses are counted by the order
 * repository when an order that carries the code is paid (see markPaid), in the
 * same transaction, so a retried webhook never counts twice.
 */
export interface CouponRepository {
  /** Newest first. */
  listAll(): Promise<Coupon[]>;
  findById(id: string): Promise<Coupon | null>;
  /** `code` must already be normalized. */
  findByCode(code: string): Promise<Coupon | null>;
  create(fields: CouponFields): Promise<Coupon>;
  update(id: string, fields: CouponFields): Promise<Coupon>;
  setActive(id: string, active: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
