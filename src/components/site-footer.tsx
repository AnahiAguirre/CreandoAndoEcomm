import Link from 'next/link';

import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/contact';

const LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/envios', label: 'Envíos y retiro' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/mis-pedidos', label: 'Mis pedidos' },
];

export function SiteFooter() {
  return (
    <footer className="bg-elegidos-fondo">
      <div className="mx-auto flex max-w-[75rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-10 text-sm text-tinta-soft">
        <span>© {new Date().getFullYear()} CreandoAndo · Juguetes de madera e imprimibles</span>
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-tinta-soft hover:text-tinta">
              {l.label}
            </Link>
          ))}
          <a
            href={whatsappLink('Hola, tengo una consulta sobre CreandoAndo.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tinta-soft hover:text-tinta"
          >
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </nav>
      </div>
    </footer>
  );
}
