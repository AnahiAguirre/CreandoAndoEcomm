import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';
import { safeNextPath } from '@/lib/utils';

import { AdminSignInForm } from './admin-sign-in-form';

export const metadata: Metadata = { title: 'Ingreso de administración', robots: { index: false } };

interface Props {
  searchParams: Promise<{ next?: string }>;
}

/**
 * The admins' door: email + password, accounts made only by scripts/create-admin.ts.
 * Not linked from anywhere in the shop.
 */
export default async function AdminLoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNextPath(next, '/admin');

  const user = await getCurrentUser();
  if (user) redirect(isAdmin(user) ? target : '/');

  return (
    <section className="mx-auto max-w-sm px-4 py-16 md:py-24">
      <h1 className="mb-6 text-2xl font-bold">Administración</h1>
      <AdminSignInForm next={target} />
    </section>
  );
}
