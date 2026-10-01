'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';

import { adjustProductPrices } from '../actions';

interface Props {
  /** The products the list is showing right now (so a search narrows the batch). */
  productIds: string[];
  filtered: boolean;
}

/** Raise or lower the price of every listed product by a percentage. */
export function BulkPriceAdjust({ productIds, filtered }: Props) {
  const router = useRouter();
  const [percent, setPercent] = useState('');
  const [roundTo, setRoundTo] = useState('100');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const n = productIds.length;
  const value = Number(percent.replace(',', '.'));
  const valid = percent.trim() !== '' && Number.isFinite(value) && value !== 0;

  async function apply() {
    const verb = value > 0 ? 'subir' : 'bajar';
    const scope = filtered ? `los ${n} productos de esta búsqueda` : `los ${n} productos`;
    if (!window.confirm(`Vas a ${verb} ${Math.abs(value)}% el precio de ${scope}. ¿Continuar?`)) return;

    setPending(true);
    setMessage(null);
    const result = await adjustProductPrices({ ids: productIds, percent: value, roundTo: Number(roundTo) as 1 });
    setPending(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    const count = result.data.updated;
    setMessage({ ok: true, text: count === 1 ? 'Se actualizó 1 precio.' : `Se actualizaron ${count} precios.` });
    setPercent('');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bulk-percent" className="text-sm font-medium">
            Ajustar precios (%)
          </label>
          <Input
            id="bulk-percent"
            inputMode="decimal"
            placeholder="ej: 10 o -5"
            className="w-32"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bulk-round" className="text-sm font-medium">
            Redondear a
          </label>
          <Select id="bulk-round" className="w-36" value={roundTo} onChange={(e) => setRoundTo(e.target.value)}>
            <option value="1">Sin redondeo</option>
            <option value="100">$1</option>
            <option value="1000">$10</option>
            <option value="10000">$100</option>
          </Select>
        </div>
        <Button onClick={apply} disabled={pending || !valid || n === 0}>
          {pending ? 'Aplicando…' : `Aplicar a ${n}`}
        </Button>
      </div>
      <p className="text-xs text-neutral-500">
        {filtered
          ? 'Se aplica solo a los productos de la búsqueda actual.'
          : 'Se aplica a todos los productos. Usá la búsqueda para acotar.'}
      </p>
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-700' : 'text-sm text-red-600'}>
          {message.text}
        </p>
      )}
    </div>
  );
}
