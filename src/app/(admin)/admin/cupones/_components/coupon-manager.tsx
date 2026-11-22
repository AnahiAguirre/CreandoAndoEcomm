'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import {
  type Coupon,
  type CouponKind,
  CUSTOMER_LIMIT_LABELS,
  CUSTOMER_LIMITS,
  type CustomerLimit,
  describeCoupon,
} from '@/domain/coupons/coupon';
import { formatPrice } from '@/lib/format';

import { type ActionResult, createCoupon, deleteCoupon, setCouponActive, updateCoupon } from '../actions';

interface FormState {
  code: string;
  kind: CouponKind;
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  maxUses: string;
  customerLimit: CustomerLimit;
  expiresOn: string;
  active: boolean;
}

const EMPTY: FormState = {
  code: '',
  kind: 'percent',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  maxUses: '',
  customerLimit: 'once',
  expiresOn: '',
  active: true,
};

/** "YYYY-MM-DD" of a date as seen in Argentina (UTC-3), for the date picker. */
function arDate(date: Date): string {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function toForm(c: Coupon): FormState {
  return {
    code: c.code,
    kind: c.kind,
    value: String(c.kind === 'percent' ? c.value : c.value / 100),
    minSubtotal: c.minSubtotalCents === null ? '' : String(c.minSubtotalCents / 100),
    maxDiscount: c.maxDiscountCents === null ? '' : String(c.maxDiscountCents / 100),
    maxUses: c.maxUses === null ? '' : String(c.maxUses),
    customerLimit: c.customerLimit,
    expiresOn: c.expiresAt ? arDate(c.expiresAt) : '',
    active: c.active,
  };
}

/** Why a coupon would be refused right now, or null when it works. */
function blockedReason(c: Coupon, now: Date): string | null {
  if (!c.active) return 'Desactivado';
  if (c.expiresAt && now > c.expiresAt) return 'Vencido';
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return 'Agotado';
  return null;
}

/** Create, edit, switch on/off and delete discount coupons. */
export function CouponManager({ coupons, now }: { coupons: Coupon[]; now: Date }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<ActionResult>): Promise<boolean> {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  const set = (field: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const input = { ...form };
    const ok = await run(() => (editingId ? updateCoupon(editingId, input) : createCoupon(input)));
    if (ok) {
      setForm(EMPTY);
      setEditingId(null);
    }
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setForm(toForm(c));
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  }

  async function remove(c: Coupon) {
    const note = c.usedCount > 0 ? ' Los pedidos que ya lo usaron conservan su descuento.' : '';
    if (!window.confirm(`¿Borrar el cupón ${c.code}?${note} Si solo querés que deje de funcionar, desactivalo.`)) return;
    await run(() => deleteCoupon(c.id));
  }

  const percent = form.kind === 'percent';

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <form onSubmit={save} className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">{editingId ? `Editar cupón ${form.code}` : 'Nuevo cupón'}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Código" htmlFor="code" hint="Lo que escribe el comprador. Ej: NAVIDAD10">
            <Input id="code" value={form.code} onChange={set('code')} className="uppercase" required />
          </Field>
          <Field label="Tipo de descuento" htmlFor="kind">
            <Select id="kind" value={form.kind} onChange={set('kind')}>
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </Select>
          </Field>
          <Field label={percent ? 'Porcentaje' : 'Monto en pesos'} htmlFor="value" hint={percent ? 'De 1 a 100' : 'Ej: 5000'}>
            <Input id="value" type="number" min={1} max={percent ? 100 : undefined} step={percent ? 1 : 'any'} value={form.value} onChange={set('value')} required />
          </Field>
          <Field label="Compra mínima en pesos (opcional)" htmlFor="minSubtotal" hint="Sin contar el envío">
            <Input id="minSubtotal" type="number" min={0} step="any" value={form.minSubtotal} onChange={set('minSubtotal')} />
          </Field>
          {percent && (
            <Field label="Tope de descuento en pesos (opcional)" htmlFor="maxDiscount" hint="Ej: 10000 = descuenta hasta $10.000">
              <Input id="maxDiscount" type="number" min={1} step="any" value={form.maxDiscount} onChange={set('maxDiscount')} />
            </Field>
          )}
          <Field label="Quién lo puede usar" htmlFor="customerLimit">
            <Select id="customerLimit" value={form.customerLimit} onChange={set('customerLimit')}>
              {CUSTOMER_LIMITS.map((l) => (
                <option key={l} value={l}>
                  {CUSTOMER_LIMIT_LABELS[l]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Usos en total (opcional)" htmlFor="maxUses" hint="Sumando todos los clientes. Vacío: sin límite">
            <Input id="maxUses" type="number" min={1} step={1} value={form.maxUses} onChange={set('maxUses')} />
          </Field>
          <Field label="Vence (opcional)" htmlFor="expiresOn" hint="Sirve hasta el final de ese día">
            <Input id="expiresOn" type="date" value={form.expiresOn} onChange={set('expiresOn')} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          Activo
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {editingId ? 'Guardar cambios' : 'Crear cupón'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={cancelEdit} disabled={pending}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {coupons.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay cupones. Creá el primero.</p>
      ) : (
        <div role="region" aria-label="Lista de cupones" tabIndex={0} className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Condiciones</th>
                <th className="px-4 py-3 text-right">Usos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {coupons.map((c) => {
                const blocked = blockedReason(c, now);
                const conditions = [
                  c.customerLimit !== 'unlimited' && CUSTOMER_LIMIT_LABELS[c.customerLimit],
                  c.minSubtotalCents !== null && `Desde ${formatPrice(c.minSubtotalCents)}`,
                  c.expiresAt && `Vence ${c.expiresAt.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
                ].filter(Boolean);
                return (
                  <tr key={c.id} className={editingId === c.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'}>
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">{describeCoupon(c)}</td>
                    <td className="px-4 py-3 text-neutral-600">{conditions.length ? conditions.join(' · ') : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.usedCount}
                      {c.maxUses !== null && ` / ${c.maxUses}`}
                    </td>
                    <td className="px-4 py-3">
                      {blocked ? <Badge tone="warning">{blocked}</Badge> : <Badge tone="success">Funciona</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => run(() => setCouponActive(c.id, !c.active))} disabled={pending}>
                          {c.active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(c)} disabled={pending}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(c)} disabled={pending}>
                          Borrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
