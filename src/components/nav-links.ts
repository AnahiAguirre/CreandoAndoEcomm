/**
 * The categories' slugs in the admin. If one is renamed there, change it here and
 * every link and every "desde $X" on the site follows.
 */
export const CATEGORY_SLUGS = {
  rompecabezas: 'rompecabezas',
  pistas: 'pistas-de-madera',
  imprimibles: 'imprimibles',
} as const;

/** Where each category's products live. */
export const CATALOG_LINKS = {
  todo: '/catalogo',
  /** Every physical product, whatever its category. */
  juguetes: '/catalogo?tipo=juguetes',
  rompecabezas: `/catalogo?categoria=${CATEGORY_SLUGS.rompecabezas}`,
  pistas: `/catalogo?categoria=${CATEGORY_SLUGS.pistas}`,
  imprimibles: `/catalogo?categoria=${CATEGORY_SLUGS.imprimibles}`,
} as const;

export interface NavLink {
  href: string;
  label: string;
}

/** The header menu: each category goes straight to its products, then the info a buyer asks before paying. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: CATALOG_LINKS.juguetes, label: 'Juguetes' },
  { href: CATALOG_LINKS.imprimibles, label: 'Imprimibles' },
  { href: CATALOG_LINKS.todo, label: 'Ver todo' },
  { href: '/envios', label: 'Envíos y retiro' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
];

/** The query keys that pick a slice of the catalog. */
const FILTERS = ['categoria', 'tipo'] as const;

/**
 * Whether a menu link is the page being viewed. A catalog link matches on its
 * filters too, so "Ver todo" is not lit while "Juguetes" or a category is open.
 */
export function isActiveLink(href: string, pathname: string, search: string): boolean {
  const [path, query] = href.split('?');
  if (path !== pathname) return false;
  const wanted = new URLSearchParams(query);
  const current = new URLSearchParams(search);
  return FILTERS.every((key) => (wanted.get(key) || null) === (current.get(key) || null));
}
