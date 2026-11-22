import Link from 'next/link';

import { SignOutButton } from '@/components/sign-out-button';
import { requireAdmin } from '@/lib/auth-guards';

import { AdminNav } from './_components/admin-nav';

/**
 * Every admin page renders inside this layout, so `requireAdmin()` here guards
 * all of them. Server Actions are NOT covered by layouts — each action calls
 * the guard itself.
 *
 * On a phone the panel is a bar on top (brand, shop link, sign out, sections)
 * and the page gets the whole width; from `md` up it is the sidebar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-black/10 bg-white md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:border-b md:border-black/10 md:py-4">
          <div>
            <Link href="/admin" className="font-bold">
              CreandoAndo
            </Link>
            <p className="text-xs text-neutral-500">Panel de administración</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-600 md:hidden">
            <Link href="/" className="hover:underline">
              Ver tienda
            </Link>
            <SignOutButton />
          </div>
        </div>
        <AdminNav />
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
      {/* min-w-0: a wide table scrolls inside the page instead of stretching it past the screen. */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
