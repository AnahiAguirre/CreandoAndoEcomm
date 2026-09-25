import Link from 'next/link';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';

import { SignOutButton } from './sign-out-button';

const navLink = 'text-niebla transition-colors duration-300 ease-suave hover:text-white';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    // Dark and thin, like apple.com's global nav. It scrolls away on purpose:
    // pages that need a sticky bar bring their own (the home's product bar).
    <header className="bg-tinta">
      <nav aria-label="Principal" className="mx-auto flex h-11 max-w-[70rem] items-center justify-between gap-4 px-4 text-[13px]">
        <Link href="/" className="text-[15px] font-bold tracking-[-0.01em] text-white hover:text-white">
          CreandoAndo
        </Link>

        <div className="flex items-center gap-5 md:gap-8">
          <Link href="/#armar" className={`${navLink} hidden md:inline`}>
            Rompecabezas
          </Link>
          <Link href="/#pistas" className={`${navLink} hidden md:inline`}>
            Pistas
          </Link>
          <Link href="/#imprimibles" className={`${navLink} hidden md:inline`}>
            Imprimibles
          </Link>
          <Link href="/#catalogo" className={navLink}>
            Catálogo
          </Link>
          {user ? (
            <>
              {isAdmin(user) && (
                <Link href="/admin" className={navLink}>
                  Admin
                </Link>
              )}
              <SignOutButton className="h-auto px-0 text-[13px] font-normal text-niebla hover:bg-transparent hover:text-white" />
            </>
          ) : (
            <Link href="/ingresar" className={navLink}>
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
