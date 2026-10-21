import { type NextRequest, NextResponse } from 'next/server';

import { container } from '@/lib/container';

/**
 * POST /api/webhooks/mercadopago — Mercado Pago tells us a payment changed.
 *
 * Nothing in the request is trusted: the signature proves who sent it, and even
 * then only the payment id is used, to ask Mercado Pago itself what happened
 * (see ConfirmPayment). Processing is idempotent, so the retries Mercado Pago
 * sends on any non-2xx answer are harmless.
 */
export async function POST(request: NextRequest) {
  // The id arrives in the query string (`?data.id=`) and, for newer topics, in the body too.
  let dataId = request.nextUrl.searchParams.get('data.id');
  let type = request.nextUrl.searchParams.get('type') ?? request.nextUrl.searchParams.get('topic');
  if (!dataId) {
    const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string | number } } | null;
    dataId = body?.data?.id != null ? String(body.data.id) : null;
    type ??= body?.type ?? null;
  }

  const valid = container.payments.verifyWebhook({
    signatureHeader: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'),
    dataId,
  });
  if (!valid) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  // Only payments matter here; other topics (merchant_order, plans…) are acknowledged and dropped.
  if (type !== 'payment' || !dataId) return NextResponse.json({ ok: true, ignored: true });

  try {
    const outcome = await container.payments.confirm.fromPaymentId(dataId);
    return NextResponse.json({ ok: true, outcome: outcome.kind });
  } catch (err) {
    console.error('[webhook mercadopago] falló al procesar el pago', dataId, err);
    // 500 makes Mercado Pago retry later, which is what we want for a transient failure.
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }
}
