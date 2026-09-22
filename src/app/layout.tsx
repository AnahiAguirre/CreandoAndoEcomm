import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: { default: 'CreandoAndo', template: '%s · CreandoAndo' },
  description: 'Juguetes e imprimibles para colorear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
