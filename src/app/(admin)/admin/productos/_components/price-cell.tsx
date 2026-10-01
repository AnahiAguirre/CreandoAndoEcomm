'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Input } from '@/components/ui/field';
import { centsToPriceString } from '@/domain/catalog/product-input';
import { formatPrice } from '@/lib/format';

import { updateProductPrice } from '../actions';

interface Props {
  productId: string;
  priceCents: number;
}

/** Click the price to edit it in place. Enter or blur saves, Esc cancels. */
export function PriceCell({ productId, priceCents }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Esc unmounts the input, which fires blur; this stops that blur from saving.
  const cancelled = useRef(false);

  function start() {
    cancelled.current = false;
    setValue(centsToPriceString(priceCents));
    setError(null);
    setEditing(true);
  }

  async function save() {
    if (cancelled.current || pending) return;
    if (value.trim() === centsToPriceString(priceCents)) return setEditing(false);
    setPending(true);
    const result = await updateProductPrice(productId, value);
    setPending(false);
    if (!result.ok) return setError(result.error);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        title="Editar precio"
        className="rounded-md px-2 py-1 tabular-nums hover:bg-neutral-100"
      >
        {formatPrice(priceCents)}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Input
        autoFocus
        inputMode="decimal"
        aria-label="Precio"
        aria-invalid={error ? true : undefined}
        className="w-28 text-right tabular-nums"
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelled.current = true;
            setEditing(false);
          }
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
