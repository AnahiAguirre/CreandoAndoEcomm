import { describe, expect, it } from 'vitest';

import { CATALOG_LINKS, isActiveLink } from '@/components/nav-links';

describe('isActiveLink', () => {
  it('lights the slice of the catalog being browsed, and only that one', () => {
    expect(isActiveLink(CATALOG_LINKS.juguetes, '/catalogo', 'tipo=juguetes')).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.imprimibles, '/catalogo', 'tipo=juguetes')).toBe(false);
    expect(isActiveLink(CATALOG_LINKS.todo, '/catalogo', 'tipo=juguetes')).toBe(false);
    expect(isActiveLink(CATALOG_LINKS.imprimibles, '/catalogo', 'categoria=imprimibles')).toBe(true);
  });

  it('lights "Ver todo" on the unfiltered catalog', () => {
    expect(isActiveLink(CATALOG_LINKS.todo, '/catalogo', '')).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.juguetes, '/catalogo', '')).toBe(false);
  });

  it('matches plain pages by path, and nothing on other pages', () => {
    expect(isActiveLink('/envios', '/envios', '')).toBe(true);
    expect(isActiveLink(CATALOG_LINKS.todo, '/', '')).toBe(false);
    expect(isActiveLink(CATALOG_LINKS.todo, '/producto/pista', '')).toBe(false);
  });
});
