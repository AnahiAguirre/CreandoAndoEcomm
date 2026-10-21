import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyMercadoPagoSignature } from '@/infra/payments/webhook-signature';

const secret = 'clave-secreta-de-prueba';
const dataId = '123456789';
const requestId = 'req-abc-123';
const ts = '1700000000';

const sign = (id = dataId) =>
  createHmac('sha256', secret).update(`id:${id};request-id:${requestId};ts:${ts};`).digest('hex');

const base = { secret, requestId, dataId, signatureHeader: `ts=${ts},v1=${sign()}` };

describe('verifyMercadoPagoSignature', () => {
  it('accepts a correctly signed notification', () => {
    expect(verifyMercadoPagoSignature(base)).toBe(true);
  });

  it('rejects a signature made with another secret', () => {
    expect(verifyMercadoPagoSignature({ ...base, secret: 'otra' })).toBe(false);
  });

  it('rejects a tampered payment id', () => {
    expect(verifyMercadoPagoSignature({ ...base, dataId: '999' })).toBe(false);
  });

  it('rejects a tampered request id or timestamp', () => {
    expect(verifyMercadoPagoSignature({ ...base, requestId: 'otro' })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, signatureHeader: `ts=1700000001,v1=${sign()}` })).toBe(false);
  });

  it('rejects anything missing or malformed', () => {
    expect(verifyMercadoPagoSignature({ ...base, signatureHeader: null })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, requestId: null })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, dataId: null })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, signatureHeader: 'basura' })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, signatureHeader: `ts=${ts}` })).toBe(false);
    expect(verifyMercadoPagoSignature({ ...base, signatureHeader: `ts=${ts},v1=` })).toBe(false);
  });

  it('lower-cases an alphanumeric id before checking, like Mercado Pago does', () => {
    const upper = 'ABC123';
    expect(
      verifyMercadoPagoSignature({ ...base, dataId: upper, signatureHeader: `ts=${ts},v1=${sign('abc123')}` }),
    ).toBe(true);
  });
});
