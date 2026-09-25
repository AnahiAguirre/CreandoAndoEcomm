import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';

import './globals.css';

// Rounded and friendly, like the toys: Fredoka for headings, Nunito to read.
const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fredoka', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CreandoAndo', template: '%s · CreandoAndo' },
  description: 'Juguetes de madera e imprimibles para colorear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
