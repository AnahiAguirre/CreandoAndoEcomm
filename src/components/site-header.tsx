import Image from 'next/image';
import Link from 'next/link';

import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';

import { NAV_LINKS } from './nav-links';
import { SignOutButton } from './sign-out-button';

const navLink = 'text-tinta-medio transition-colors duration-300 ease-suave hover:text-tinta';
const pill =
  'flex h-9 items-center whitespace-nowrap rounded-full bg-arena px-4 text-sm font-semibold text-tinta-medio transition-colors duration-300 ease-suave hover:bg-azul hover:text-white';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    // Sticky and translucent, 64px, like the approved design. Below `md` the
    // section links become a row of pills under the logo (3rem more; the
    // anchors make room for it with scroll-padding-top in globals.css).
    <header className="sticky top-0 z-50 border-b border-borde-suave bg-white/90 backdrop-blur-[16px] backdrop-saturate-[1.8]">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[75rem] items-center justify-between px-4 md:grid md:grid-cols-3">
        <Link href="/" className="flex items-center gap-2 text-tinta hover:text-tinta">
          {/* The logo is a JPEG on white; multiply drops that white square so
              the translucent header shows through around the splashes. At
              56px its lettering is too small to read, so the name stays beside it. */}
          <Image
            src="/home/logo.jpeg"
            alt=""
            width={56}
            height={56}
            priority
            className="size-14 mix-blend-multiply"
          />
          <span className="font-display text-xl font-bold">CreandoAndo</span>
        </Link>

        <div className="hidden items-center justify-center gap-8 text-[15px] font-semibold md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLink}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4 text-[15px] font-bold md:gap-5">
          {user ? (
            <>
              <Link href="/mis-descargas" className={`${navLink} hidden md:inline`}>
                Mis descargas
              </Link>
              {isAdmin(user) && (
                <Link href="/admin" className={`${navLink} hidden md:inline`}>
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

      <nav aria-label="Secciones" className="no-scrollbar h-12 overflow-x-auto md:hidden">
        <ul className="flex h-12 w-max items-center gap-2 px-4">
          {/* On a phone the top row has no room for them, so "Mis descargas" and "Admin" ride here. */}
          {[
            ...NAV_LINKS,
            ...(user ? [{ href: '/mis-descargas', label: 'Mis descargas' }] : []),
            ...(user && isAdmin(user) ? [{ href: '/admin', label: 'Admin' }] : []),
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={pill}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
