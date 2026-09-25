import { coverImage, isDigital, type Product } from '@/domain/catalog/product';
import { container } from '@/lib/container';
import { formatPriceShort } from '@/lib/format';

import { AssembleScene } from './_components/assemble-scene';
import { CatalogRail } from './_components/catalog-rail';
import { ClosingCta } from './_components/closing-cta';
import { ColoringScene } from './_components/coloring-scene';
import { HomeHero } from './_components/home-hero';
import { Manifesto } from './_components/manifesto';
import { PrintablesFan } from './_components/printables-fan';
import { ProductPicker } from './_components/product-picker';
import { ProductSubnav } from './_components/product-subnav';
import { TrackPhoto } from './_components/track-photo';
import { TrackScene } from './_components/track-scene';

// The catalog is edited from the admin panel and must reflect changes
// immediately, so render per request. Caching comes later with tags.
export const dynamic = 'force-dynamic';

/**
 * The home is a fixed, designed page: its copy and illustrations come from the
 * approved design, not from the catalog. The catalog only supplies what the
 * design can't know: the links, the track's photo and its price.
 */
export default async function HomePage() {
  const products = await container.catalog.list.execute();

  const href = (p: Product | undefined) => (p ? `/producto/${p.slug}` : '#catalogo');
  const named = (word: string) => products.find((p) => p.name.toLowerCase().includes(word));

  const track = products.find((p) => !isDigital(p) && p.name.toLowerCase().includes('pista'));
  const trackCover = track && coverImage(track);
  const puzzle = named('rompecabezas');
  const cheapestPrintable = products.filter(isDigital).sort((a, b) => a.priceCents - b.priceCents)[0];

  return (
    <>
      <ProductSubnav />
      <HomeHero />
      <AssembleScene />
      <TrackScene />
      <TrackPhoto
        imageUrl={trackCover ? container.assetUrls.publicImageUrl(trackCover.storagePath) : null}
        buyHref={href(track)}
      />
      <Manifesto />
      <CatalogRail
        trackHref={href(track)}
        trackPrice={track ? formatPriceShort(track.priceCents) : null}
        animalsHref={href(named('animales'))}
        dinosaursHref={href(named('dinosaurios'))}
      />
      <ColoringScene />
      <PrintablesFan />
      <ProductPicker toyHref={href(puzzle)} printablesHref={href(cheapestPrintable)} />
      <ClosingCta />
    </>
  );
}
