'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { type RefObject, Suspense, useEffect, useRef } from 'react';

import { isActiveLink, NAV_LINKS } from './nav-links';

// Quiet buttons: a thin outline, no fill; soft yellow fills them on hover and stays on the current page.
const outlined =
  'rounded-full border border-tinta/15 text-tinta-medio transition-colors duration-300 ease-suave hover:border-amarillo/60 hover:bg-amarillo/30 hover:text-tinta aria-[current=page]:border-amarillo/60 aria-[current=page]:bg-amarillo/30 aria-[current=page]:text-tinta';
const desktopLink = `${outlined} px-3.5 py-1`;
const pill = `${outlined} flex h-9 items-center whitespace-nowrap px-4 text-sm font-semibold`;

type Variant = 'desktop' | 'mobile';

/** The menu links, with the current page marked. */
export function HeaderNav({ variant }: { variant: Variant }) {
  // useSearchParams needs a Suspense boundary; until it resolves the links render unmarked.
  return (
    <Suspense fallback={<Links variant={variant} pathname="" search="" />}>
      <CurrentLinks variant={variant} />
    </Suspense>
  );
}

function CurrentLinks({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const row = useRef<HTMLUListElement>(null);

  // On a phone the pills scroll sideways: bring the current one into view, or it can sit off screen.
  useEffect(() => {
    const current = row.current?.querySelector<HTMLElement>('[aria-current=page]');
    const list = row.current?.parentElement;
    if (!current || !list) return;
    list.scrollTo({ left: current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2, behavior: 'smooth' });
  }, [pathname, search]);

  return <Links variant={variant} pathname={pathname} search={search} rowRef={row} />;
}

function Links({
  variant,
  pathname,
  search,
  rowRef,
}: {
  variant: Variant;
  pathname: string;
  search: string;
  rowRef?: RefObject<HTMLUListElement | null>;
}) {
  const items = NAV_LINKS.map((l) => {
    const current = isActiveLink(l.href, pathname, search) ? 'page' : undefined;
    return (
      <Link key={l.href} href={l.href} aria-current={current} className={variant === 'desktop' ? desktopLink : pill}>
        {l.label}
      </Link>
    );
  });

  return variant === 'desktop' ? (
    <div className="hidden items-center justify-center gap-1 text-sm font-semibold lg:flex xl:gap-2 xl:text-[15px]">{items}</div>
  ) : (
    <ul ref={rowRef} className="flex h-12 w-max items-center gap-2 px-4">
      {items.map((item) => (
        <li key={item.key}>{item}</li>
      ))}
    </ul>
  );
}
