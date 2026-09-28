import type { Metadata } from 'next';
import { Nunito, Outfit } from 'next/font/google';

import './globals.css';

// Geométrica para los títulos, redonda y fácil de leer para el cuerpo — como
// pide el diseño aprobado de la tienda.
const outfit = Outfit({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-outfit', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CreandoAndo', template: '%s · CreandoAndo' },
  description: 'Juguetes de madera e imprimibles para colorear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${outfit.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
