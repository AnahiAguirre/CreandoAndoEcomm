'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/cupones', label: 'Cupones' },
];

/**
 * The admin sections. On a phone they are a row of pills under the brand (they
 * wrap instead of hiding behind a menu: there are only four); from `md` up, the
 * sidebar column. The current section is marked with `aria-current`, which is
 * also what styles it: a filled pill, not just another color.
 */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="flex flex-wrap gap-1 px-3 pb-3 text-sm md:flex-1 md:flex-col md:flex-nowrap md:p-3">
      {NAV.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className="rounded-lg px-3 py-2 font-medium hover:bg-neutral-100 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
