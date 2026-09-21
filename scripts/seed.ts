/**
 * Loads a handful of sample products so the catalog can be verified before
 * the admin panel exists (fase 2). Idempotent: re-running upserts by slug.
 *
 *   npm run db:seed
 *
 * Runs outside Next.js, so it loads .env.local itself and talks to Postgres
 * directly (no pooler needed for a one-off script).
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../src/infra/db/schema';

config({ path: '.env.local' });

const url = process.env.DATABASE_URL_DIRECT;
if (!url) throw new Error('DATABASE_URL_DIRECT is not set');

type NewProduct = typeof schema.products.$inferInsert;

const SAMPLE_PRODUCTS: NewProduct[] = [
  {
    slug: 'cuaderno-para-colorear-animales',
    name: 'Cuaderno para colorear: Animales',
    description: '20 láminas de animales en PDF listo para imprimir en A4.\nEntrega inmediata después del pago.',
    kind: 'digital',
    priceCents: 250000,
    active: true,
  },
  {
    slug: 'cuaderno-para-colorear-dinosaurios',
    name: 'Cuaderno para colorear: Dinosaurios',
    description: '16 láminas de dinosaurios en PDF, A4.',
    kind: 'digital',
    priceCents: 220000,
    active: true,
  },
  {
    slug: 'rompecabezas-de-madera-granja',
    name: 'Rompecabezas de madera: Granja',
    description: 'Rompecabezas encastrable de 9 piezas, madera pintada a mano.',
    kind: 'physical',
    priceCents: 1850000,
    active: true,
    stock: 5,
    weightG: 400,
    lengthCm: 25,
    widthCm: 25,
    heightCm: 2,
  },
  {
    slug: 'borrador-no-publicado',
    name: 'Producto en borrador (no visible)',
    description: 'Sirve para comprobar que los inactivos no aparecen en el catálogo.',
    kind: 'digital',
    priceCents: 100000,
    active: false,
  },
];

async function main() {
  const sql = postgres(url!, { max: 1 });
  const db = drizzle(sql, { schema });

  for (const product of SAMPLE_PRODUCTS) {
    const existing = await db.query.products.findFirst({ where: eq(schema.products.slug, product.slug) });
    if (existing) {
      await db.update(schema.products).set(product).where(eq(schema.products.id, existing.id));
      console.log(`updated  ${product.slug}`);
    } else {
      await db.insert(schema.products).values(product);
      console.log(`inserted ${product.slug}`);
    }
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
