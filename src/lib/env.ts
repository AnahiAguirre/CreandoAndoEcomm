import 'server-only';

import { z } from 'zod';

// Validated once at startup. Only the variables THIS phase needs are required;
// later phases (auth, Mercado Pago, Resend) add theirs here.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${issues}\nCopy .env.example to .env.local and fill it in.`);
}

export const env = parsed.data;
