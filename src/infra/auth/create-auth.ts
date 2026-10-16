import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';

import type { Db } from '../db/client';
import * as schema from '../db/schema';

export interface AuthDeps {
  db: Db;
  baseURL: string;
  secret: string;
  /** Buyers' sign-in. Absent until the Google Cloud client exists: the shop login then says so. */
  google?: { clientId: string; clientSecret: string };
}

export const ADMIN_MIN_PASSWORD_LENGTH = 12;

/**
 * Better Auth instance. Two doors, no mail involved:
 * - buyers sign in with Google;
 * - admins sign in with email + password at /ingresar/admin. There is NO
 *   sign-up: those accounts only exist if scripts/create-admin.ts made them.
 * `role` comes from the admin plugin and is never settable from the client.
 */
export function createAuth({ db, baseURL, secret, google }: AuthDeps) {
  return betterAuth({
    appName: 'CreandoAndo',
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: ADMIN_MIN_PASSWORD_LENGTH,
    },
    socialProviders: google
      ? {
          google: {
            clientId: google.clientId,
            clientSecret: google.clientSecret,
            // Shared computers are common: always let the buyer pick the account.
            prompt: 'select_account',
          },
        }
      : {},
    account: {
      // Users created by the old magic-link sign-in keep their row, role and
      // entitlements: Google verifies the email, so the Google account is
      // linked to the existing user with that email.
      accountLinking: { enabled: true, trustedProviders: ['google'] },
    },
    session: {
      // Avoid a DB round-trip on every request; 5 min is plenty for a shop.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      admin({ defaultRole: 'user', adminRoles: ['admin'] }),
      // Must be last: lets Server Actions set the session cookie.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
