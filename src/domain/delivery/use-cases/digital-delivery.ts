import type { ProductRepository } from '@/domain/catalog/product-repository';
import { ProductNotFoundError } from '@/domain/catalog/use-cases/get-product-by-slug';
import type { MailMessage, MailSender } from '@/domain/notifications/mail-sender';
import { DomainError } from '@/domain/shared/errors';
import { BUCKETS, type FileStorage } from '@/domain/storage/file-storage';

import { type Entitlement, type LibraryItem, normalizeEmail } from '../entitlement';
import type { EntitlementRepository } from '../entitlement-repository';

export class CannotGrantError extends DomainError {
  constructor(reason: string) {
    super(reason, 'CANNOT_GRANT');
  }
}

/**
 * Thrown both when the file doesn't exist and when the caller doesn't own it,
 * on purpose: a stranger can't probe which file ids are real.
 */
export class DownloadNotAllowedError extends DomainError {
  constructor() {
    super('No tenés acceso a este archivo.', 'DOWNLOAD_NOT_ALLOWED');
  }
}

/** Long enough for the browser to start the download, short enough that a shared link is useless. */
export const DOWNLOAD_URL_TTL_SECONDS = 60;

export interface GrantResult {
  entitlement: Entitlement;
  /** `false` when this email already had the product (nothing changed, no mail sent). */
  created: boolean;
  /** Whether the "ya podés descargarlo" mail went out. A mail failure never undoes the grant. */
  mailed: boolean;
}

export type DownloadReadyMail = (to: string, productName: string) => MailMessage;

/**
 * Hands digital products to their owners. `grant` is the single way in — the
 * admin calls it by hand today, and the Mercado Pago webhook will call it with
 * an `orderId` in fase 3. Authorization of the CALLER (admin or signed-in
 * customer) happens before reaching this class.
 */
export class DigitalDelivery {
  constructor(
    private readonly entitlements: EntitlementRepository,
    private readonly products: ProductRepository,
    private readonly storage: FileStorage,
    private readonly mail: MailSender,
    private readonly downloadReadyMail: DownloadReadyMail,
  ) {}

  async grant(productId: string, email: string, orderId: string | null = null): Promise<GrantResult> {
    const product = await this.products.findById(productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.kind !== 'digital') throw new CannotGrantError('Solo los productos digitales se entregan por descarga.');
    if (product.files.length === 0) throw new CannotGrantError('Subí el PDF antes de dar acceso.');

    const to = normalizeEmail(email);
    const { entitlement, created } = await this.entitlements.grant({ email: to, productId, orderId });
    if (!created) return { entitlement, created, mailed: false };

    let mailed = true;
    try {
      await this.mail.send(this.downloadReadyMail(to, product.name));
    } catch (err) {
      mailed = false;
      console.error(`[delivery] no se pudo mandar el mail de descarga a ${to}:`, err);
    }
    return { entitlement, created, mailed };
  }

  async revoke(entitlementId: string): Promise<void> {
    await this.entitlements.revoke(entitlementId);
  }

  listGrants(productId: string): Promise<Entitlement[]> {
    return this.entitlements.listForProduct(productId);
  }

  library(email: string): Promise<LibraryItem[]> {
    return this.entitlements.library(normalizeEmail(email));
  }

  /** A signed URL straight to storage — the PDF never passes through our server. */
  async downloadUrl(email: string, fileId: string): Promise<string> {
    const file = await this.entitlements.findFile(fileId);
    if (!file || !(await this.entitlements.has(normalizeEmail(email), file.productId))) {
      throw new DownloadNotAllowedError();
    }
    return this.storage.createSignedDownload(BUCKETS.files, file.storagePath, {
      expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
      filename: file.filename,
    });
  }
}
