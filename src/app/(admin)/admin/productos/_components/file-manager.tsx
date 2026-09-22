'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ProductFile } from '@/domain/catalog/product';
import { UPLOAD_POLICY } from '@/domain/catalog/use-cases/catalog-admin';
import { formatBytes } from '@/lib/utils';

import { removeFile } from '../actions';
import { useUpload } from './use-upload';

interface Props {
  productId: string;
  files: ProductFile[];
}

/** PDFs of a digital product. Private bucket: nothing here is a download link. */
export function FileManager({ productId, files }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, upload } = useUpload(productId, 'file');
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onRemove(fileId: string) {
    if (!confirm('¿Quitar este PDF? Se borra del storage.')) return;
    setRemoving(fileId);
    setError(null);
    const result = await removeFile(productId, fileId);
    setRemoving(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Archivos PDF</h2>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = '';
          }}
        />
        <Button variant="secondary" size="sm" disabled={state.busy} onClick={() => inputRef.current?.click()}>
          {state.busy ? `Subiendo ${state.done + 1}/${state.total}…` : 'Agregar PDF'}
        </Button>
      </div>

      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-neutral-500">
          Sin archivos. Solo PDF, hasta {UPLOAD_POLICY.file.maxBytes / 1024 / 1024} MB. Se entregan al cliente después
          del pago.
        </p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-xl border border-black/10 bg-white text-sm">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="truncate">
                <span className="font-medium">{f.filename}</span>
                <span className="ml-2 text-xs text-neutral-500">{formatBytes(f.sizeBytes)}</span>
              </span>
              <Button variant="ghost" size="sm" disabled={removing === f.id} onClick={() => onRemove(f.id)}>
                Quitar
              </Button>
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
