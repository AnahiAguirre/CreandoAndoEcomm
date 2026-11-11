'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth-guards';
import { container } from '@/lib/container';

/**
 * Tries again to register an order's shipment with Correo Argentino. The outcome
 * (created or failed, with the reason) is stored on the order and shown in the list.
 */
export async function retryShipment(orderId: string): Promise<void> {
  await requireAdmin();
  await container.shipOrder.retry(z.string().min(1).parse(orderId));
  revalidatePath('/admin/pedidos');
}
