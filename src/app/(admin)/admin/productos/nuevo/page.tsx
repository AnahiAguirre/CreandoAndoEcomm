import type { Metadata } from 'next';
import Link from 'next/link';

import { createProduct } from '../actions';
import { ProductForm } from '../_components/product-form';

export const metadata: Metadata = { title: 'Nuevo producto' };

export default function NewProductPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-neutral-500 hover:underline">
          ← Productos
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Nuevo producto</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Se crea como borrador. Las fotos y el PDF se cargan en el paso siguiente.
        </p>
      </div>
      <ProductForm action={createProduct} submitLabel="Crear y continuar" />
    </section>
  );
}
