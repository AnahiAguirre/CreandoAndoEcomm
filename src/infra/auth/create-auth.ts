import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';
import { magicLink } from 'better-auth/plugins/magic-link';

import type { MailSender } from '@/domain/notifications/mail-sender';

import type { Db } from '../db/client';
import * as schema from '../db/schema';
import { magicLinkMail } from '../mail/templates/magic-link';

export interface AuthDeps {
  db: Db;
  mail: MailSender;
  baseURL: string;
  secret: string;
}

export const MAGIC_LINK_TTL_SECONDS = 15 * 60;

/**
 * Better Auth instance. Customers sign in with a magic link only (no
 * passwords to leak); `role` comes from the admin plugin and is never
 * settable from the client — see scripts/promote-admin.ts.
 */
export function createAuth({ db, mail, baseURL, secret }: AuthDeps) {
  return betterAuth({
    appName: 'CreandoAndo',
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema }),
    emailAndPassword: { enabled: false },
    session: {
      // Avoid a DB round-trip on every request; 5 min is plenty for a shop.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        sendMagicLink: async ({ email, url }) => {
          await mail.send(magicLinkMail(email, url));
        },
      }),
      admin({ defaultRole: 'user', adminRoles: ['admin'] }),
      // Must be last: lets Server Actions set the session cookie.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
