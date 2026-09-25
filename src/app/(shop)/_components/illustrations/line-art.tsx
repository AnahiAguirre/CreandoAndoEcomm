/** Coloring-page drawings for the printables section: outline only, like the real sheets. */

interface Props {
  className?: string;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function FishArt({ className }: Props) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={className} {...stroke}>
      <path d="M60 150 Q140 70 220 150 Q140 230 60 150Z" />
      <path d="M220 150 L270 115 L262 150 L270 185Z" />
      <circle cx="100" cy="140" r="7" />
      <path d="M130 110 Q140 150 130 190" />
      <circle cx="60" cy="80" r="10" />
      <circle cx="40" cy="50" r="6" />
    </svg>
  );
}

export function DinoArt({ className }: Props) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={className} {...stroke}>
      <path d="M60 190 Q70 120 150 120 Q220 120 240 170 L280 200 L235 195 Q215 215 150 215 Q80 215 60 190Z" />
      <path d="M60 190 Q40 150 45 110 Q50 80 30 70" />
      <path d="M30 70 Q20 60 35 55 Q55 55 50 75" />
      <path d="M95 125 L110 95 L125 122 M130 120 L148 85 L165 120 M170 122 L190 92 L203 132" />
      <path d="M110 215 V250 M190 213 V250" />
    </svg>
  );
}

export function FlowerArt({ className }: Props) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={className} {...stroke}>
      <circle cx="150" cy="150" r="34" />
      <path d="M150 116 Q130 70 150 50 Q170 70 150 116 M184 150 Q230 130 250 150 Q230 170 184 150 M150 184 Q170 230 150 250 Q130 230 150 184 M116 150 Q70 170 50 150 Q70 130 116 150" />
      <path d="M174 126 Q205 90 230 95 Q225 120 174 126 M174 174 Q225 180 230 205 Q205 210 174 174 M126 174 Q95 210 70 205 Q75 180 126 174 M126 126 Q75 120 70 95 Q95 90 126 126" />
    </svg>
  );
}
