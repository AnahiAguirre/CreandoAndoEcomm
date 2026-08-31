import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs outside Next.js, so it doesn't know Next's .env.local
// convention — load it explicitly (plain `dotenv/config` only reads `.env`).
config({ path: '.env.local' });

// Migrations use the DIRECT connection (port 5432), not the pooler — drizzle-kit
// needs full session semantics that Supavisor's transaction pooler doesn't give.
// See src/infra/db/client.ts for the app's own (pooled) connection.
const directUrl = process.env.DATABASE_URL_DIRECT;
if (!directUrl) {
  throw new Error('DATABASE_URL_DIRECT is not set. Copy .env.example to .env.local and fill it in.');
}

export default defineConfig({
  schema: './src/infra/db/schema/index.ts',
  out: './src/infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: directUrl },
  strict: true,
  verbose: true,
});
