'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { type ProductKind } from '@/domain/catalog/product';
import { centsToPriceString } from '@/domain/catalog/product-input';
import type { AdminProduct } from '@/domain/catalog/product-repository';

import type { FormState } from '../actions';

interface Props {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  product?: AdminProduct;
  submitLabel: string;
}

const initial: FormState = { status: 'idle' };

export function ProductForm({ action, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [kind, setKind] = useState<ProductKind>(product?.kind ?? 'digital');
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="name" errors={errors.name} className="sm:col-span-2">
          <Input id="name" name="name" required defaultValue={product?.name} aria-invalid={Boolean(errors.name)} />
        </Field>

        <Field
          label="Slug (URL)"
          htmlFor="slug"
          hint="Dejalo vacío para generarlo desde el nombre."
          errors={errors.slug}
          className="sm:col-span-2"
        >
          <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="cuaderno-para-colorear-animales" />
        </Field>

        <Field label="Tipo" htmlFor="kind" errors={errors.kind}>
          <Select id="kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as ProductKind)}>
            <option value="digital">PDF imprimible (digital)</option>
            <option value="physical">Juguete (físico)</option>
          </Select>
        </Field>

        <Field label="Precio (ARS)" htmlFor="price" hint="Ej: 2500 o 2500,50" errors={errors.price}>
          <Input
            id="price"
            name="price"
            required
            inputMode="decimal"
            defaultValue={product ? centsToPriceString(product.priceCents) : ''}
            aria-invalid={Boolean(errors.price)}
          />
        </Field>

        <Field label="Descripción" htmlFor="description" errors={errors.description} className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={product?.description} />
        </Field>
      </div>

      {kind === 'physical' && (
        <fieldset className="grid gap-5 rounded-xl border border-black/10 p-4 sm:grid-cols-5">
          <legend className="px-1 text-sm font-medium">Stock y envío</legend>
          <Field label="Stock" htmlFor="stock" errors={errors.stock}>
            <Input id="stock" name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} />
          </Field>
          <Field label="Peso (g)" htmlFor="weightG" errors={errors.weightG}>
            <Input id="weightG" name="weightG" type="number" min={1} defaultValue={product?.weightG ?? ''} />
          </Field>
          <Field label="Largo (cm)" htmlFor="lengthCm" errors={errors.lengthCm}>
            <Input id="lengthCm" name="lengthCm" type="number" min={1} defaultValue={product?.lengthCm ?? ''} />
          </Field>
          <Field label="Ancho (cm)" htmlFor="widthCm" errors={errors.widthCm}>
            <Input id="widthCm" name="widthCm" type="number" min={1} defaultValue={product?.widthCm ?? ''} />
          </Field>
          <Field label="Alto (cm)" htmlFor="heightCm" errors={errors.heightCm}>
            <Input id="heightCm" name="heightCm" type="number" min={1} defaultValue={product?.heightCm ?? ''} />
          </Field>
        </fieldset>
      )}

      {state.status === 'error' && state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}
      {state.status === 'success' && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Guardado.
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
