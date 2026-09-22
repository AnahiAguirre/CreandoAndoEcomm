import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { type AuthUser, isAdmin, toRole } from '@/domain/auth/user';

import { auth } from './container';

/**
 * The single door to "who is calling?". There is no Postgres RLS in this
 * project, so EVERY protected page, Server Action and Route Handler must start
 * by calling one of these. `cache` dedupes the lookup within one request.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  return { id: user.id, email: user.email, name: user.name, role: toRole(user.role) };
});

export async function requireUser(nextPath?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(nextPath ? `/ingresar?next=${encodeURIComponent(nextPath)}` : '/ingresar');
  return user;
}

export async function requireAdmin(nextPath = '/admin'): Promise<AuthUser> {
  const user = await requireUser(nextPath);
  // Don't reveal the admin area exists: a plain user just lands on the shop.
  if (!isAdmin(user)) redirect('/');
  return user;
}
