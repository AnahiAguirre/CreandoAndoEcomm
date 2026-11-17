/**
 * Christmas decoration, drawn in the shop's own colors. Decoration only: hidden
 * from screen readers and never in the way of a click. Shown by the header and
 * the train while `isChristmasSeason()` says so.
 */

const BULB_COLORS = ['#d93b2b', '#2e7d46', '#f6be00', '#2d6fb0'] as const;

/** A small Santa hat, about as wide as it is tall. Sits on top of whatever it decorates. */
export function SantaHat({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 36" width={size} height={Math.round((size * 36) / 40)} aria-hidden="true" className={className}>
      <path d="M5 27 C 8 14, 17 4, 30 6 C 34 7, 37 12, 36 17 L 31 15 C 30 12, 27 11, 24 13 C 20 16, 19 22, 19 27 Z" fill="#d93b2b" />
      <rect x="2" y="25" width="22" height="8" rx="4" fill="#f5f2ec" />
      <circle cx="35" cy="19" r="4.2" fill="#f5f2ec" />
    </svg>
  );
}

const LOOP = 120; // px between pegs
const LOOPS = 24; // 2880px: wider than any screen; the SVG clips the rest
const BULB_XS = [18, 42, 66, 90]; // x of each bulb within one loop
// Height of the wire at x: the same quadratic curve each loop draws (pegs at y=3, control at y=21).
const wireY = (x: number) => 3 + 36 * (x / LOOP) * (1 - x / LOOP);

/**
 * A string of lights hanging under the header, in loops between pegs. The
 * bulbs glow on and off slowly, out of step (.xmas-bulb in globals.css; still
 * with reduced motion).
 */
export function LightGarland() {
  const loops = Array.from({ length: LOOPS }, (_, n) => n * LOOP);
  const wire = loops.map((x0) => `M${x0} 3 Q ${x0 + LOOP / 2} 21, ${x0 + LOOP} 3`).join(' ');

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full h-[22px] w-full">
      <path d={wire} fill="none" stroke="#2f4a35" strokeWidth="1.2" />
      {loops.flatMap((x0, n) =>
        BULB_XS.map((x, i) => (
          <g key={`${n}-${i}`} transform={`translate(${x0 + x} ${wireY(x)})`}>
            <rect x="-1.6" y="-0.5" width="3.2" height="2.6" rx="0.6" fill="#2f4a35" />
            <ellipse
              className="xmas-bulb"
              style={{ animationDelay: `${((n + i) % 4) * 0.9}s` }}
              cx="0"
              cy="6"
              rx="2.6"
              ry="4"
              fill={BULB_COLORS[i]}
            />
          </g>
        )),
      )}
    </svg>
  );
}
