import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/lib/env';

import * as schema from './schema';

// The app talks to Supabase through the transaction pooler (Supavisor, :6543).
// `prepare: false` is mandatory there: prepared statements don't survive
// transaction-mode pooling. Migrations use the direct connection instead
// (see drizzle.config.ts).
function createClient() {
  const sql = postgres(env.DATABASE_URL, { prepare: false });
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createClient>;

// Reuse the connection across hot reloads in dev; otherwise every file save
// would open a new pool and Supabase would eventually refuse connections.
const globalForDb = globalThis as unknown as { __creandoandoDb?: Db };

export const db: Db = globalForDb.__creandoandoDb ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__creandoandoDb = db;
}
