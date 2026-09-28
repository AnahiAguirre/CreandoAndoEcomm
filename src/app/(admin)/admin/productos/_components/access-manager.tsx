'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';

import { grantAccess, revokeAccess } from '../actions';

export interface AccessRow {
  id: string;
  email: string;
  source: 'purchase' | 'manual';
  createdAt: string;
}

interface Props {
  productId: string;
  grants: AccessRow[];
  /** Granting needs at least one PDF; the server enforces it too. */
  hasFiles: boolean;
}

/**
 * Who can download this digital product. Until Mercado Pago is wired (fase 3)
 * this is the only way in: gifts, sales closed by WhatsApp, tests.
 */
export function AccessManager({ productId, grants, hasFiles }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  async function onGrant(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await grantAccess(productId, email);
    setBusy(false);
    if (!result.ok) return setMessage({ tone: 'error', text: result.error });

    const { created, mailed } = result.data;
    setMessage(
      !created
        ? { tone: 'ok', text: 'Ese email ya tenía acceso. No se mandó otro mail.' }
        : mailed
          ? { tone: 'ok', text: 'Listo: ya puede descargarlo y le mandamos un mail avisando.' }
          : { tone: 'error', text: 'Acceso dado, pero no se pudo mandar el mail. Avisale por otro medio.' },
    );
    if (created) setEmail('');
    router.refresh();
  }

  async function onRevoke(row: AccessRow) {
    if (!confirm(`¿Quitarle el acceso a ${row.email}? Deja de ver el PDF en Mis descargas.`)) return;
    setRemoving(row.id);
    setMessage(null);
    const result = await revokeAccess(productId, row.id);
    setRemoving(null);
    if (!result.ok) return setMessage({ tone: 'error', text: result.error });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">Quién puede descargarlo</h2>

      <form onSubmit={onGrant} className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="email@cliente.com"
          aria-label="Email al que darle acceso"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!hasFiles || busy}
        />
        <Button type="submit" variant="secondary" size="sm" className="h-auto shrink-0" disabled={!hasFiles || busy}>
          {busy ? 'Dando acceso…' : 'Dar acceso'}
        </Button>
      </form>
      {!hasFiles && <p className="text-xs text-neutral-500">Subí el PDF para poder dar acceso.</p>}

      {message && (
        <p role={message.tone === 'error' ? 'alert' : 'status'} className={message.tone === 'error' ? 'text-sm text-red-600' : 'text-sm text-green-700'}>
          {message.text}
        </p>
      )}

      {grants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-neutral-500">
          Nadie todavía. El email ve el PDF en Mis descargas apenas entra con ese mismo email.
        </p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-xl border border-black/10 bg-white text-sm">
          {grants.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0">
                <span className="block truncate font-medium">{row.email}</span>
                <span className="text-xs text-neutral-500">
                  {row.source === 'purchase' ? 'Compra' : 'Dado a mano'} · {row.createdAt}
                </span>
              </span>
              <Button variant="ghost" size="sm" disabled={removing === row.id} onClick={() => onRevoke(row)}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
