import Link from 'next/link';

import { TrainTrack } from '@/components/train-track';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/contact';

const LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/envios', label: 'Envíos y retiro' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/mis-pedidos', label: 'Mis pedidos' },
];

const footerLink =
  'text-tinta-medio underline decoration-tinta-soft/40 decoration-1 underline-offset-4 transition-colors duration-300 ease-suave hover:text-azul hover:decoration-azul';

export function SiteFooter() {
  return (
    <footer className="bg-fondo">
      <TrainTrack />

      <div className="border-t border-tinta/10">
        <div className="mx-auto flex max-w-[75rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pb-24 pt-8 text-sm text-tinta-soft md:py-8 md:pr-24">
          <span>© {new Date().getFullYear()} CreandoAndo · Juguetes de madera e imprimibles</span>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={footerLink}>
                {l.label}
              </Link>
            ))}
            <a
              href={whatsappLink('Hola, tengo una consulta sobre CreandoAndo.')}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
