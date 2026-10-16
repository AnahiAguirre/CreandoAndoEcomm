/**
 * Creates an admin who signs in with email + password at /ingresar/admin, or
 * resets the password of an existing one. Deliberately NOT exposed in the UI:
 * the only way to become admin is having access to the database.
 *
 *   npm run admin:create -- vos@email.com
 *
 * Prints a fresh random password once. Run it again to reset it. If the email
 * already belongs to a buyer, that same user becomes admin (keeps its downloads).
 */
import { randomBytes, randomUUID } from 'node:crypto';

import { hashPassword } from 'better-auth/crypto';
import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../src/infra/db/schema';

config({ path: '.env.local' });

const url = process.env.DATABASE_URL_DIRECT;
if (!url) throw new Error('DATABASE_URL_DIRECT is not set');

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: npm run admin:create -- <email>');
  process.exit(1);
}

/** Better Auth's own id for email + password accounts, and the issuer it expects on them. */
const CREDENTIAL_PROVIDER = 'credential';
const CREDENTIAL_ISSUER = 'local:credential';

async function main() {
  const sql = postgres(url!, { max: 1 });
  const db = drizzle(sql, { schema });

  // 18 random bytes → 24 base64url chars: well above the 12-char minimum.
  const password = randomBytes(18).toString('base64url');
  const hash = await hashPassword(password);

  const created = await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email!));

    const userId = existing?.id ?? randomUUID();
    if (existing) {
      await tx.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, userId));
    } else {
      await tx.insert(schema.users).values({
        id: userId,
        email: email!,
        name: email!.split('@')[0]!,
        emailVerified: true,
        role: 'admin',
      });
    }

    const credential = and(
      eq(schema.accounts.userId, userId),
      eq(schema.accounts.providerId, CREDENTIAL_PROVIDER),
    );
    const [account] = await tx.select({ id: schema.accounts.id }).from(schema.accounts).where(credential);
    if (account) {
      await tx.update(schema.accounts).set({ password: hash }).where(eq(schema.accounts.id, account.id));
      // A reset must kick out whoever had the old password.
      await tx.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    } else {
      await tx.insert(schema.accounts).values({
        id: randomUUID(),
        issuer: CREDENTIAL_ISSUER,
        accountId: userId,
        providerId: CREDENTIAL_PROVIDER,
        userId,
        password: hash,
      });
    }
    return !existing;
  });

  await sql.end();

  console.log(`✔ ${email} ${created ? 'creado como admin' : 'es admin, con contraseña nueva'}.`);
  console.log(`  Contraseña: ${password}`);
  console.log('  Guardala en tu gestor de contraseñas: no se vuelve a mostrar. Entrá en /ingresar/admin');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
