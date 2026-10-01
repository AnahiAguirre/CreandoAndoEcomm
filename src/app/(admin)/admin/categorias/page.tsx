import type { Metadata } from 'next';

import { container } from '@/lib/container';

import { CategoryManager } from './_components/category-manager';

export const metadata: Metadata = { title: 'Categorías' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await container.catalog.categories.list();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Agrupan los productos en la tienda. Al borrar una categoría, sus productos no se borran: quedan sin categoría.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </section>
  );
}
