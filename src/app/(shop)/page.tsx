import { CATEGORY_SLUGS } from '@/components/nav-links';
import { coverImage, type Product } from '@/domain/catalog/product';
import { toCartProduct } from '@/components/product-card';
import { fromPrice, heroProduct, heroToys, homeShowcase } from '@/domain/catalog/storefront';
import { container } from '@/lib/container';

import { AboutTeaser } from './_components/about-teaser';
import { CategoryShop } from './_components/category-shop';
import { ClosingCta } from './_components/closing-cta';
import { HomeHero } from './_components/home-hero';
import { HowToBuy } from './_components/how-to-buy';
import { PrintablesFan } from './_components/printables-fan';
import { ProductShowcase } from './_components/product-showcase';
import { ShopHero } from './_components/shop-hero';

export const dynamic = 'force-dynamic';

/** The home's own drawings, for a product that has no photo in the catalog yet. */
const HOME_ART: Record<string, string> = {
  'pista-de-trenes-de-madera': '/home/pista-trenes.png',
  'autopista-didactica': '/home/autopista.png',
  'rompecabezas-de-animales': '/home/rompecabezas-animales.png',
};

function imageOf(product: Product): string | null {
  const cover = coverImage(product);
  return cover ? container.assetUrls.publicImageUrl(cover.storagePath) : (HOME_ART[product.slug] ?? null);
}

/**
 * The home sells: every section ends in a way to buy. Products, prices and photos
 * come from the catalog, so whatever the admin loads (and marks as featured) shows up here.
 */
export default async function HomePage() {
  const [products, categories] = await Promise.all([
    container.catalog.list.execute(),
    container.catalog.storefrontCategories.execute(),
  ]);
  const categoryId = (slug: string) => categories.find((c) => c.slug === slug)?.id;
  const prices = {
    rompecabezas: fromPrice(products, categoryId(CATEGORY_SLUGS.rompecabezas)),
    pistas: fromPrice(products, categoryId(CATEGORY_SLUGS.pistas)),
    imprimibles: fromPrice(products, categoryId(CATEGORY_SLUGS.imprimibles)),
  };
  const toys = heroToys(products);
  // Without a toy in stock there is nothing to rotate: a still hero that sells the catalog instead.
  const hero = toys.length === 0 ? heroProduct(products) : undefined;

  return (
    <>
      {toys.length > 0 ? (
        <HomeHero
          slides={toys.map((p) => {
            const img = imageOf(p);
            return {
              product: toCartProduct(p, img),
              desc: p.description || 'Elegido por profesionales de la salud para jugar sin pantallas.',
              img: img ?? '/home/logo.jpeg',
            };
          })}
        />
      ) : (
        <ShopHero product={hero} imageUrl={hero ? imageOf(hero) : null} />
      )}
      <CategoryShop prices={prices} />
      <ProductShowcase products={homeShowcase(products).map((p) => ({ product: p, imageUrl: imageOf(p) }))} />
      <PrintablesFan fromPriceCents={prices.imprimibles} />
      <HowToBuy />
      <AboutTeaser />
      <ClosingCta />
    </>
  );
}
