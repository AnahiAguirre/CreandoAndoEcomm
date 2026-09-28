'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Slide {
  img: string;
  alt: string;
  title: string;
  desc: string;
  /** Where "Ver detalle" goes: the category section that has this product. */
  href: string;
  /** The blob's own colors, like every illustration in the home. */
  blob: string;
  dot: string;
}

const SLIDES: Slide[] = [
  {
    img: '/home/pista-trenes.png',
    alt: 'Pista de trenes de madera en forma de ocho, con tren, figuras, árboles y señales',
    title: 'Pista de trenes didáctica',
    desc: 'Pista de madera en forma de ocho, con tren, figuras, árboles y señales para armar un pueblo entero.',
    href: '#pistas',
    blob: '#dcebf7',
    dot: '#f7c81e',
  },
  {
    img: '/home/autopista.png',
    alt: 'Autopista de madera con tapete de ciudad, puente, autos, árboles y señales',
    title: 'Autopista didáctica',
    desc: 'Tapete de ciudad con puente, autos y señales de tránsito para inventar recorridos.',
    href: '#pistas',
    blob: '#e2f0dc',
    dot: '#3b8fd9',
  },
  {
    img: '/home/rompecabezas-animales.png',
    alt: 'Rompecabezas de madera de animales: tigre, libélula y pez',
    title: 'Rompecabezas de animales',
    desc: 'Piezas grandes de madera, fáciles de agarrar. Para armar, desarmar y volver a armar.',
    href: '#armar',
    blob: '#fbe9c9',
    dot: '#e2382b',
  },
];

const AUTOPLAY_MS = 3200;

interface ControlsProps {
  slide: number;
  paused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPick: (i: number) => void;
}

/** Prev/next arrows, the "01 / 03" counter, and the progress-bar dots. Shared by the mobile and desktop layouts. */
function Controls({ slide, paused, onPrev, onNext, onPick }: ControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Producto anterior"
        onClick={onPrev}
        className="nav-btn flex size-11 items-center justify-center rounded-full border border-control-borde bg-white text-tinta"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Producto siguiente"
        onClick={onNext}
        className="nav-btn flex size-11 items-center justify-center rounded-full border border-control-borde bg-white text-tinta"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <span className="font-display ml-1.5 min-w-[52px] text-[15px] font-semibold text-tinta-soft">
        0{slide + 1} / 0{SLIDES.length}
      </span>
      <div className="flex items-center">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Ver ${s.title}`}
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
    </div>
  );
}

/**
 * Hero carousel: a big photo over a soft shape that morphs and picks up each
 * product's color, with the copy floating beside it. Autoplays, pauses on
 * hover, advances with the arrows or by picking a progress dot.
 */
export function HomeHero() {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function restart() {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setDir(1);
      setSlide((s) => (s + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  }

  // A manual move (arrow or dot) also resets the clock, so autoplay never
  // fires right on top of something the visitor just did.
  function go(d: 1 | -1) {
    setDir(d);
    setSlide((s) => (s + d + SLIDES.length) % SLIDES.length);
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
  }, [paused]);

  const cur = SLIDES[slide];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-hero-fondo md:h-[700px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mobile: the design is a fixed 1440px desktop layout, so below `md`
          it becomes a simple stacked carousel — same state, no blob or Ken Burns. */}
      <div className="flex flex-col items-center gap-5 px-4 py-12 text-center md:hidden">
        <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl bg-white">
          <Image src={cur.img} alt={cur.alt} fill sizes="24rem" className="object-contain" priority />
        </div>
        <span className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-azul">Colección de madera</span>
        <h1 className="text-4xl font-bold leading-tight">{cur.title}</h1>
        <p className="max-w-sm text-tinta-calida">{cur.desc}</p>
        <a
          href={cur.href}
          className="ghost-btn rounded-full border-[1.5px] border-ghost-borde px-6 py-3 font-bold text-azul"
        >
          Ver detalle <span aria-hidden="true">›</span>
        </a>
        <span className="text-sm text-tinta-soft">
          Precio <span className="font-display ml-1.5 text-xl font-bold text-tinta">[PRECIO]</span>
        </span>
        <Controls slide={slide} paused={paused} onPrev={() => go(-1)} onNext={() => go(1)} onPick={pick} />
      </div>

      {/* Desktop: the design's exact absolute layout, at its own 1440px scale. */}
      <div className="absolute left-[560px] top-[30px] hidden h-[640px] w-[840px] bg-hero-fondo md:block">
        <div
          className="blob absolute left-10 top-2.5 h-[620px] w-[760px] transition-colors duration-[900ms] ease-out"
          style={{ backgroundColor: cur.blob }}
        />
        <div
          className="blob-small absolute left-[620px] top-[440px] h-[170px] w-[170px] opacity-55 transition-colors duration-[900ms] ease-out"
          style={{ backgroundColor: cur.dot }}
        />
        {SLIDES.map((s, i) => {
          const on = i === slide;
          const prev = i === (slide - dir + SLIDES.length) % SLIDES.length;
          const side = prev ? -dir : dir;
          return (
            <div
              key={s.img}
              aria-hidden={!on}
              className="absolute left-0 top-0 h-[640px] w-[840px] overflow-hidden mix-blend-multiply transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'translateX(0) rotate(0deg) scale(1)' : `translateX(${side * 140}px) rotate(${side * 4}deg) scale(.9)`,
              }}
            >
              <Image
                src={s.img}
                alt={s.alt}
                fill
                sizes="840px"
                className="object-contain"
                style={{ animation: on ? 'ken-burns 3.6s cubic-bezier(.28,.11,.32,1) both' : 'none', transform: 'scale(1.04)' }}
                priority={i === 0}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute left-[120px] top-[150px] hidden h-[330px] w-[500px] md:block">
        {SLIDES.map((s, i) => {
          const on = i === slide;
          const prev = i === (slide - dir + SLIDES.length) % SLIDES.length;
          return (
            <div
              key={s.title}
              aria-hidden={!on}
              className="absolute left-0 top-0 flex w-[500px] flex-col gap-[18px] transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{
                opacity: on ? 1 : 0,
                visibility: on ? 'visible' : 'hidden',
                transform: on ? 'translateY(0)' : prev ? 'translateY(-28px)' : 'translateY(28px)',
              }}
            >
              <span className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-azul">Colección de madera</span>
              <h1 className="font-display text-[60px] font-bold leading-[1.02]">{s.title}</h1>
              <p className="max-w-[420px] text-lg leading-[1.55] text-tinta-calida">{s.desc}</p>
              <div className="mt-2 flex items-center gap-3.5">
                <a
                  href={s.href}
                  className="ghost-btn flex h-[52px] items-center gap-1.5 rounded-full border-[1.5px] border-ghost-borde px-[22px] font-bold text-azul"
                >
                  Ver detalle <span aria-hidden="true">›</span>
                </a>
              </div>
              <span className="text-[15px] text-tinta-soft">
                Precio <span className="font-display ml-1.5 text-xl font-bold text-tinta">[PRECIO]</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[120px] top-[560px] hidden md:block">
        <Controls slide={slide} paused={paused} onPrev={() => go(-1)} onNext={() => go(1)} onPick={pick} />
      </div>
    </section>
  );
}
