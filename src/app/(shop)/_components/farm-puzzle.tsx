import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

const PIECES = Array.from({ length: 9 }, (_, i) => ({ row: Math.floor(i / 3), col: i % 3 }));

/** Gap around each piece, as a % of a piece's side. */
const INSET = 2;

interface Props {
  /** What the picture shows, for screen readers. */
  label: string;
  /**
   * Start each piece scattered and let the scroll assemble it. Needs an
   * ancestor with `.assemble-scene` (the timeline the pieces follow).
   */
  scatter?: boolean;
  className?: string;
}

/**
 * The farm illustration cut into a 3×3 wooden puzzle. Every piece draws the
 * whole picture and shows only its own ninth of it, so the seams line up.
 */
export function FarmPuzzle({ label, scatter = false, className }: Props) {
  // The art spans three pieces, measured from inside the piece's inset box.
  const artSize = 300 / ((100 - INSET * 2) / 100);

  return (
    <div role="img" aria-label={label} className={cn('relative aspect-square', className)}>
      {PIECES.map(({ row, col }, i) => (
        <div
          key={i}
          className={cn(
            'absolute size-1/3',
            scatter && `puzzle-piece puzzle-piece-${i} drop-shadow-[0_18px_22px_rgb(26_23_20/0.22)]`,
          )}
          style={{ left: `${(col * 100) / 3}%`, top: `${(row * 100) / 3}%` }}
        >
          <div className="absolute overflow-hidden rounded-[9%]" style={{ inset: `${INSET}%` }}>
            <FarmArt
              className="absolute max-w-none"
              style={{
                width: `${artSize}%`,
                height: `${artSize}%`,
                left: `${-((col * 100 + INSET) / (100 - INSET * 2)) * 100}%`,
                top: `${-((row * 100 + INSET) / (100 - INSET * 2)) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FarmArt({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={className} style={style}>
      <rect width="600" height="600" className="fill-cielo" />
      <circle cx="470" cy="118" r="58" className="fill-amarillo" />
      <ellipse cx="130" cy="110" rx="70" ry="26" className="fill-white" />
      <ellipse cx="180" cy="96" rx="44" ry="24" className="fill-white" />
      <path d="M0 360 Q150 280 300 340 T600 320 V600 H0Z" className="fill-pasto" />
      <path d="M0 430 Q200 370 400 430 T600 415 V600 H0Z" className="fill-verde" />
      <polygon points="150,285 265,190 380,285" className="fill-rojo-dark" />
      <rect x="170" y="280" width="190" height="165" className="fill-rojo" />
      <rect x="248" y="222" width="34" height="34" rx="4" className="fill-amarillo" />
      <rect x="222" y="345" width="86" height="100" className="fill-hueso" />
      <path d="M222 345 L308 445 M308 345 L222 445" strokeWidth="7" className="stroke-rojo-dark" />
      <rect x="452" y="330" width="18" height="84" className="fill-tronco" />
      <circle cx="461" cy="312" r="52" className="fill-pino" />
      <circle cx="440" cy="300" r="30" className="fill-verde" />
      <rect x="0" y="478" width="600" height="10" className="fill-hueso" />
      <rect x="40" y="458" width="12" height="60" className="fill-hueso" />
      <rect x="400" y="458" width="12" height="60" className="fill-hueso" />
      <rect x="520" y="458" width="12" height="60" className="fill-hueso" />
      <ellipse cx="110" cy="520" rx="46" ry="30" className="fill-white" />
      <circle cx="160" cy="506" r="17" className="fill-tinta" />
      <rect x="84" y="540" width="9" height="24" className="fill-tinta" />
      <rect x="124" y="540" width="9" height="24" className="fill-tinta" />
    </svg>
  );
}
