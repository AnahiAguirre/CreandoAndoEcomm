'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { setProductActive } from '../actions';

interface Props {
  productId: string;
  active: boolean;
}

/** Publish / unpublish. Never deletes: a product with orders must stay resolvable. */
export function PublishToggle({ productId, active }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    const result = await setProductActive(productId, !active);
    setPending(false);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <Badge tone={active ? 'success' : 'warning'}>{active ? 'Publicado' : 'Borrador'}</Badge>
        <Button variant={active ? 'secondary' : 'primary'} size="sm" onClick={toggle} disabled={pending}>
          {pending ? '…' : active ? 'Despublicar' : 'Publicar'}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
