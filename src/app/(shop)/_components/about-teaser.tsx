import Image from 'next/image';
import Link from 'next/link';

/** A glimpse of who is behind the shop, leading to the full story. */
export function AboutTeaser() {
  return (
    <section className="bg-arena px-4 py-16 md:py-20">
      <div className="mx-auto grid max-w-[75rem] items-center gap-8 md:grid-cols-[1fr_1.4fr]">
        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-[2rem] bg-white">
          <Image src="/home/logo.jpeg" alt="Logo de CreandoAndo" fill sizes="320px" className="object-contain p-8" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-sm">Quiénes somos</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
            Jugar también es crecer.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-tinta-medio">
            Somos profesionales de la salud. Elegimos juguetes y propuestas que, además de divertir, estimulan la
            motricidad, la atención y la imaginación de los chicos.
          </p>
          <Link href="/quienes-somos" className="mt-6 inline-block font-semibold text-azul hover:underline">
            Conocé nuestra historia <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
