import Link from 'next/link';

import { SignOutButton } from '@/components/sign-out-button';
import { requireAdmin } from '@/lib/auth-guards';

const NAV = [
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/cupones', label: 'Cupones' },
];

/**
 * Every admin page renders inside this layout, so `requireAdmin()` here guards
 * all of them. Server Actions are NOT covered by layouts — each action calls
 * the guard itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  // Phone: the sidebar becomes a top bar (brand + account on one row, the sections as a
  // row of pills that scrolls sideways). From `md` up it is the usual left sidebar.
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-black/10 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:border-b md:border-black/10 md:py-4">
          <div>
            <Link href="/admin" className="font-bold">
              CreandoAndo
            </Link>
            <p className="text-xs text-neutral-500">Panel de administración</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-600 md:hidden">
            <Link href="/" className="hover:underline">
              Ver tienda
            </Link>
            <SignOutButton />
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-1 md:flex-col md:overflow-visible md:p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg bg-neutral-100 px-3 py-2 font-medium hover:bg-neutral-200 md:bg-transparent md:hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-col gap-2 border-t border-black/10 p-3 text-xs text-neutral-600 md:flex">
          <span className="truncate" title={user.email}>
            {user.email}
          </span>
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:underline">
              Ver tienda
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
      {/* min-w-0: a wide table scrolls inside its own box instead of pushing the page sideways. */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
