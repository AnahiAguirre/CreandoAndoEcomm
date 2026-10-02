'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import type { AdminCategory } from '@/domain/catalog/category';

import { createCategory, deleteCategory, updateCategory, type ActionResult } from '../actions';

interface Props {
  categories: AdminCategory[];
}

/** Create, rename and delete categories from a single table. */
export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  /** Runs an action, shows its error, and refreshes the list when it worked. */
  async function run(action: () => Promise<ActionResult>): Promise<boolean> {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (await run(() => createCategory({ name: newName, slug: newSlug }))) {
      setNewName('');
      setNewSlug('');
    }
  }

  function startEdit(c: AdminCategory) {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setError(null);
  }

  async function save(id: string) {
    if (await run(() => updateCategory(id, { name, slug }))) setEditingId(null);
  }

  async function remove(c: AdminCategory) {
    const note =
      c.productCount > 0
        ? ` Sus ${c.productCount} producto${c.productCount === 1 ? '' : 's'} no se borra${c.productCount === 1 ? '' : 'n'}: quedan sin categoría.`
        : '';
    if (!window.confirm(`¿Borrar la categoría "${c.name}"?${note}`)) return;
    await run(() => deleteCategory(c.id));
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-white p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-category-name" className="text-sm font-medium">
            Nueva categoría
          </label>
          <Input
            id="new-category-name"
            placeholder="Ej: Rompecabezas"
            className="w-56"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-category-slug" className="text-sm font-medium">
            Slug (opcional)
          </label>
          <Input
            id="new-category-slug"
            placeholder="rompecabezas"
            className="w-48"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={pending || newName.trim().length < 2}>
          Agregar
        </Button>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="text-neutral-500">Todavía no hay categorías. Creá la primera.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Productos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {categories.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id} className="bg-neutral-50">
                    <td className="px-4 py-2">
                      <Input aria-label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
                    </td>
                    <td className="px-4 py-2">
                      <Input aria-label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{c.productCount}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => save(c.id)} disabled={pending}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={pending}>
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-neutral-500">/{c.slug}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.productCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => startEdit(c)} disabled={pending}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(c)} disabled={pending}>
                          Borrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
