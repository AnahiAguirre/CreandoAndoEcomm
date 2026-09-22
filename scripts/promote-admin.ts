/**
 * Gives the admin role to an existing user. Deliberately NOT exposed in the UI:
 * the only way to become admin is having access to the database.
 *
 *   npm run admin:promote -- tu@email.com
 *
 * The user must have signed in at least once (that's what creates the row).
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../src/infra/db/schema';

config({ path: '.env.local' });

const url = process.env.DATABASE_URL_DIRECT;
if (!url) throw new Error('DATABASE_URL_DIRECT is not set');

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: npm run admin:promote -- <email>');
  process.exit(1);
}

async function main() {
  const sql = postgres(url!, { max: 1 });
  const db = drizzle(sql, { schema });

  const [user] = await db
    .update(schema.users)
    .set({ role: 'admin' })
    .where(eq(schema.users.email, email!))
    .returning({ id: schema.users.id, email: schema.users.email });

  await sql.end();

  if (!user) {
    console.error(`No existe un usuario con email ${email}. Iniciá sesión una vez en /ingresar y volvé a correrlo.`);
    process.exit(1);
  }
  console.log(`✔ ${user.email} ahora es admin. Cerrá sesión y volvé a entrar para que tome efecto.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
