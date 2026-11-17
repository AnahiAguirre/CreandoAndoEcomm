import { DomainError } from '@/domain/shared/errors';

import { type Coupon, couponInputSchema, type CouponInput } from '../coupon';
import type { CouponRepository } from '../coupon-repository';

export class CouponCodeTakenError extends DomainError {
  constructor(code: string) {
    super(`Ya existe un cupón con el código ${code}.`, 'COUPON_CODE_TAKEN');
  }
}

export class CouponNotFoundError extends DomainError {
  constructor() {
    super('Ese cupón ya no existe.', 'COUPON_NOT_FOUND');
  }
}

/** Create, edit, switch on/off and delete coupons from the admin. */
export class CouponAdmin {
  constructor(private readonly coupons: CouponRepository) {}

  list(): Promise<Coupon[]> {
    return this.coupons.listAll();
  }

  async create(input: CouponInput): Promise<Coupon> {
    const fields = couponInputSchema.parse(input);
    if (await this.coupons.findByCode(fields.code)) throw new CouponCodeTakenError(fields.code);
    return this.coupons.create(fields);
  }

  async update(id: string, input: CouponInput): Promise<Coupon> {
    const fields = couponInputSchema.parse(input);
    if (!(await this.coupons.findById(id))) throw new CouponNotFoundError();
    const sameCode = await this.coupons.findByCode(fields.code);
    if (sameCode && sameCode.id !== id) throw new CouponCodeTakenError(fields.code);
    return this.coupons.update(id, fields);
  }

  async setActive(id: string, active: boolean): Promise<void> {
    if (!(await this.coupons.findById(id))) throw new CouponNotFoundError();
    await this.coupons.setActive(id, active);
  }

  /** Orders that used it keep their discount and its code: they store their own copy. */
  delete(id: string): Promise<void> {
    return this.coupons.delete(id);
  }
}
