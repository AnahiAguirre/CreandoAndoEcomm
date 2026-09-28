'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ColoringSheet } from './illustrations/coloring-sheet';
import { pillButton } from './pill-button';

type Kind = 'juguete' | 'imprimible';

const OPTIONS: { kind: Kind; label: string }[] = [
  { kind: 'juguete', label: 'Juguete de madera' },
  { kind: 'imprimible', label: 'Imprimible en PDF' },
];

/** "¿Qué llevás hoy?": a segmented control that swaps between the two kinds of product. */
export function ProductPicker() {
  const [kind, setKind] = useState<Kind>('juguete');

  return (
    <section id="comprar" className="scroll-mt-16 bg-white px-4 py-24">
      <div className="mx-auto flex max-w-[75rem] flex-col items-center">
        <h2 className="scroll-rise text-center text-4xl font-bold md:text-[44px]">¿Qué llevás hoy?</h2>
        <p className="scroll-rise mt-2.5 text-center text-lg text-tinta-calida md:text-[17px]">
          Elegí según lo que quieras regalar o jugar.
        </p>

        <div role="group" aria-label="Tipo de producto" className="scroll-rise mt-7 flex gap-1 rounded-full bg-chip-fondo p-1">
          {OPTIONS.map((o) => (
            <button
              key={o.kind}
              type="button"
              aria-pressed={kind === o.kind}
              onClick={() => setKind(o.kind)}
              className={`min-h-11 cursor-pointer rounded-full px-6 text-[15px] font-bold transition-[background-color,color,box-shadow] duration-400 ${
                kind === o.kind
                  ? 'bg-azul text-white shadow-[0_2px_8px_rgb(45_111_176/0.3)]'
                  : 'text-tinta-medio hover:text-tinta'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {kind === 'juguete' ? (
          <div className="mt-9 grid w-full overflow-hidden rounded-3xl md:h-[400px] md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4 bg-tinta px-8 py-12 text-white md:px-14 md:py-0">
              <h3 className="text-3xl font-bold md:text-[34px]">Rompecabezas y pistas de tren</h3>
              <span className="text-[17px] leading-[1.55] text-chip-texto">
                Juguetes de madera con piezas grandes y colores vivos, para armar, desarmar y volver a armar.
              </span>
              <Link href="/#elegidos" className={`${pillButton} mt-2 self-start px-6 py-3 text-base font-bold`}>
                Ver productos de madera
              </Link>
            </div>
            <div className="relative h-[260px] w-full bg-white md:h-[400px]">
              <Image
                src="/home/rompecabezas-animales.png"
                alt="Rompecabezas de madera de animales: tigre, libélula y pez"
                fill
                sizes="(min-width: 768px) 37.5rem, 100vw"
                className="object-contain"
                style={{ transform: 'scale(1.07)' }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-9 grid w-full overflow-hidden rounded-3xl md:h-[400px] md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4 bg-tinta px-8 py-12 text-white md:px-14 md:py-0">
              <h3 className="text-3xl font-bold md:text-[34px]">Cuadernos para colorear</h3>
              <span className="text-[17px] leading-[1.55] text-chip-texto">
                PDF listo para imprimir en A4. Pagás y lo descargás al instante. Desde $2.200.
              </span>
              <a href="#imprimibles" className={`${pillButton} mt-2 self-start px-6 py-3 text-base font-bold`}>
                Ver imprimibles
              </a>
            </div>
            <div className="flex items-center justify-center overflow-hidden bg-amarillo-crema py-8 md:py-0">
              <div style={{ transform: 'rotate(-4deg) scale(0.62)' }}>
                <ColoringSheet />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
