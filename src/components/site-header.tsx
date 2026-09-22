import Link from 'next/link';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';

import { SignOutButton } from './sign-out-button';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          CreandoAndo
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {isAdmin(user) && (
                <Link href="/admin" className="rounded-lg bg-neutral-100 px-3 py-1.5 font-medium hover:bg-neutral-200">
                  Admin
                </Link>
              )}
              <span className="hidden text-neutral-600 sm:inline">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/ingresar" className="font-medium hover:underline">
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
