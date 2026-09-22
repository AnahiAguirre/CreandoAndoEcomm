'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

interface Props {
  /** Where to land after the link is clicked. Must be a same-site path. */
  next: string;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'error'; message: string };

export function MagicLinkForm({ next }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    if (typeof email !== 'string' || !email) return;

    setStatus({ kind: 'sending' });
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: next });
    if (error) {
      setStatus({ kind: 'error', message: error.message ?? 'No pudimos enviar el mail. Probá de nuevo.' });
      return;
    }
    setStatus({ kind: 'sent', email });
  }

  if (status.kind === 'sent') {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-semibold">Revisá tu correo</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Te mandamos un link de ingreso a <strong>{status.email}</strong>. Vence en 15 minutos.
        </p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStatus({ kind: 'idle' })}>
          Usar otro email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-6">
      <Field label="Tu email" htmlFor="email" hint="Te mandamos un link para entrar. Sin contraseñas.">
        <Input id="email" name="email" type="email" required autoComplete="email" autoFocus placeholder="vos@ejemplo.com" />
      </Field>
      {status.kind === 'error' && <p className="text-sm text-red-600">{status.message}</p>}
      <Button type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Enviando…' : 'Enviarme el link'}
      </Button>
    </form>
  );
}
