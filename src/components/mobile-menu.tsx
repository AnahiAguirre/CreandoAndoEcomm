'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

import { NAV_LINKS } from './nav-links';

/**
 * The header's section links, for screens too narrow to show them inline: a
 * button that drops a panel under the header. Closes on a link, on Escape, or
 * on a second tap.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 flex size-11 items-center justify-center rounded-full text-tinta transition-colors duration-300 ease-suave hover:bg-arena md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-borde-suave bg-white shadow-[0_20px_30px_-24px_rgb(26_23_20/0.35)] md:hidden"
      >
        <ul className="mx-auto flex max-w-[75rem] flex-col px-4 py-2">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="border-b border-borde-suave last:border-0">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-[17px] font-semibold text-tinta hover:text-azul"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
