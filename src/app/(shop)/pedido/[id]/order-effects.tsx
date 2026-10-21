'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCart } from '@/components/cart/cart-provider';

/** The purchase went through: the cart's job is done. Runs once, when this page shows a paid order. */
export function ClearCartOnPaid() {
  const { replace } = useCart();
  useEffect(() => {
    replace([]);
  }, [replace]);
  return null;
}

const REFRESH_MS = 4000;
const MAX_REFRESHES = 15; // about a minute; after that the buyer can reload by hand

/** While the payment is unconfirmed, ask the server again every few seconds. */
export function PendingRefresh() {
  const router = useRouter();
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      if (++count > MAX_REFRESHES) return clearInterval(timer);
      router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
