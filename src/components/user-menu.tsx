'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { SignOutButton } from './sign-out-button';

interface Props {
  email: string;
  isAdmin: boolean;
}

const item =
  'block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-tinta-medio transition-colors duration-200 hover:bg-arena hover:text-tinta';

/**
 * The signed-in buyer's links behind one hamburger button, so the header never
 * runs out of room (cart + three links + "Salir" did not fit). Closes with
 * Escape, a click outside, or choosing a link.
 */
export function UserMenu({ email, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="Menú de mi cuenta"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-9 items-center justify-center rounded-full text-tinta-medio transition-colors duration-300 ease-suave hover:bg-arena hover:text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
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

      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-borde-suave bg-white p-2 shadow-[0_20px_40px_-20px_rgb(26_23_20/0.35)]"
        >
          <p className="truncate px-3 pb-2 pt-1 text-xs font-normal text-tinta-soft" title={email}>
            {email}
          </p>
          <nav aria-label="Mi cuenta" className="flex flex-col">
            <Link href="/mis-pedidos" className={item} onClick={close}>
              Mis pedidos
            </Link>
            <Link href="/mis-descargas" className={item} onClick={close}>
              Mis descargas
            </Link>
            {isAdmin && (
              <Link href="/admin" className={item} onClick={close}>
                Administración
              </Link>
            )}
          </nav>
          <div className="mt-1 border-t border-borde-suave pt-1">
            <SignOutButton className="h-auto w-full justify-start rounded-xl px-3 py-2.5 text-[15px] font-semibold text-tinta-medio hover:bg-arena hover:text-tinta" />
          </div>
        </div>
      )}
    </div>
  );
}
