import { isDigital, type Product } from '@/domain/catalog/product';
import { container } from '@/lib/container';

import { AssembleScene } from './_components/assemble-scene';
import { CatalogRail } from './_components/catalog-rail';
import { ClosingCta } from './_components/closing-cta';
import { HomeHero } from './_components/home-hero';
import { Manifesto } from './_components/manifesto';
import { PrintablesFan } from './_components/printables-fan';
import { ProductPicker } from './_components/product-picker';
import { ProductSubnav } from './_components/product-subnav';

// The catalog is edited from the admin panel and must reflect changes
// immediately, so render per request. Caching comes later with tags.
export const dynamic = 'force-dynamic';

/**
 * The home is a fixed, designed page: its copy and illustrations come from the
 * approved design, not from the catalog. Only the links point at real products,
 * so every "Comprar" lands on a page that exists.
 */
export default async function HomePage() {
  const products = await container.catalog.list.execute();

  const href = (p: Product | undefined) => (p ? `/producto/${p.slug}` : '#catalogo');
  const toy = products.find((p) => !isDigital(p));
  const printables = products.filter(isDigital);
  const byName = (word: string) => printables.find((p) => p.name.toLowerCase().includes(word));
  const cheapestPrintable = [...printables].sort((a, b) => a.priceCents - b.priceCents)[0];

  return (
    <>
      <ProductSubnav buyHref={href(toy)} />
      <HomeHero buyHref={href(toy)} />
      <AssembleScene />
      <Manifesto />
      <CatalogRail
        toyHref={href(toy)}
        animalsHref={href(byName('animales'))}
        dinosaursHref={href(byName('dinosaurios'))}
      />
      <PrintablesFan />
      <ProductPicker toyHref={href(toy)} printablesHref={href(cheapestPrintable)} />
      <ClosingCta />
    </>
  );
}
