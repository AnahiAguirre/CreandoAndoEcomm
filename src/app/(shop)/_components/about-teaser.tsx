import Image from 'next/image';
import Link from 'next/link';

/** A glimpse of who makes the toys, leading to the full story. */
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
            Hechos a mano, pieza por pieza.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-tinta-medio">
            Somos un taller chico que hace juguetes de madera pintados a mano y láminas para colorear, para que jugar
            sea tocar, armar e inventar.
          </p>
          <Link href="/quienes-somos" className="mt-6 inline-block font-semibold text-azul hover:underline">
            Conocé nuestra historia <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
