import { describe, expect, it } from 'vitest';

import { CATALOG_LINKS, isActiveLink } from '@/components/nav-links';

describe('isActiveLink', () => {
  it('lights the category being browsed, and only that one', () => {
    expect(isActiveLink(CATALOG_LINKS.pistas, '/catalogo', 'pistas-de-madera')).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.rompecabezas, '/catalogo', 'pistas-de-madera')).toBe(false);
    expect(isActiveLink(CATALOG_LINKS.todo, '/catalogo', 'pistas-de-madera')).toBe(false);
  });

  it('lights "Ver todo" on the unfiltered catalog', () => {
    expect(isActiveLink(CATALOG_LINKS.todo, '/catalogo', null)).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.pistas, '/catalogo', null)).toBe(false);
  });

  it('matches plain pages by path, and nothing on other pages', () => {
    expect(isActiveLink('/envios', '/envios', null)).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.todo, '/', null)).toBe(false);
    expect(isActiveLink(CATALOG_LINKS.todo, '/producto/pista', null)).toBe(false);
  });
});
