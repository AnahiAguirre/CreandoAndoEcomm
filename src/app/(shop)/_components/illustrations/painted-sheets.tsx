import { DinoArt, FishArt, FlowerArt } from './line-art';

/*
 * The coloring-sheet drawings of the "Imprimí. Pintá. Repetí." section, with their
 * crayon colors. Same trick as ColoringSheet: each area is its own fill layer UNDER
 * the black outline from line-art.tsx (which hides any rough edge), and inside a
 * `[data-play]` block the layers sweep in one by one. `index` is the crayon's turn
 * in the whole fan (see `.fan-crayon-*` in globals.css), so the three sheets are
 * painted one after the other instead of all at once.
 */

interface Props {
  /** Width of the drawing inside its sheet, e.g. `w-[76%]`. */
  className: string;
  /** Turn of this sheet's first fill in the painting order. */
  firstTurn: number;
}

const layer = 'absolute inset-0 size-full';

function Fill({ turn, children }: { turn: number; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={`crayon fan-crayon-${turn} ${layer}`}>
      {children}
    </svg>
  );
}

export function PaintedFlower({ className, firstTurn }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Fill turn={firstTurn}>
        <g fill="#f6be00">
          <path d="M150 116 Q130 70 150 50 Q170 70 150 116Z" />
          <path d="M184 150 Q230 130 250 150 Q230 170 184 150Z" />
          <path d="M150 184 Q170 230 150 250 Q130 230 150 184Z" />
          <path d="M116 150 Q70 170 50 150 Q70 130 116 150Z" />
        </g>
      </Fill>
      <Fill turn={firstTurn + 1}>
        <g fill="#f28cb1">
          <path d="M174 126 Q205 90 230 95 Q225 120 174 126Z" />
          <path d="M126 174 Q95 210 70 205 Q75 180 126 174Z" />
        </g>
      </Fill>
      <Fill turn={firstTurn + 2}>
        <g fill="#8cc8ee">
          <path d="M174 174 Q225 180 230 205 Q205 210 174 174Z" />
          <path d="M126 126 Q75 120 70 95 Q95 90 126 126Z" />
        </g>
      </Fill>
      <Fill turn={firstTurn + 3}>
        <circle cx="150" cy="150" r="34" fill="#f7a23b" />
      </Fill>
      <FlowerArt className="relative w-full" />
    </div>
  );
}

export function PaintedFish({ className, firstTurn }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Fill turn={firstTurn}>
        <path d="M60 150 Q140 70 220 150 Q140 230 60 150Z" fill="#f7a23b" />
      </Fill>
      <Fill turn={firstTurn + 1}>
        <path d="M220 150 L270 115 L262 150 L270 185Z" fill="#e2382b" />
      </Fill>
      <Fill turn={firstTurn + 2}>
        <g fill="#bfe1f5">
          <circle cx="60" cy="80" r="10" />
          <circle cx="40" cy="50" r="6" />
        </g>
      </Fill>
      <FishArt className="relative w-full" />
    </div>
  );
}

export function PaintedDino({ className, firstTurn }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Fill turn={firstTurn}>
        <g fill="#5cb85c">
          <path d="M60 190 Q70 120 150 120 Q220 120 240 170 L280 200 L235 195 Q215 215 150 215 Q80 215 60 190Z" />
          <path d="M60 190 Q40 150 45 110 Q50 80 30 70 L50 76 Q62 100 90 124 Q66 140 60 190Z" />
          <path d="M30 70 Q20 60 35 55 Q55 55 50 75Z" />
        </g>
      </Fill>
      <Fill turn={firstTurn + 1}>
        <g fill="#f6be00">
          <path d="M95 125 L110 95 L125 122Z" />
          <path d="M130 120 L148 85 L165 120Z" />
          <path d="M170 122 L190 92 L203 132Z" />
        </g>
      </Fill>
      <DinoArt className="relative w-full" />
    </div>
  );
}
