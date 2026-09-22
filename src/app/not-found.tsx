import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">No encontramos esa página</h1>
      <Link href="/" className="mt-4 inline-block underline">
        Volver al catálogo
      </Link>
    </main>
  );
}
