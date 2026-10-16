import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth-guards';
import { googleSignInEnabled } from '@/lib/env';
import { safeNextPath } from '@/lib/utils';

import { GoogleSignInButton } from './google-sign-in-button';

export const metadata: Metadata = { title: 'Ingresar' };

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

/** Better Auth sends the buyer back with `?error=<code>` when the Google round-trip fails. */
function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === 'access_denied') return 'Cancelaste el ingreso con Google. Cuando quieras, probá de nuevo.';
  return 'No pudimos completar el ingreso con Google. Probá de nuevo.';
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const target = safeNextPath(next);

  if (await getCurrentUser()) redirect(target);

  const message = errorMessage(error);

  return (
    <section className="mx-auto max-w-sm px-4 py-16 md:py-24">
      <h1 className="mb-6 text-2xl font-bold">Ingresar</h1>
      <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-6">
        {googleSignInEnabled ? (
          <>
            <p className="text-sm text-neutral-600">
              Entrás con tu cuenta de Google, sin contraseñas nuevas. Tus descargas quedan guardadas en ese email.
            </p>
            {message && (
              <p role="alert" className="text-sm text-red-600">
                {message}
              </p>
            )}
            <GoogleSignInButton next={target} />
          </>
        ) : (
          <p className="text-sm text-neutral-600">Muy pronto vas a poder entrar con tu cuenta de Google.</p>
        )}
      </div>
    </section>
  );
}
