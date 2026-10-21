import 'server-only';

import { randomUUID } from 'node:crypto';

import { GetCartProducts } from '@/domain/cart/use-cases/get-cart-products';
import { CatalogAdmin } from '@/domain/catalog/use-cases/catalog-admin';
import { CategoryAdmin, ListStorefrontCategories } from '@/domain/catalog/use-cases/category-admin';
import { GetProductBySlug } from '@/domain/catalog/use-cases/get-product-by-slug';
import { ListCatalog } from '@/domain/catalog/use-cases/list-catalog';
import { DigitalDelivery } from '@/domain/delivery/use-cases/digital-delivery';
import type { MailSender } from '@/domain/notifications/mail-sender';
import type { PaymentGateway } from '@/domain/orders/ports';
import { ConfirmPayment } from '@/domain/orders/use-cases/confirm-payment';
import { CreateCheckout } from '@/domain/orders/use-cases/create-checkout';
import { createAuth } from '@/infra/auth/create-auth';
import { db } from '@/infra/db/client';
import { DrizzleCategoryRepository } from '@/infra/db/repositories/drizzle-category-repository';
import { DrizzleOrderRepository } from '@/infra/db/repositories/drizzle-order-repository';
import { DrizzleEntitlementRepository } from '@/infra/db/repositories/drizzle-entitlement-repository';
import { DrizzleProductRepository } from '@/infra/db/repositories/drizzle-product-repository';
import { ConsoleMailSender } from '@/infra/mail/console-mail-sender';
import { ResendMailSender } from '@/infra/mail/resend-mail-sender';
import { downloadReadyMail } from '@/infra/mail/templates/download-ready';
import { DisabledPaymentGateway } from '@/infra/payments/disabled-payment-gateway';
import { MercadoPagoGateway } from '@/infra/payments/mercado-pago-gateway';
import { verifyMercadoPagoSignature } from '@/infra/payments/webhook-signature';
import { FakeShippingQuoter } from '@/infra/shipping/fake-shipping-quoter';
import { SupabaseAssetUrlResolver } from '@/infra/storage/supabase-asset-url-resolver';
import { SupabaseFileStorage } from '@/infra/storage/supabase-file-storage';

import { authBaseUrl, env } from './env';

/**
 * Composition root. This is the ONLY file that wires an `infra/` implementation
 * to the `domain/` port it fulfils. Nothing under `app/` imports from `infra/`.
 */
const productRepository = new DrizzleProductRepository(db);
const categoryRepository = new DrizzleCategoryRepository(db);
const entitlementRepository = new DrizzleEntitlementRepository(db);
const orderRepository = new DrizzleOrderRepository(db);
const fileStorage = new SupabaseFileStorage(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const mail: MailSender = env.RESEND_API_KEY
  ? new ResendMailSender(env.RESEND_API_KEY, env.MAIL_FROM!)
  : new ConsoleMailSender();

if (!env.RESEND_API_KEY) {
  console.warn('[mail] RESEND_API_KEY no está seteada: los mails se imprimen en esta consola.');
}

const paymentGateway: PaymentGateway = env.MP_ACCESS_TOKEN
  ? new MercadoPagoGateway(env.MP_ACCESS_TOKEN, authBaseUrl)
  : new DisabledPaymentGateway();

if (!env.MP_ACCESS_TOKEN) {
  console.warn('[pagos] Sin MP_ACCESS_TOKEN: la tienda anda, pero todavía no se puede pagar.');
}

// Stand-in until the Correo Argentino credentials exist; the real quoter replaces this line only.
const shippingQuoter = new FakeShippingQuoter();

const delivery = new DigitalDelivery(entitlementRepository, productRepository, fileStorage, mail, (to, productName) =>
  downloadReadyMail(to, productName, `${authBaseUrl}/mis-descargas`),
);

if (!env.GOOGLE_CLIENT_ID) {
  console.warn('[auth] Sin GOOGLE_CLIENT_ID: los compradores todavía no pueden ingresar (los admins sí, en /ingresar/admin).');
}

export const auth = createAuth({
  db,
  baseURL: authBaseUrl,
  secret: env.BETTER_AUTH_SECRET,
  google:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
      : undefined,
});

export const container = {
  mail,
  assetUrls: new SupabaseAssetUrlResolver(env.SUPABASE_URL),
  catalog: {
    list: new ListCatalog(productRepository),
    getBySlug: new GetProductBySlug(productRepository),
    admin: new CatalogAdmin(productRepository, categoryRepository, fileStorage, randomUUID),
    categories: new CategoryAdmin(categoryRepository),
    storefrontCategories: new ListStorefrontCategories(categoryRepository),
  },
  cart: { products: new GetCartProducts(productRepository) },
  delivery,
  orders: orderRepository,
  checkout: new CreateCheckout(productRepository, orderRepository, paymentGateway, shippingQuoter),
  payments: {
    confirm: new ConfirmPayment(orderRepository, paymentGateway, delivery),
    /** Mercado Pago's webhook signature, checked with our secret. `false` when payments aren't configured. */
    verifyWebhook: (input: { signatureHeader: string | null; requestId: string | null; dataId: string | null }) =>
      env.MP_WEBHOOK_SECRET ? verifyMercadoPagoSignature({ secret: env.MP_WEBHOOK_SECRET, ...input }) : false,
  },
} as const;
