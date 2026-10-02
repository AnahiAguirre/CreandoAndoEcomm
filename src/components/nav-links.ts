/**
 * The store's main sections. Prefixed with `/` because the header renders on
 * every page, not just the home — it has to go home first before it can scroll.
 */
export const NAV_LINKS = [
  { href: '/#armar', label: 'Rompecabezas' },
  { href: '/#pistas', label: 'Pistas' },
  { href: '/#imprimibles', label: 'Imprimibles' },
  { href: '/catalogo', label: 'Catálogo' },
] as const;
