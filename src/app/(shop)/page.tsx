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
 * "Elegí…" actions are same-page anchors, exactly as the design has them —
 * once real rompecabezas/pistas products exist, these can link to their pages.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CategoryCards />
      <AssembleScene />
      <TrackScene />
      <ColoringScene />
      <PrintablesFan />
      <Manifesto />
      <FavoritesRail />
      <BenefitsStrip />
      <ProductPicker />
      <ClosingCta />
    </>
  );
}
