import type { CartProductPublic } from '@/components/cart/types';
import { container } from '@/lib/container';

import { AssembleScene } from './_components/assemble-scene';
import { BenefitsStrip } from './_components/benefits-strip';
import { CategoryCards } from './_components/category-cards';
import { ClosingCta } from './_components/closing-cta';
import { ColoringScene } from './_components/coloring-scene';
import { FavoritesRail } from './_components/favorites-rail';
import { HomeHero } from './_components/home-hero';
import { Manifesto } from './_components/manifesto';
import { PrintablesFan } from './_components/printables-fan';
import { ProductPicker } from './_components/product-picker';
import { TrackScene } from './_components/track-scene';

/**
 * The home is a fixed, designed page: its copy, photos and illustrations come
 * from the approved design, not from the catalog. Its "Ver detalle" and
 * "Elegí…" actions are same-page anchors, exactly as the design has them.
 * Only the prices and "Agregar al carrito" buttons read the catalog, by slug.
 */
export default async function HomePage() {
  // The home's art and copy are fixed, but what its buttons sell is the real catalog.
  const products = await container.catalog.list.execute();
  const bySlug: Record<string, CartProductPublic> = Object.fromEntries(
    products.map((p) => [
      p.slug,
      { id: p.id, slug: p.slug, name: p.name, kind: p.kind, priceCents: p.priceCents, stock: p.stock, imageUrl: null },
    ]),
  );

  return (
    <>
      <HomeHero products={bySlug} />
      <CategoryCards />
      <AssembleScene />
      <TrackScene />
      <ColoringScene />
      <PrintablesFan />
      <Manifesto />
      <FavoritesRail products={bySlug} />
      <BenefitsStrip />
      <ProductPicker />
      <ClosingCta />
    </>
  );
}
