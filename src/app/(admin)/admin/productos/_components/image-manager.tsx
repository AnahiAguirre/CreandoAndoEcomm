'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { UPLOAD_POLICY } from '@/domain/catalog/use-cases/catalog-admin';

import { removeImage } from '../actions';
import { useUpload } from './use-upload';

interface Props {
  productId: string;
  images: { id: string; url: string }[];
}

export function ImageManager({ productId, images }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, upload } = useUpload(productId, 'image');
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onRemove(imageId: string) {
    if (!confirm('¿Quitar esta foto? Se borra del storage.')) return;
    setRemoving(imageId);
    setError(null);
    const result = await removeImage(productId, imageId);
    setRemoving(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Fotos</h2>
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_POLICY.image.mimeTypes.join(',')}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = '';
          }}
        />
        <Button variant="secondary" size="sm" disabled={state.busy} onClick={() => inputRef.current?.click()}>
          {state.busy ? `Subiendo ${state.done + 1}/${state.total}…` : 'Agregar fotos'}
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-neutral-500">
          Sin fotos. JPG, PNG, WebP o AVIF, hasta {UPLOAD_POLICY.image.maxBytes / 1024 / 1024} MB. La primera es la portada.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium">
                  Portada
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                disabled={removing === img.id}
                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || (!state.busy && state.error)) && (
        <p role="alert" className="text-sm text-red-600">
          {error ?? (!state.busy ? state.error : null)}
        </p>
      )}
    </div>
  );
}
