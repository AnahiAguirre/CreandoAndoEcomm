import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

// One neutral grotesque, like the reference sites: the photos carry the
// personality, the type just gets out of the way.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CreandoAndo', template: '%s · CreandoAndo' },
  description: 'Juguetes de madera e imprimibles para colorear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
