import { z } from 'zod';

/**
 * The right to download a digital product's files. Keyed by EMAIL, not by
 * user id: sign-in is a magic link, so the email is the identity — and the
 * admin can grant a PDF to someone who hasn't created an account yet (a gift,
 * a sale closed over WhatsApp). It shows up the first time they sign in.
 */
export interface Entitlement {
  id: string;
  email: string;
  productId: string;
  /** The paid order that created it (fase 3). `null` = granted by hand from the admin. */
  orderId: string | null;
  createdAt: Date;
}

export type EntitlementSource = 'purchase' | 'manual';

export function entitlementSource(e: Pick<Entitlement, 'orderId'>): EntitlementSource {
  return e.orderId ? 'purchase' : 'manual';
}

/** Emails compare case-insensitively everywhere: store and look up this form only. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Escribí un email.')
  .pipe(z.email('Ese email no parece válido.'))
  .transform(normalizeEmail);

/** One digital product in a customer's "Mis descargas". */
export interface LibraryItem {
  productId: string;
  slug: string;
  name: string;
  /** Path in the public images bucket, if the product has a photo. */
  coverPath: string | null;
  files: { id: string; filename: string; sizeBytes: number }[];
  grantedAt: Date;
}

/** A private file together with the product it belongs to. */
export interface DeliverableFile {
  id: string;
  productId: string;
  storagePath: string;
  filename: string;
}
