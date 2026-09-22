import Link from 'next/link';

import { SignOutButton } from '@/components/sign-out-button';
import { requireAdmin } from '@/lib/auth-guards';

const NAV = [{ href: '/admin/productos', label: 'Productos' }];

/**
 * Every admin page renders inside this layout, so `requireAdmin()` here guards
 * all of them. Server Actions are NOT covered by layouts — each action calls
 * the guard itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-black/10 bg-white">
        <div className="border-b border-black/10 px-4 py-4">
          <Link href="/admin" className="font-bold">
            CreandoAndo
          </Link>
          <p className="text-xs text-neutral-500">Panel de administración</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 font-medium hover:bg-neutral-100">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 border-t border-black/10 p-3 text-xs text-neutral-600">
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
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
