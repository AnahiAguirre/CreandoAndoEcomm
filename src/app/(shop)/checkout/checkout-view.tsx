'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import { useCart } from '@/components/cart/cart-provider';
import { useHydrated } from '@/components/cart/use-hydrated';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import type { CheckoutPreview } from '@/domain/orders/use-cases/create-checkout';
import { missingForFreeShipping } from '@/domain/orders/free-shipping';
import type { Agency, ShippingQuote } from '@/domain/orders/ports';
import { CARRIER_COST_NOTE, PICKUP_LABEL, PICKUP_NOTE } from '@/domain/orders/pickup';
import { type CarrierMethod, PROVINCES, type ProvinceCode, type ShippingMethod } from '@/domain/orders/order';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_FROM } from '@/lib/shipping-copy';

import type { AppliedCoupon } from '@/domain/coupons/coupon';

import { applyCoupon, previewCheckout, quoteShipping, startCheckout } from './actions';

interface Quoted {
  /** What the quote is valid for: if any of these change, it must be asked again. */
  forKey: string;
  quote: ShippingQuote;
  agencies: Agency[];
}

const EMPTY_FORM = {
  recipient: '',
  phone: '',
  provinceCode: '',
  postalCode: '',
  streetName: '',
  streetNumber: '',
  floor: '',
  apartment: '',
  city: '',
  agencyId: '',
};

const METHOD_LABELS = {
  retiro: `${PICKUP_LABEL} (gratis)`,
  domicilio: 'Envío por Correo Argentino',
  sucursal: 'Retiro en sucursal de Correo',
} satisfies Record<ShippingMethod, string>;

/**
 * `carrierQuotes`: Correo Argentino is connected, so the price is quoted and branches can be
 * chosen. Without it the carrier cost is agreed by message and nothing is added to the payment.
 */
export function CheckoutView({ carrierQuotes }: { carrierQuotes: boolean }) {
  const { lines } = useCart();
  const hydrated = useHydrated();
  const linesKey = JSON.stringify(lines);

  const [loaded, setLoaded] = useState<{ key: string; preview: CheckoutPreview | null } | null>(null);
  const [method, setMethod] = useState<ShippingMethod>('retiro');
  const [form, setForm] = useState(EMPTY_FORM);
  const [quoted, setQuoted] = useState<Quoted | null>(null);
  const [busy, setBusy] = useState<'quote' | 'pay' | 'coupon' | null>(null);
  const [couponText, setCouponText] = useState('');
  /** The accepted coupon and the cart it was priced for: if the cart changes, it is asked again. */
  const [coupon, setCoupon] = useState<{ forLines: string; applied: AppliedCoupon } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    let cancelled = false;
    previewCheckout(lines).then((preview) => {
      if (!cancelled) setLoaded({ key: linesKey, preview });
    });
    return () => {
      cancelled = true;
    };
    // `linesKey` is the stable identity of `lines`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, linesKey]);

  if (!hydrated) return <Skeleton />;

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-borde-suave bg-white p-10 text-center">
        <p className="font-semibold">Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const preview = loaded?.key === linesKey ? loaded.preview : undefined;
  if (preview === undefined) return <Skeleton />;
  if (preview === null || preview.items.length === 0 || preview.adjustments.length > 0) {
    return (
      <div className="mt-10 rounded-3xl bg-amarillo-soft p-6 text-sm">
        <p className="font-semibold">Tu carrito cambió desde la última vez.</p>
        {preview?.adjustments.map((a) => (
          <p key={a.message} className="mt-1">
            {a.message}
          </p>
        ))}
        <Link href="/carrito" className="mt-4 inline-block font-semibold underline">
          Revisar el carrito
        </Link>
      </div>
    );
  }

  const { hasPhysical } = preview;
  const currentKey = `${form.provinceCode}|${form.postalCode.trim().toUpperCase()}|${method}|${linesKey}`;
  const quote = quoted?.forKey === currentKey ? quoted : null;
  const methods: ShippingMethod[] = carrierQuotes ? ['retiro', 'domicilio', 'sucursal'] : ['retiro', 'domicilio'];
  const shipsByCarrier = method !== 'retiro';
  // Same rule as the server (`CreateCheckout.quoteShipping`): products subtotal, before any coupon.
  const missingCents = missingForFreeShipping(preview.subtotalCents);
  const freeShipping = missingCents === 0;
  const needsQuote = carrierQuotes && shipsByCarrier;
  const shippingCents = hasPhysical && needsQuote ? (quote?.quote.priceCents ?? 0) : 0;
  const applied = coupon?.forLines === linesKey ? coupon.applied : null;
  const discountCents = applied?.discountCents ?? 0;
  const total = preview.subtotalCents - discountCents + shippingCents;
  const canPay =
    busy === null &&
    (!hasPhysical || !needsQuote || (quote !== null && (method === 'domicilio' || form.agencyId !== '')));

  const set = (field: keyof typeof EMPTY_FORM) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onQuote() {
    setBusy('quote');
    setError(null);
    setFieldErrors({});
    const result = await quoteShipping({
      lines,
      provinceCode: form.provinceCode as ProvinceCode,
      postalCode: form.postalCode,
      method: method as CarrierMethod,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }
    setQuoted({ forKey: currentKey, quote: result.data.quote, agencies: result.data.agencies });
    setForm((f) => ({ ...f, agencyId: '' }));
  }

  async function onApplyCoupon() {
    setBusy('coupon');
    setCouponError(null);
    const result = await applyCoupon({ lines, code: couponText });
    setBusy(null);
    if (!result.ok) {
      setCoupon(null);
      setCouponError(result.error);
      return;
    }
    setCoupon({ forLines: linesKey, applied: result.data });
    setCouponText('');
  }

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setBusy('pay');
    setError(null);
    setFieldErrors({});
    const result = await startCheckout({
      lines,
      shipping: !hasPhysical
        ? undefined
        : method === 'retiro'
          ? { method, recipient: form.recipient, phone: form.phone }
          : {
              method,
              recipient: form.recipient,
              phone: form.phone,
              provinceCode: form.provinceCode,
              postalCode: form.postalCode,
              streetName: method === 'domicilio' ? form.streetName : undefined,
              streetNumber: method === 'domicilio' ? form.streetNumber : undefined,
              floor: method === 'domicilio' ? form.floor : undefined,
              apartment: method === 'domicilio' ? form.apartment : undefined,
              city: method === 'domicilio' ? form.city : undefined,
              agencyId: method === 'sucursal' ? form.agencyId : undefined,
            },
      couponCode: applied?.code,
    });
    if (!result.ok) {
      setBusy(null);
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }
    // Off to Mercado Pago. The cart is kept until the payment is confirmed (see /pedido/[id]).
    window.location.assign(result.data.redirectUrl);
  }

  return (
    <form onSubmit={onPay} className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="flex flex-col gap-6">
        {hasPhysical && (
          <fieldset className="flex flex-col gap-4 rounded-3xl border border-borde-suave bg-white p-6">
            <legend className="px-1 text-lg font-semibold">Envío</legend>
            <div className={`grid gap-3 ${methods.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {methods.map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-medium ${
                    method === m ? 'border-azul bg-azul/5' : 'border-borde-suave'
                  }`}
                >
                  <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
                  {METHOD_LABELS[m]}
                </label>
              ))}
            </div>

            <p className="text-xs text-tinta-medio">
              {method === 'retiro' ? (
                PICKUP_NOTE
              ) : freeShipping ? (
                <span className="font-semibold text-verde">
                  Tu compra llega a {FREE_SHIPPING_FROM}: el envío por Correo es gratis.
                </span>
              ) : (
                <>
                  {!carrierQuotes && `${CARRIER_COST_NOTE} `}
                  Te faltan {formatPrice(missingCents)} para el envío gratis (desde {FREE_SHIPPING_FROM}).
                </>
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre de quien recibe" htmlFor="recipient" errors={fieldErrors.recipient}>
                <Input id="recipient" value={form.recipient} onChange={set('recipient')} autoComplete="name" required />
              </Field>
              <Field label="Teléfono" htmlFor="phone" errors={fieldErrors.phone}>
                <Input id="phone" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" required />
              </Field>
              {shipsByCarrier && (
                <>
              <Field label="Provincia" htmlFor="provinceCode" errors={fieldErrors.provinceCode}>
                <Select id="provinceCode" value={form.provinceCode} onChange={set('provinceCode')} required>
                  <option value="">Elegí tu provincia…</option>
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Código postal" htmlFor="postalCode" errors={fieldErrors.postalCode} hint="Ej. 1425 o C1425ABC">
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  autoComplete="postal-code"
                  required
                />
              </Field>
                </>
              )}
              {method === 'domicilio' && (
                <>
                  <Field label="Calle" htmlFor="streetName" errors={fieldErrors.streetName}>
                    <Input id="streetName" value={form.streetName} onChange={set('streetName')} autoComplete="address-line1" required />
                  </Field>
                  <Field label="Altura" htmlFor="streetNumber" errors={fieldErrors.streetNumber}>
                    <Input id="streetNumber" value={form.streetNumber} onChange={set('streetNumber')} inputMode="numeric" required />
                  </Field>
                  <Field label="Piso (opcional)" htmlFor="floor" errors={fieldErrors.floor}>
                    <Input id="floor" value={form.floor} onChange={set('floor')} />
                  </Field>
                  <Field label="Depto (opcional)" htmlFor="apartment" errors={fieldErrors.apartment}>
                    <Input id="apartment" value={form.apartment} onChange={set('apartment')} />
                  </Field>
                  <Field label="Localidad" htmlFor="city" errors={fieldErrors.city}>
                    <Input id="city" value={form.city} onChange={set('city')} autoComplete="address-level2" required />
                  </Field>
                </>
              )}
            </div>

            {needsQuote && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={onQuote} disabled={busy !== null || !form.postalCode || !form.provinceCode}>
                {busy === 'quote' ? 'Calculando…' : quote ? 'Recalcular envío' : 'Calcular envío'}
              </Button>
              {quote && (
                <p className="text-sm">
                  {quote.quote.label}:{' '}
                  <strong>{quote.quote.priceCents === 0 ? 'Gratis' : formatPrice(quote.quote.priceCents)}</strong>{' '}
                  {quote.quote.etaDays > 0 && (
                    <span className="text-tinta-medio">· llega en ~{quote.quote.etaDays} días</span>
                  )}
                </p>
              )}
            </div>
            )}

            {needsQuote && method === 'sucursal' && quote && (
              <Field label="Sucursal" htmlFor="agencyId" errors={fieldErrors.agencyId}>
                <Select id="agencyId" value={form.agencyId} onChange={set('agencyId')} required>
                  <option value="">Elegí una sucursal…</option>
                  {quote.agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.address}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </fieldset>
        )}

        <ul className="flex flex-col gap-2 rounded-3xl border border-borde-suave bg-white p-6 text-sm">
          {preview.items.map(({ product, quantity, lineTotalCents }) => (
            <li key={product.id} className="flex justify-between gap-4">
              <span>
                {quantity} × {product.name}
              </span>
              <span className="font-medium">{formatPrice(lineTotalCents)}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-3xl border border-borde-suave bg-white p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-tinta-medio">Subtotal</dt>
            <dd className="font-semibold">{formatPrice(preview.subtotalCents)}</dd>
          </div>
          {applied && (
            <div className="flex justify-between text-verde">
              <dt>Cupón {applied.code}</dt>
              <dd className="font-semibold">− {formatPrice(applied.discountCents)}</dd>
            </div>
          )}
          {hasPhysical && (
            <div className="flex justify-between">
              <dt className="text-tinta-medio">Envío</dt>
              <dd className="font-semibold">
                {method === 'retiro' || freeShipping
                  ? 'Gratis'
                  : !carrierQuotes
                    ? 'A coordinar'
                    : quote
                      ? formatPrice(shippingCents)
                      : 'Calculalo para ver el total'}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-4 border-t border-borde-suave pt-4">
          {applied ? (
            <p className="flex items-center justify-between gap-3 text-sm">
              <span>
                <strong>{applied.code}</strong> · {applied.label}
              </span>
              <button
                type="button"
                onClick={() => setCoupon(null)}
                className="text-tinta-medio underline hover:text-tinta"
              >
                Quitar
              </button>
            </p>
          ) : (
            <>
              <label htmlFor="coupon" className="text-sm font-medium">
                ¿Tenés un cupón?
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="coupon"
                  value={couponText}
                  onChange={(e) => setCouponText(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter here applies the coupon; it must not submit the payment form.
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (couponText.trim()) void onApplyCoupon();
                    }
                  }}
                  placeholder="Código"
                  autoComplete="off"
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onApplyCoupon}
                  disabled={busy !== null || !couponText.trim()}
                >
                  {busy === 'coupon' ? 'Aplicando…' : 'Aplicar'}
                </Button>
              </div>
              {couponError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {couponError}
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-4 flex justify-between border-t border-borde-suave pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canPay}
          className="mt-6 h-12 w-full rounded-full bg-azul px-7 font-medium text-white transition-colors hover:bg-azul-dark disabled:pointer-events-none disabled:opacity-40"
        >
          {busy === 'pay' ? 'Llevándote a Mercado Pago…' : 'Pagar con Mercado Pago'}
        </button>
        <p className="mt-3 text-center text-xs text-tinta-medio">
          Pagás en el sitio de Mercado Pago. Nosotros nunca vemos los datos de tu tarjeta.
        </p>
      </aside>
    </form>
  );
}

function Skeleton() {
  return <div className="mt-10 h-40 animate-pulse rounded-3xl bg-arena" aria-hidden="true" />;
}
