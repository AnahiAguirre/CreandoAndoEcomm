import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth-guards';

import { MagicLinkForm } from './magic-link-form';

export const metadata: Metadata = { title: 'Ingresar' };

interface Props {
  searchParams: Promise<{ next?: string }>;
}

/** Only allow same-site relative paths as post-login destination (no open redirects). */
function safeNext(value: string | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);

  if (await getCurrentUser()) redirect(target);

  return (
    <section className="mx-auto max-w-sm py-8">
      <h1 className="mb-6 text-2xl font-bold">Ingresar</h1>
      <MagicLinkForm next={target} />
    </section>
  );
}
