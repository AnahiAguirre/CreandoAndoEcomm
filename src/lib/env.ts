import 'server-only';

import { z } from 'zod';

// Validated once at startup. Only the variables the CURRENT phase needs are
// required; later phases (Mercado Pago) add theirs here.
const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // --- database (fase 1) ---
    DATABASE_URL: z.url(),

    // --- Supabase Storage (fase 1 public URLs, fase 2 uploads) ---
    SUPABASE_URL: z.url(),
    // Secret/service key: bypasses bucket policies. Server only.
    SUPABASE_SECRET_KEY: z.string().min(20),

    // --- Better Auth (fase 2) ---
    BETTER_AUTH_SECRET: z.string().min(32, 'Generá uno con: openssl rand -base64 32'),
    // Optional: on Vercel it is derived from the deployment URL (see `authBaseUrl`),
    // so a preview can build before anyone knows its own address.
    BETTER_AUTH_URL: z.url().optional(),

    // Set by Vercel at build and run time. Never set these by hand.
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),

    // --- mail (fase 2) — optional in dev: without a key, mails go to the console ---
    RESEND_API_KEY: z.string().startsWith('re_').optional(),
    MAIL_FROM: z.string().min(3).optional(),
  })
  .refine((e) => !e.RESEND_API_KEY || e.MAIL_FROM, {
    path: ['MAIL_FROM'],
    message: 'MAIL_FROM es obligatorio cuando hay RESEND_API_KEY',
  });
// Deploy-time rule (fase 9): RESEND_API_KEY must be set on Vercel. Not enforced
// here because `next build` runs with NODE_ENV=production locally too.

// A variable declared with no value (easy to do in the Vercel dashboard) arrives
// as "", which would fail an `.optional()` check. Treat blank as absent.
const source = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value.trim() !== ''),
);

const parsed = schema.safeParse(source);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(
    `Invalid environment variables:\n${issues}\n` +
      'En local: copiá .env.example a .env.local y completalo. ' +
      'En Vercel: Settings → Environment Variables (ojo con las variables sin valor).',
  );
}

export const env = parsed.data;

/**
 * Where this instance lives, for magic-link callbacks and cookies.
 * `BETTER_AUTH_URL` wins when set (required once there's a custom domain);
 * otherwise Vercel's own URL is used, so a preview deploy works out of the box.
 */
export const authBaseUrl: string =
  env.BETTER_AUTH_URL ??
  (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
  (env.VERCEL_URL && `https://${env.VERCEL_URL}`) ??
  'http://localhost:3000';
