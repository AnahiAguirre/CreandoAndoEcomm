import Image from 'next/image';
import Link from 'next/link';

import { CartLink } from '@/components/cart/cart-link';
import { isAdmin } from '@/domain/auth/user';
import { getCurrentUser } from '@/lib/auth-guards';
import { isChristmasSeason } from '@/lib/season';

import { LightGarland, SantaHat } from './christmas';
import { HeaderNav } from './header-nav';
import { UserMenu } from './user-menu';

const navLink = 'text-tinta-medio transition-colors duration-300 ease-suave hover:text-tinta';

export async function SiteHeader() {
  const user = await getCurrentUser();
  const christmas = isChristmasSeason();

  return (
    // Sticky and translucent, 64px, in sage; a hairline and a soft shadow set it apart
    // from the lighter page below.
    // Below `lg` the menu links become a row of pills under the logo (3rem more;
    // the anchors make room for it with scroll-padding-top in globals.css).
    <header className="sticky top-0 z-50 bg-salvia/95 shadow-[0_1px_0_rgb(26_23_20/0.07),0_6px_18px_-14px_rgb(26_23_20/0.25)] backdrop-blur-[16px] backdrop-saturate-[1.8]">
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[75rem] items-center justify-between px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 text-tinta hover:text-tinta">
          {/* The logo is a JPEG on white; multiply drops that white square so
              the translucent header shows through around the splashes. At
              56px its lettering is too small to read, so the name stays beside it. */}
          <span className="relative">
            <Image
              src="/home/logo.jpeg"
              alt=""
              width={56}
              height={56}
              priority
              className="size-14 mix-blend-multiply"
            />
            {christmas && <SantaHat size={30} className="absolute -top-1.5 left-0.5 -rotate-12" />}
          </span>
          <span className="font-display text-xl font-bold">CreandoAndo</span>
        </Link>

        <HeaderNav variant="desktop" />

        <div className="flex items-center justify-end gap-3 text-[15px] font-bold md:gap-5">
          <CartLink className="text-tinta-medio transition-colors duration-300 ease-suave hover:text-tinta" />
          {user ? (
            <UserMenu email={user.email} isAdmin={isAdmin(user)} />
          ) : (
            <Link href="/ingresar" className={navLink}>
              Ingresar
            </Link>
          )}
        </div>
      </nav>

      <nav aria-label="Secciones" className="no-scrollbar h-12 overflow-x-auto lg:hidden">
        <HeaderNav variant="mobile" />
      </nav>
      {/* Hints that the row of pills scrolls sideways. */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 bg-gradient-to-l from-salvia to-transparent lg:hidden" />

      {christmas && <LightGarland />}

    </header>
  );
}
