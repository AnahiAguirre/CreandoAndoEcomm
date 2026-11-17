import type { Metadata } from 'next';

import { container } from '@/lib/container';

import { CouponManager } from './_components/coupon-manager';

export const metadata: Metadata = { title: 'Cupones' };
export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await container.coupons.list();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cupones</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Códigos de descuento que los compradores escriben al pagar. El descuento es sobre los productos, nunca sobre el
          envío. Un uso se cuenta cuando el pedido se paga.
        </p>
      </div>
      <CouponManager coupons={coupons} now={new Date()} />
    </section>
  );
}
