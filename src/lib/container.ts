import 'server-only';

import { randomUUID } from 'node:crypto';

import { CatalogAdmin } from '@/domain/catalog/use-cases/catalog-admin';
import { GetProductBySlug } from '@/domain/catalog/use-cases/get-product-by-slug';
import { ListCatalog } from '@/domain/catalog/use-cases/list-catalog';
import type { MailSender } from '@/domain/notifications/mail-sender';
import { createAuth } from '@/infra/auth/create-auth';
import { db } from '@/infra/db/client';
import { DrizzleProductRepository } from '@/infra/db/repositories/drizzle-product-repository';
import { ConsoleMailSender } from '@/infra/mail/console-mail-sender';
import { ResendMailSender } from '@/infra/mail/resend-mail-sender';
import { SupabaseAssetUrlResolver } from '@/infra/storage/supabase-asset-url-resolver';
import { SupabaseFileStorage } from '@/infra/storage/supabase-file-storage';

import { env } from './env';

/**
 * Composition root. This is the ONLY file that wires an `infra/` implementation
 * to the `domain/` port it fulfils. Nothing under `app/` imports from `infra/`.
 */
const productRepository = new DrizzleProductRepository(db);
const fileStorage = new SupabaseFileStorage(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const mail: MailSender = env.RESEND_API_KEY
  ? new ResendMailSender(env.RESEND_API_KEY, env.MAIL_FROM!)
  : new ConsoleMailSender();

if (!env.RESEND_API_KEY) {
  console.warn('[mail] RESEND_API_KEY no está seteada: los mails (magic links incluidos) se imprimen en esta consola.');
}

export const auth = createAuth({
  db,
  mail,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});

export const container = {
  mail,
  assetUrls: new SupabaseAssetUrlResolver(env.SUPABASE_URL),
  catalog: {
    list: new ListCatalog(productRepository),
    getBySlug: new GetProductBySlug(productRepository),
    admin: new CatalogAdmin(productRepository, fileStorage, randomUUID),
  },
} as const;
