import Link from 'next/link';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';

import { SignOutButton } from './sign-out-button';

const navLink = 'text-tinta-medio transition-colors duration-300 ease-suave hover:text-tinta';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    // Sticky and translucent, 64px, like the approved design. Every anchor
    // link is prefixed with `/` because this header renders on every page,
    // not just the home — it has to go home first before it can scroll.
    <header className="sticky top-0 z-50 h-16 border-b border-borde-suave bg-white/90 backdrop-blur-[16px] backdrop-saturate-[1.8]">
      <nav aria-label="Principal" className="mx-auto grid h-16 max-w-[75rem] grid-cols-3 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5 text-tinta hover:text-tinta">
          <span className="flex size-[30px] items-center justify-center rounded-lg bg-azul">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12h5a2 2 0 1 0 0-4V4h11v5a2 2 0 1 1 0 4v7H4z" />
            </svg>
          </span>
          <span className="font-display text-xl font-bold">CreandoAndo</span>
        </Link>

        <div className="hidden items-center justify-center gap-8 text-[15px] font-semibold sm:flex">
          <Link href="/#armar" className={navLink}>
            Rompecabezas
          </Link>
          <Link href="/#pistas" className={navLink}>
            Pistas
          </Link>
          <Link href="/#imprimibles" className={navLink}>
            Imprimibles
          </Link>
          <Link href="/#elegidos" className={navLink}>
            Catálogo
          </Link>
        </div>

        <div className="flex items-center justify-end gap-5 text-[15px] font-bold">
          {user ? (
            <>
              {isAdmin(user) && (
                <Link href="/admin" className={navLink}>
                  Admin
                </Link>
              )}
              <SignOutButton className="h-auto px-0 text-[15px] font-bold text-tinta-medio hover:bg-transparent hover:text-tinta" />
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
