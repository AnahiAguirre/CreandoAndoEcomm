'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface GalleryImage {
  id: string;
  url: string;
}

interface Props {
  images: GalleryImage[];
  productName: string;
}

/**
 * Horizontal carousel with a thumbnail strip, in the Apple gallery mould:
 * the photo fills the frame, scrolling snaps, and nothing bounces.
 * Native scroll-snap does the work — no carousel library, and it keeps
 * touch/trackpad momentum and keyboard scrolling for free.
 */
export function ProductGallery({ images, productName }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }, []);

  // Follow the scroll position instead of only reacting to clicks, so swiping
  // on a phone keeps the dots and thumbnails honest.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = Math.round(track.scrollLeft / track.clientWidth);
        setIndex((prev) => (prev === current ? prev : current));
      });
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') goTo(Math.min(index + 1, images.length - 1));
    if (event.key === 'ArrowLeft') goTo(Math.max(index - 1, 0));
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-madera-soft text-sm text-tinta-soft">
        Sin fotos todavía
      </div>
    );
  }

  const single = images.length === 1;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="group relative overflow-hidden rounded-2xl bg-madera-soft"
        role="region"
        aria-roledescription="carrusel"
        aria-label={`Fotos de ${productName}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((image, i) => (
            <div key={image.id} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={image.url}
                alt={`${productName} — foto ${i + 1} de ${images.length}`}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6 mix-blend-multiply transition-transform duration-700 ease-suave"
              />
            </div>
          ))}
        </div>

        {!single && (
          <>
            <Arrow side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
            <Arrow side="right" disabled={index === images.length - 1} onClick={() => goTo(index + 1)} />

            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((image, i) => (
                <span
                  key={image.id}
                  className={cn(
                    'h-1.5 rounded-full bg-tinta transition-all duration-500 ease-suave',
                    i === index ? 'w-5 opacity-70' : 'w-1.5 opacity-25',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {!single && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'relative block size-16 overflow-hidden rounded-xl bg-madera-soft ring-2 transition-all duration-500 ease-suave sm:size-20',
                  i === index ? 'ring-tinta' : 'ring-transparent opacity-60 hover:opacity-100',
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-contain p-1.5 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Arrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Foto anterior' : 'Foto siguiente'}
      className={cn(
        'absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-crema/85 text-tinta shadow-sm backdrop-blur',
        'opacity-0 transition-opacity duration-300 ease-suave group-hover:opacity-100 focus-visible:opacity-100',
        'disabled:pointer-events-none disabled:opacity-0',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
