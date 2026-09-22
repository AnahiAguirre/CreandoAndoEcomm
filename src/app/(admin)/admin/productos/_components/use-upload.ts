'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { UploadKind } from '@/domain/catalog/use-cases/catalog-admin';
import { uploadWithTicket } from '@/lib/supabase-browser';

import { confirmFileUpload, confirmImageUpload, prepareUpload } from '../actions';

type UploadState = { busy: false; error?: string } | { busy: true; current: string; done: number; total: number };

/**
 * Three-step upload shared by images and PDFs:
 *   1. ask the server for a signed ticket (validates type/size/ownership)
 *   2. PUT the file straight to Storage from the browser
 *   3. tell the server it landed so it records the row
 */
export function useUpload(productId: string, kind: UploadKind) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ busy: false });

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    for (const [i, file] of list.entries()) {
      setState({ busy: true, current: file.name, done: i, total: list.length });

      const ticket = await prepareUpload(productId, kind, {
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });
      if (!ticket.ok) return setState({ busy: false, error: `${file.name}: ${ticket.error}` });

      try {
        await uploadWithTicket(ticket.data.bucket, ticket.data.path, ticket.data.token, file);
      } catch (err) {
        return setState({ busy: false, error: `${file.name}: ${(err as Error).message}` });
      }

      const confirmed =
        kind === 'image'
          ? await confirmImageUpload(productId, ticket.data.path)
          : await confirmFileUpload(productId, ticket.data.path, file.name, file.size);
      if (!confirmed.ok) return setState({ busy: false, error: `${file.name}: ${confirmed.error}` });
    }

    setState({ busy: false });
    router.refresh();
  }

  return { state, upload };
}
