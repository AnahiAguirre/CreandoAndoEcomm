import Link from 'next/link';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';

import { SignOutButton } from './sign-out-button';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    // Sticky and translucent: the content slides under it, like apple.com.
    <header className="sticky top-0 z-40 border-b border-madera-dark/25 bg-crema/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CreandoAndo
        </Link>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              {isAdmin(user) && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1.5 font-medium transition-colors duration-300 ease-suave hover:bg-madera-soft"
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-tinta-soft sm:inline">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/ingresar"
              className="rounded-full px-3 py-1.5 font-medium transition-colors duration-300 ease-suave hover:bg-madera-soft"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
