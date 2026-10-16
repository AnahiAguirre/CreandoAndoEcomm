import { CartProvider } from '@/components/cart/cart-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

/**
 * No width constraint here on purpose: the home page runs full-bleed sections
 * with alternating backgrounds. Each page brings its own container.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="tienda">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
