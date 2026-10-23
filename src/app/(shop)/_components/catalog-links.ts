/**
 * Where the home's buttons lead. The slugs are the categories' slugs in the admin:
 * if one is renamed there, change it here and every button follows.
 */
export const CATALOG_LINKS = {
  todo: '/catalogo',
  rompecabezas: '/catalogo?categoria=rompecabezas',
  pistas: '/catalogo?categoria=pistas-de-madera',
  imprimibles: '/catalogo?categoria=imprimibles',
} as const;
