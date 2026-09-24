import { coverImage, isDigital, type Product } from '@/domain/catalog/product';
import { container } from '@/lib/container';
import { formatPrice } from '@/lib/format';

import { AssembleScene } from './_components/assemble-scene';
import { CatalogRail } from './_components/catalog-rail';
import { ClosingCta } from './_components/closing-cta';
import { HomeHero } from './_components/home-hero';
import { Manifesto } from './_components/manifesto';
import { PrintablesFan } from './_components/printables-fan';
import { ProductPicker } from './_components/product-picker';

// The catalog is edited from the admin panel and must reflect changes
// immediately, so render per request. Caching comes later with tags.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await container.catalog.list.execute();
  const cover = (p: Product) => {
    const image = coverImage(p);
    return image ? container.assetUrls.publicImageUrl(image.storagePath) : null;
  };

  if (products.length === 0) {
    return (
      <section className="px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Todavía no hay productos publicados</h1>
        <p className="mt-3 text-tinta-soft">Cargalos desde el panel de administración.</p>
      </section>
    );
  }

  const toys = products.filter((p) => !isDigital(p));
  const printables = products.filter(isDigital);
  // The newest toy leads the page; with no toys yet, whatever is newest.
  const featured = toys[0] ?? products[0];
  const featuredCover = cover(featured);
  const cheapestPrintable = [...printables].sort((a, b) => a.priceCents - b.priceCents)[0];

  return (
    <>
      <HomeHero product={featured} imageUrl={featuredCover} />
      <AssembleScene imageUrl={featuredCover} label={featured.name} />
      <Manifesto />
      <CatalogRail products={products} coverUrl={cover} />
      {printables.length > 0 && <PrintablesFan />}
      {cheapestPrintable && !isDigital(featured) && (
        <ProductPicker
          toy={{
            label: 'Juguete de madera',
            points: [
              { title: 'Hechos de madera', body: 'Juguetes para pasar de mano en mano.' },
              { title: 'Sin pantallas', body: 'Piezas para armar, desarmar y volver a armar.' },
            ],
            product: featured.name,
            price: formatPrice(featured.priceCents),
            cta: 'Comprar',
            href: `/producto/${featured.slug}`,
          }}
          printable={{
            label: 'Imprimible en PDF',
            points: [
              { title: 'Descarga inmediata', body: 'Pagás y el PDF queda listo para bajar.' },
              { title: 'Listo para A4', body: 'Láminas pensadas para imprimir en casa, sin ajustar nada.' },
            ],
            product: 'Cuadernos para colorear',
            price: `desde ${formatPrice(cheapestPrintable.priceCents)}`,
            cta: 'Ver imprimibles',
            href: `/producto/${cheapestPrintable.slug}`,
          }}
        />
      )}
      <ClosingCta />
    </>
  );
}
