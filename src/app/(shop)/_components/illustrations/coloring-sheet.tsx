/*
 * A coloring sheet: a fish over grass, with bubbles and a star. Each area has
 * its own crayon fill under the black outline; inside `.coloring-scene` the
 * fills sweep in one by one as you scroll. Colors are the drawing's own.
 */

const FILLS = [
  { d: 'M0 372 Q75 356 150 372 T300 368 V400 H0Z', color: '#f4d58a' },
  { d: 'M60 385 Q30 320 62 250 Q88 320 60 385Z M96 385 Q120 330 92 272 Q76 336 96 385Z', color: '#5cb85c' },
  { d: 'M70 170 Q150 90 230 170 Q150 250 70 170Z', color: '#f7a23b' },
  { d: 'M230 170 L280 135 L272 170 L280 205Z', color: '#e2382b' },
  { d: 'M220 300 L230 326 L258 328 L236 345 L244 372 L220 356 L196 372 L204 345 L182 328 L210 326Z', color: '#f28cb1' },
];

const BUBBLES = [
  { cx: 70, cy: 96, r: 12 },
  { cx: 50, cy: 64, r: 8 },
  { cx: 80, cy: 40, r: 5 },
];

const layer = 'absolute left-0 top-0 size-full';

/** 420×560 px, slightly tilted like a sheet dropped on the table. */
export function ColoringSheet() {
  return (
    <div
      role="img"
      aria-label="Lámina para colorear de un pez, pintada con crayones"
      className="relative h-[560px] w-[420px] rotate-2 overflow-hidden rounded-[10px] bg-white shadow-[0_34px_60px_-30px_rgb(26_23_20/0.5),0_0_0_1px_#ece6dd]"
    >
      {FILLS.map((fill, i) => (
        <svg key={fill.d} viewBox="0 0 300 400" className={`crayon crayon-${i} ${layer}`} aria-hidden="true">
          <path d={fill.d} fill={fill.color} />
        </svg>
      ))}
      <svg viewBox="0 0 300 400" className={`crayon crayon-5 ${layer}`} aria-hidden="true">
        <g fill="#bfe1f5">
          {BUBBLES.map((b) => (
            <circle key={b.cy} {...b} />
          ))}
        </g>
      </svg>

      <svg viewBox="0 0 300 400" className={layer} aria-hidden="true">
        <g fill="none" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {FILLS.map((fill) => (
            <path key={fill.d} d={fill.d} />
          ))}
          <path d="M140 130 Q150 170 140 210" />
          {BUBBLES.map((b) => (
            <circle key={b.cy} {...b} />
          ))}
        </g>
        <circle cx="108" cy="160" r="6" fill="#1a1714" />
      </svg>
    </div>
  );
}
