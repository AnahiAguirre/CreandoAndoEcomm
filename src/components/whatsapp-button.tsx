'use client';

import { usePathname } from 'next/navigation';

import { whatsappLink } from '@/lib/contact';

/** "pista-de-trenes" → "pista de trenes": enough to tell the shop which toy the question is about. */
function toyFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/producto\/([^/]+)/);
  return match ? decodeURIComponent(match[1]).replace(/-/g, ' ') : null;
}

/** Floating "ask us on WhatsApp" button, on every page of the shop. */
export function WhatsAppButton() {
  const toy = toyFromPath(usePathname());
  const text = toy
    ? `Hola, tengo una consulta sobre "${toy}" de CreandoAndo.`
    : 'Hola, tengo una consulta sobre CreandoAndo.';

  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)] transition-transform duration-300 ease-suave hover:scale-105 hover:text-white md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 7 3.86Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.3-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.16 1.75 2.67 4.23 3.74 1.57.68 2.19.74 2.98.62.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.28Z" />
      </svg>
    </a>
  );
}
