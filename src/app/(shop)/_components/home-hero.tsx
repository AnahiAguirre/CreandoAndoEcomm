'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BuyNowButton } from '@/components/cart/buy-now-button';
import type { CartProductPublic } from '@/components/cart/types';
import { formatPrice } from '@/lib/format';

/** One toy of the carousel, from the catalog. */
export interface HeroSlide {
  product: CartProductPublic;
  /** Its description, already cut to a couple of lines. */
  desc: string;
  /** Its photo, or the home's own drawing for it. */
  img: string;
}

// Each slide's soft shape and dot take the next pair of colors, like the original design.
const COLORS = [
  { blob: '#dcebf7', dot: '#f7c81e' },
  { blob: '#e2f0dc', dot: '#3b8fd9' },
  { blob: '#fbe9c9', dot: '#e2382b' },
  { blob: '#f6e1ec', dot: '#2e7d46' },
];

const AUTOPLAY_MS = 3200;

const buyNow = 'cart-btn flex items-center justify-center gap-2 rounded-full bg-rojo font-bold text-white';
const detail = 'ghost-btn flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-ghost-borde font-bold text-azul';

interface DotsProps {
  count: number;
  slide: number;
  paused: boolean;
  onPick: (i: number) => void;
}

/** One bar per toy; the active one grows and fills up while its slide is on screen. */
function ProgressDots({ count, slide, paused, onPick }: DotsProps) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ver juguete ${i + 1}`}
          aria-pressed={i === slide}
          onClick={() => onPick(i)}
          className="flex h-11 items-center border-0 bg-transparent px-1"
        >
          <span
            className="relative h-1.5 overflow-hidden rounded-full bg-barra-fondo transition-[width] duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ width: i === slide ? 44 : 8 }}
          >
            <span
              className="absolute left-0 top-0 h-1.5 w-0 rounded-full bg-azul"
              style={{ animation: i === slide && !paused ? `progress-bar ${AUTOPLAY_MS}ms linear forwards` : 'none' }}
            />
          </span>
        </button>
      ))}
    </div>
  );
}

interface ControlsProps extends DotsProps {
  onPrev: () => void;
  onNext: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Desktop: prev/next arrows, the "01 / 03" counter, and the progress bars. */
function Controls({ count, slide, paused, onPrev, onNext, onPick }: ControlsProps) {
  const arrow = 'nav-btn flex size-11 items-center justify-center rounded-full border border-control-borde bg-white text-tinta';
  return (
    <div className="flex items-center gap-4">
      <button type="button" aria-label="Juguete anterior" onClick={onPrev} className={arrow}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button type="button" aria-label="Juguete siguiente" onClick={onNext} className={arrow}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <span className="font-display ml-1.5 min-w-[52px] text-[15px] font-semibold text-tinta-soft">
        {pad(slide + 1)} / {pad(count)}
      </span>
      <ProgressDots count={count} slide={slide} paused={paused} onPick={onPick} />
    </div>
  );
}

/**
 * Hero carousel: the toys of the catalog take turns over a soft shape that
 * morphs and picks up each one's color, with its name, price and "Comprar
 * ahora" beside it. Autoplays, pauses on hover, advances with the arrows,
 * a progress bar or a swipe. With a single toy it simply stays.
 */
export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const rotates = count > 1;

  function restart() {
    if (timer.current) clearInterval(timer.current);
    if (!rotates) return;
    timer.current = setInterval(() => {
      setDir(1);
      setSlide((s) => (s + 1) % count);
    }, AUTOPLAY_MS);
  }

  // A manual move (arrow or dot) also resets the clock, so autoplay never
  // fires right on top of something the visitor just did.
  function go(d: 1 | -1) {
    setDir(d);
    setSlide((s) => (s + d + count) % count);
    restart();
  }

  function pick(i: number) {
    setDir(i < slide ? -1 : 1);
    setSlide(i);
    restart();
  }

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!paused) restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // `restart` only reads `count`, which is fixed for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const cur = slides[slide];
  const color = COLORS[slide % COLORS.length];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-hero-fondo md:h-[660px]"
      // Only a real mouse pauses: a tap fires a synthetic mouseenter with no
      // matching leave, which would freeze autoplay on a phone for good.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
    >
      {/* Mobile: a simple stacked carousel — same state, no blob or Ken Burns.
          The buttons are the call to action, so they land on the first screen. */}
      <div className="flex flex-col items-center gap-3 px-4 pb-8 pt-4 text-center md:hidden">
        {/* No arrows on a phone: a horizontal swipe on the photo changes toy. */}
        <div
          className="relative h-[clamp(140px,28svh,300px)] w-full max-w-md touch-pan-y overflow-hidden rounded-2xl bg-white"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null || !rotates) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
        >
          <Image src={cur.img} alt={cur.product.name} fill sizes="28rem" className="object-contain" priority />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-azul">
          Elegidos por profesionales de la salud
        </span>
        <h1 className="flex min-h-[2.3em] items-center justify-center text-[28px] font-bold leading-[1.15]">
          {cur.product.name}
        </h1>
        <span className="text-sm text-tinta-soft">
          Precio <span className="font-display ml-1.5 text-lg font-bold text-tinta">{formatPrice(cur.product.priceCents)}</span>
        </span>
        <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
          <BuyNowButton product={cur.product} className={`${buyNow} h-12 min-w-[190px] flex-[1.4] px-4 text-[15px]`} />
          <Link href={`/producto/${cur.product.slug}`} className={`${detail} h-12 min-w-[120px] flex-1 px-4 text-[15px]`}>
            Ver detalle <span aria-hidden="true">&nbsp;›</span>
          </Link>
        </div>
        {rotates && <ProgressDots count={count} slide={slide} paused={paused} onPick={pick} />}
        <p className="line-clamp-3 max-w-sm text-[15px] text-tinta-calida">{cur.desc}</p>
      </div>

      {/* Desktop: copy and controls on the left, the toy on its color shape on the right. */}
      <div className="mx-auto hidden h-full max-w-[75rem] grid-cols-[1fr_1.1fr] items-center gap-10 px-4 md:grid lg:px-8">
        <div>
          <div className="relative h-[380px]">
            {slides.map((s, i) => {
              const on = i === slide;
              const prev = i === (slide - dir + count) % count;
              return (
                <div
                  key={s.product.id}
                  aria-hidden={!on}
                  className="absolute inset-x-0 top-0 flex flex-col gap-[18px] transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    opacity: on ? 1 : 0,
                    visibility: on ? 'visible' : 'hidden',
                    transform: on ? 'translateY(0)' : prev ? 'translateY(-28px)' : 'translateY(28px)',
                  }}
                >
                  <span className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-azul">
                    Elegidos por profesionales de la salud
                  </span>
                  <h1 className="line-clamp-3 font-display text-[40px] font-bold leading-[1.06] xl:text-[52px]">
                    {s.product.name}
                  </h1>
                  <p className="line-clamp-3 max-w-[440px] text-lg leading-[1.55] text-tinta-calida">{s.desc}</p>
                  <span className="text-[15px] text-tinta-soft">
                    Precio{' '}
                    <span className="font-display ml-1.5 text-2xl font-bold text-tinta">
                      {formatPrice(s.product.priceCents)}
                    </span>
                  </span>
                  <div className="flex items-center gap-3.5">
                    <BuyNowButton product={s.product} className={`${buyNow} h-[52px] px-[26px]`} />
                    <Link href={`/producto/${s.product.slug}`} className={`${detail} h-[52px] px-[22px]`}>
                      Ver detalle <span aria-hidden="true">›</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {rotates && (
            <Controls count={count} slide={slide} paused={paused} onPrev={() => go(-1)} onNext={() => go(1)} onPick={pick} />
          )}
        </div>

        <div className="relative h-[560px]">
          <div
            className="blob absolute inset-0 transition-colors duration-[900ms] ease-out"
            style={{ backgroundColor: color.blob }}
          />
          <div
            className="blob-small absolute -bottom-2 right-2 size-[150px] opacity-55 transition-colors duration-[900ms] ease-out"
            style={{ backgroundColor: color.dot }}
          />
          {slides.map((s, i) => {
            const on = i === slide;
            const prev = i === (slide - dir + count) % count;
            const side = prev ? -dir : dir;
            return (
              <div
                key={s.product.id}
                aria-hidden={!on}
                className="absolute inset-[11%] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-30px_rgb(26_23_20/0.45)] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? 'translateX(0) rotate(0deg) scale(1)' : `translateX(${side * 140}px) rotate(${side * 4}deg) scale(.9)`,
                }}
              >
                <Image
                  src={s.img}
                  alt={s.product.name}
                  fill
                  sizes="(min-width: 1200px) 520px, 45vw"
                  className="object-cover"
                  style={{ animation: on ? 'ken-burns 3.6s cubic-bezier(.28,.11,.32,1) both' : 'none', transform: 'scale(1.04)' }}
                  priority={i === 0}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
