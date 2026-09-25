import { cn } from '@/lib/utils';

/*
 * The wooden car puzzle: a board with six slots and six pieces (four body
 * pieces that interlock, two wheels). Colors are the drawing's own.
 */

const WIDTH = 600;
const HEIGHT = 620;

type Piece =
  | { kind: 'body'; path: string; color: string; origin: string }
  | { kind: 'wheel'; cx: number; cy: number; origin: string };

const PIECES: Piece[] = [
  {
    kind: 'body',
    color: '#3b8fd9',
    origin: '240px 235px',
    path: 'M150,290 L195,190 Q205,175 225,175 L300,175 L 300.0,220.5 C 310.0,228.5 322.0,206.5 332.0,212.5 C 344.0,218.5 344.0,246.5 332.0,252.5 C 322.0,258.5 310.0,236.5 300.0,244.5 L 300.0,290.0 L 237.0,290.0 C 229.0,300.0 251.0,312.0 245.0,322.0 C 239.0,334.0 211.0,334.0 205.0,322.0 C 199.0,312.0 221.0,300.0 213.0,290.0 L 150,290 Z',
  },
  {
    kind: 'body',
    color: '#f7c81e',
    origin: '375px 235px',
    path: 'M300,175 L380,175 Q400,175 410,192 L455,290 L 397.2,290.0 C 389.2,280.0 411.2,268.0 405.2,258.0 C 399.2,246.0 371.2,246.0 365.2,258.0 C 359.2,268.0 381.2,280.0 373.2,290.0 L 300,290 L 300.0,244.5 C 310.0,236.5 322.0,258.5 332.0,252.5 C 344.0,246.5 344.0,218.5 332.0,212.5 C 322.0,206.5 310.0,228.5 300.0,220.5 L 300,175 Z',
  },
  {
    kind: 'body',
    color: '#e2382b',
    origin: '200px 350px',
    path: 'M100,314 Q100,290 124,290 L150,290 L 213.0,290.0 C 221.0,300.0 199.0,312.0 205.0,322.0 C 211.0,334.0 239.0,334.0 245.0,322.0 C 251.0,312.0 229.0,300.0 237.0,290.0 L 300.0,290.0 L 300.0,338.0 C 290.0,346.0 278.0,324.0 268.0,330.0 C 256.0,336.0 256.0,364.0 268.0,370.0 C 278.0,376.0 290.0,354.0 300.0,362.0 L 300.0,410.0 L256,410 A56,56 0 0 0 144,410 L124,410 Q100,410 100,386 Z',
  },
  {
    kind: 'body',
    color: '#5cb85c',
    origin: '405px 350px',
    path: 'M300,290 L 373.2,290.0 C 381.2,280.0 359.2,268.0 365.2,258.0 C 371.2,246.0 399.2,246.0 405.2,258.0 C 411.2,268.0 389.2,280.0 397.2,290.0 L 455.0,290.0 L481,290 Q505,290 505,314 L505,386 Q505,410 481,410 L461,410 A56,56 0 0 0 349,410 L300,410 L 300.0,362.0 C 290.0,354.0 278.0,376.0 268.0,370.0 C 256.0,364.0 256.0,336.0 268.0,330.0 C 278.0,324.0 290.0,346.0 300.0,338.0 L 300,290 Z',
  },
  { kind: 'wheel', cx: 200, cy: 410, origin: '200px 410px' },
  { kind: 'wheel', cx: 405, cy: 410, origin: '405px 410px' },
];

/** The board: backdrop, street scene and the six empty slots. */
function BoardArt() {
  return (
    <>
      <rect x="0" y="12" width="600" height="600" rx="28" fill="#d9bc8e" />
      <rect x="0" y="0" width="600" height="600" rx="28" fill="#f4e4ca" />
      <path d="M30 70 Q300 50 570 80 M20 250 Q300 230 580 260 M30 560 Q300 545 570 570" stroke="#ead3ad" strokeWidth="3" fill="none" />
      <ellipse cx="150" cy="80" rx="44" ry="20" fill="#bfe1f5" />
      <ellipse cx="185" cy="70" rx="30" ry="18" fill="#bfe1f5" />
      <ellipse cx="420" cy="95" rx="40" ry="18" fill="#bfe1f5" />
      <ellipse cx="450" cy="86" rx="26" ry="16" fill="#bfe1f5" />
      <rect x="58" y="330" width="8" height="130" fill="#6b6259" />
      <rect x="44" y="230" width="36" height="104" rx="8" fill="#3a3530" />
      <circle cx="62" cy="254" r="10" fill="#e2382b" />
      <circle cx="62" cy="282" r="10" fill="#f7c81e" />
      <circle cx="62" cy="310" r="10" fill="#5cb85c" />
      <rect x="539" y="330" width="12" height="130" fill="#9a6a3a" />
      <circle cx="545" cy="310" r="36" fill="#7cc36b" />
      <rect x="0" y="458" width="600" height="96" fill="#b3b4ba" />
      <path d="M20 506 H580" stroke="#ffffff" strokeWidth="8" strokeDasharray="30 26" />
      {PIECES.map((p, i) =>
        p.kind === 'body' ? (
          <path key={i} d={p.path} fill="#c9a574" stroke="#b18c5c" strokeWidth="3" />
        ) : (
          <circle key={i} cx={p.cx} cy={p.cy} r="50" fill="#c9a574" stroke="#b18c5c" strokeWidth="3" />
        ),
      )}
    </>
  );
}

/** One piece, with its wooden edge peeking out below. */
function PieceArt({ piece }: { piece: Piece }) {
  if (piece.kind === 'wheel') {
    const { cx, cy } = piece;
    return (
      <>
        <circle cx={cx} cy={cy + 9} r="50" fill="#e3c89c" />
        <circle cx={cx} cy={cy} r="50" fill="#1f1c1a" />
        <circle cx={cx} cy={cy} r="19" fill="#eef0f6" />
        <circle cx={cx - 14} cy={cy - 22} r="6" fill="rgba(255,255,255,0.25)" />
      </>
    );
  }
  return (
    <>
      <path d={piece.path} fill="#e3c89c" transform="translate(0,9)" />
      <path d={piece.path} fill={piece.color} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
    </>
  );
}

interface Props {
  /**
   * How the pieces arrive. `drop`: they fall into place on load (hero).
   * `scatter`: they fly in with the scroll (needs `.assemble-scene` above).
   */
  motion: 'drop' | 'scatter';
}

/** Board and pieces as separate layers, so each piece can move on its own. 600×620 px. */
export function CarPuzzle({ motion }: Props) {
  return (
    <div
      role="img"
      aria-label="Rompecabezas de madera de un auto: cuatro piezas de colores y dos ruedas"
      className="relative"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} className="absolute left-0 top-0" aria-hidden="true">
        <BoardArt />
      </svg>
      {PIECES.map((piece, i) => (
        <div
          key={i}
          className={cn(
            'absolute left-0 top-0 drop-shadow-[0_10px_12px_rgb(26_23_20/0.18)]',
            motion === 'drop' ? `piece-drop piece-drop-${i}` : `puzzle-piece puzzle-piece-${i}`,
          )}
          style={{ width: WIDTH, height: HEIGHT, transformOrigin: piece.origin }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width={WIDTH}
            height={HEIGHT}
            className="absolute left-0 top-0 overflow-visible"
            aria-hidden="true"
          >
            <PieceArt piece={piece} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** The finished puzzle in a single drawing, for the catalog card. */
export function CarPuzzleArt({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={className} aria-hidden="true">
      <BoardArt />
      {PIECES.map((piece, i) => (
        <PieceArt key={i} piece={piece} />
      ))}
    </svg>
  );
}
