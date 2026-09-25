import Link from 'next/link';

interface Props {
  buyHref: string;
}

const link = 'text-tinta-medio transition-colors duration-300 ease-suave hover:text-tinta';

/** The home's sticky, translucent product bar, the one apple.com pins under its global nav. */
export function ProductSubnav({ buyHref }: Props) {
  return (
    <div className="sticky top-0 z-50 h-14 border-b border-tinta/12 bg-white/80 backdrop-blur-xl backdrop-saturate-[1.8]">
      <div className="mx-auto flex h-14 max-w-[70rem] items-center justify-between gap-4 px-4">
        <span className="truncate text-lg font-bold tracking-[-0.02em] md:text-xl">Rompecabezas Granja</span>
        <div className="flex shrink-0 items-center gap-5 text-[13px] md:gap-7">
          <a href="#armar" className={`${link} hidden md:inline`}>
            Resumen
          </a>
          <a href="#detalles" className={`${link} hidden md:inline`}>
            Detalles
          </a>
          <a href="#catalogo" className={`${link} hidden sm:inline`}>
            Catálogo
          </a>
          <Link
            href={buyHref}
            className="rounded-full bg-azul px-3.5 py-1.5 font-medium text-white transition-[background-color,transform] duration-300 ease-suave hover:bg-azul-dark active:scale-[0.97]"
          >
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
}
