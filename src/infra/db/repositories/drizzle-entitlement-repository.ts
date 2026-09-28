import { and, asc, desc, eq } from 'drizzle-orm';

import type { DeliverableFile, Entitlement, LibraryItem } from '@/domain/delivery/entitlement';
import type { EntitlementRepository, NewEntitlement } from '@/domain/delivery/entitlement-repository';

import type { Db } from '../client';
import { entitlements, productFiles, productImages } from '../schema';

type EntitlementRow = typeof entitlements.$inferSelect;

function toEntitlement(row: EntitlementRow): Entitlement {
  return {
    id: row.id,
    email: row.email,
    productId: row.productId,
    orderId: row.orderId,
    createdAt: row.createdAt,
  };
}

export class DrizzleEntitlementRepository implements EntitlementRepository {
  constructor(private readonly db: Db) {}

  async grant(input: NewEntitlement): Promise<{ entitlement: Entitlement; created: boolean }> {
    // ON CONFLICT DO NOTHING returns no row when it already existed; read it back then.
    const [inserted] = await this.db.insert(entitlements).values(input).onConflictDoNothing().returning();
    if (inserted) return { entitlement: toEntitlement(inserted), created: true };

    const existing = await this.db.query.entitlements.findFirst({
      where: and(eq(entitlements.email, input.email), eq(entitlements.productId, input.productId)),
    });
    return { entitlement: toEntitlement(existing!), created: false };
  }

  async revoke(id: string): Promise<Entitlement | null> {
    const [row] = await this.db.delete(entitlements).where(eq(entitlements.id, id)).returning();
    return row ? toEntitlement(row) : null;
  }

  async listForProduct(productId: string): Promise<Entitlement[]> {
    const rows = await this.db.query.entitlements.findMany({
      where: eq(entitlements.productId, productId),
      orderBy: desc(entitlements.createdAt),
    });
    return rows.map(toEntitlement);
  }

  async has(email: string, productId: string): Promise<boolean> {
    const row = await this.db.query.entitlements.findFirst({
      columns: { id: true },
      where: and(eq(entitlements.email, email), eq(entitlements.productId, productId)),
    });
    return Boolean(row);
  }

  async library(email: string): Promise<LibraryItem[]> {
    const rows = await this.db.query.entitlements.findMany({
      where: eq(entitlements.email, email),
      orderBy: desc(entitlements.createdAt),
      with: {
        product: {
          with: {
            images: { orderBy: asc(productImages.position), limit: 1 },
            files: { orderBy: asc(productFiles.createdAt) },
          },
        },
      },
    });
    return rows.map((row) => ({
      productId: row.product.id,
      slug: row.product.slug,
      name: row.product.name,
      coverPath: row.product.images[0]?.storagePath ?? null,
      files: row.product.files.map((f) => ({ id: f.id, filename: f.filename, sizeBytes: f.sizeBytes })),
      grantedAt: row.createdAt,
    }));
  }

  async findFile(fileId: string): Promise<DeliverableFile | null> {
    const row = await this.db.query.productFiles.findFirst({ where: eq(productFiles.id, fileId) });
    return row ? { id: row.id, productId: row.productId, storagePath: row.storagePath, filename: row.filename } : null;
  }
}
