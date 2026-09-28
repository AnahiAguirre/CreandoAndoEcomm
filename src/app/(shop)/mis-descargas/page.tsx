import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { requireUser } from '@/lib/auth-guards';
import { container } from '@/lib/container';
import { formatBytes } from '@/lib/utils';

export const metadata: Metadata = { title: 'Mis descargas' };
export const dynamic = 'force-dynamic';

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function MyDownloadsPage() {
  const user = await requireUser('/mis-descargas');
  const items = await container.delivery.library(user.email);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">Mis descargas</h1>
      <p className="mt-2 text-tinta-medio">
        Tus imprimibles, para bajarlos cuantas veces quieras. Entrás con <strong>{user.email}</strong>.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-borde-suave bg-white p-10 text-center">
          <p className="font-semibold">Todavía no tenés imprimibles.</p>
          <p className="mt-1 text-sm text-tinta-medio">
            Cuando compres uno, aparece acá. Si te lo regalaron, fijate de entrar con el mismo email al que te llegó el
            aviso.
          </p>
          <Link
            href="/#imprimibles"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-azul px-6 font-semibold text-white hover:text-white"
          >
            Ver imprimibles
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-col gap-4 rounded-3xl border border-borde-suave bg-white p-5 sm:flex-row sm:items-start"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-elegidos-fondo">
                {item.coverPath && (
                  <Image
                    src={container.assetUrls.publicImageUrl(item.coverPath)}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-xs text-tinta-medio">Desde el {dateFormat.format(item.grantedAt)}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {item.files.map((file) => (
                    <li key={file.id}>
                      {/* A plain <a>: it's a Route Handler that redirects to the file, not a page. */}
                      <a
                        href={`/api/download/${file.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-accion-suave px-4 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-azul hover:text-white"
                      >
                        <span className="truncate">{file.filename}</span>
                        <span className="shrink-0 text-xs font-normal opacity-70">
                          PDF · {formatBytes(file.sizeBytes)} · Descargar ↓
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
