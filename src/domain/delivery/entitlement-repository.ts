import type { DeliverableFile, Entitlement, LibraryItem } from './entitlement';

export interface NewEntitlement {
  /** Already normalized (see `normalizeEmail`). */
  email: string;
  productId: string;
  orderId: string | null;
}

/** Port: who may download what. Implemented in infra (Drizzle). */
export interface EntitlementRepository {
  /**
   * Idempotent: one entitlement per (email, product). Mercado Pago retries its
   * webhook and an admin may click twice — the second grant is a no-op that
   * returns the existing row with `created: false`.
   */
  grant(input: NewEntitlement): Promise<{ entitlement: Entitlement; created: boolean }>;
  /** Returns the removed row, or `null` if it didn't exist. */
  revoke(id: string): Promise<Entitlement | null>;
  listForProduct(productId: string): Promise<Entitlement[]>;
  has(email: string, productId: string): Promise<boolean>;

  /** Everything this email can download, newest first. Includes unpublished products: a buyer keeps what they got. */
  library(email: string): Promise<LibraryItem[]>;
  findFile(fileId: string): Promise<DeliverableFile | null>;
}
