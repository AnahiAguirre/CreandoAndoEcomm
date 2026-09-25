import Image from 'next/image';
import Link from 'next/link';

import { pillButton } from './pill-button';

interface Props {
  /** The real track's cover photo; without one, an empty frame keeps the layout. */
  imageUrl: string | null;
  buyHref: string;
}

/** After the drawing, the real thing: the track's photo, big, and a way to buy it. */
export function TrackPhoto({ imageUrl, buyHref }: Props) {
  return (
    <section className="flex flex-col items-center gap-7 bg-white px-4 pb-20 pt-5 md:h-[780px] md:pb-0">
      <div className="scroll-zoom relative aspect-[1120/620] w-full max-w-[1120px] overflow-hidden rounded-[28px] bg-foto">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Pista de tren de madera"
            fill
            sizes="(min-width: 1152px) 70rem, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-[inherit] border-2 border-dashed border-foto-borde text-tinta-soft">
            <svg
              viewBox="0 0 24 24"
              width="44"
              height="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M21 16l-5-5-8 8" />
            </svg>
          </div>
        )}
      </div>
      <div className="scroll-rise flex w-full max-w-[1120px] items-center justify-between gap-4">
        <span className="text-xl font-bold md:text-[22px]">Pista de tren de madera</span>
        <Link href={buyHref} className={`${pillButton} px-6 py-3 text-[17px] font-bold`}>
          Comprar
        </Link>
      </div>
    </section>
  );
}
