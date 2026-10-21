import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SignedWebhook {
  /** The shared secret from Mercado Pago → Tus integraciones → Webhooks. */
  secret: string;
  /** Raw `x-signature` header: `ts=1700000000,v1=<hex hmac>`. */
  signatureHeader: string | null;
  /** Raw `x-request-id` header. */
  requestId: string | null;
  /** `data.id` from the notification (query string or body). */
  dataId: string | null;
}

/**
 * Checks that a webhook really comes from Mercado Pago: the signature is an
 * HMAC-SHA256, keyed with our secret, over `id:<data.id>;request-id:<id>;ts:<ts>;`.
 * Anything missing, malformed or different → false. Compared in constant time.
 */
export function verifyMercadoPagoSignature({ secret, signatureHeader, requestId, dataId }: SignedWebhook): boolean {
  if (!signatureHeader || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, rest.join('=')];
    }),
  );
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received) return false;

  // Mercado Pago lower-cases alphanumeric ids before signing.
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}
