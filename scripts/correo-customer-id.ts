/**
 * Asks MiCorreo for the `customerId` of the shop's account, to paste into
 * CORREO_CUSTOMER_ID. Run once, in your own terminal:
 *
 *   npm run correo:customer-id
 *
 * It reads CORREO_API_USER / CORREO_API_PASSWORD / CORREO_ENV from .env.local and
 * asks for the email and password of the MiCorreo account. Those two are only
 * sent to Correo Argentino: they are never saved anywhere.
 */
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

import { config } from 'dotenv';

import { CORREO_BASE_URLS } from '../src/infra/shipping/correo-argentino/client';

config({ path: '.env.local' });

const user = process.env.CORREO_API_USER;
const apiPassword = process.env.CORREO_API_PASSWORD;
const env = process.env.CORREO_ENV === 'prod' ? 'prod' : 'test';
if (!user || !apiPassword) throw new Error('Completá CORREO_API_USER y CORREO_API_PASSWORD en .env.local primero.');

async function ask(question: string, hidden = false): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, done) {
      if (!muted) process.stdout.write(chunk);
      done();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  const pending = rl.question(question);
  muted = hidden;
  const answer = await pending;
  rl.close();
  if (hidden) process.stdout.write('\n');
  return answer.trim();
}

async function main() {
  const base = CORREO_BASE_URLS[env];
  const email = await ask('Email de la cuenta MiCorreo: ');
  const password = await ask('Contraseña de la cuenta MiCorreo (no se ve al escribir): ', true);

  const basic = Buffer.from(`${user}:${apiPassword}`).toString('base64');
  const tokenRes = await fetch(`${base}/token`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  if (!tokenRes.ok) throw new Error(`No pude autenticar con la API (${tokenRes.status}). Revisá CORREO_API_USER y CORREO_API_PASSWORD.`);
  const { token } = (await tokenRes.json()) as { token: string };

  const res = await fetch(`${base}/users/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`MiCorreo no validó esa cuenta (${res.status}).`);
  const { customerId } = (await res.json()) as { customerId?: string };
  if (!customerId) throw new Error('MiCorreo no devolvió un customerId.');

  console.log(`\nCORREO_CUSTOMER_ID="${customerId}"`);
  console.log(`(entorno: ${env}) Pegalo en .env.local y en Vercel.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
