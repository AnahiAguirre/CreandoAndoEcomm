import { isChristmasSeason } from '@/lib/season';

/** In season the train carries a little tree and a present, and the driver's cab wears a Santa hat. */
function ChristmasCargo() {
  return (
    <g>
      {/* tree on the green wagon */}
      <path d="M36 1 L46 12 H41 L48 21 H24 L31 12 H26 Z" fill="#1f5e33" />
      <rect x="34" y="21" width="4" height="2" fill="#8a6f45" />
      <circle cx="36" cy="2" r="2" fill="#f6be00" />
      <circle cx="32" cy="15" r="1.3" fill="#d93b2b" />
      <circle cx="41" cy="18" r="1.3" fill="#f5f2ec" />
      {/* present on the yellow wagon */}
      <rect x="96" y="9" width="20" height="13" rx="1.5" fill="#d93b2b" />
      <rect x="104.5" y="9" width="3" height="13" fill="#f5f2ec" />
      <path d="M106 9 C 100 3, 97 7, 106 9 C 115 7, 112 3, 106 9 Z" fill="#f5f2ec" />
      {/* Santa hat on the cab */}
      <path d="M147 13 C 150 4, 158 -1, 168 2 C 171 3, 173 6, 172 9 L 168 8 C 166 6, 163 6, 161 8 C 159 10, 159 12, 159 13 Z" fill="#d93b2b" />
      <rect x="145" y="11" width="30" height="5" rx="2.5" fill="#f5f2ec" />
      <circle cx="172" cy="10" r="2.6" fill="#f5f2ec" />
    </g>
  );
}

/** A little wooden train, drawn in the shop's colors. */
function Train({ width, christmas }: { width: number; christmas: boolean }) {
  return (
    <svg viewBox="0 0 230 58" width={width} height={Math.round((width * 58) / 230)} aria-hidden="true" className="block">
      {/* wagons */}
      <rect x="8" y="22" width="56" height="20" rx="3" fill="#2e7d46" />
      <rect x="78" y="22" width="56" height="20" rx="3" fill="#f6be00" />
      <rect x="64" y="38" width="14" height="3" fill="#1a1714" />
      <rect x="134" y="38" width="14" height="3" fill="#1a1714" />
      {/* locomotive: cab, boiler and chimney */}
      <rect x="148" y="12" width="26" height="30" rx="3" fill="#2d6fb0" />
      <rect x="154" y="18" width="14" height="10" rx="2" fill="#dcebf7" />
      <rect x="174" y="22" width="40" height="20" rx="4" fill="#d93b2b" />
      <rect x="198" y="12" width="9" height="12" rx="1.5" fill="#1a1714" />
      {/* wheels */}
      {[22, 52, 92, 122, 160, 200].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="46" r="6" fill="#1a1714" />
          <circle cx={cx} cy="46" r="2" fill="#f5f2ec" />
        </g>
      ))}
      {christmas && <ChristmasCargo />}
    </svg>
  );
}

const SIZES = {
  /** On the line under the home's carousel. */
  sm: { train: 112, box: 'h-[36px]', sleepers: 'h-[4px]', offset: 'bottom-[3px]', reveal: 'track-reveal-sm' },
  /** At the top of the footer. */
  md: { train: 172, box: 'h-[54px]', sleepers: 'h-[6px]', offset: 'bottom-[4px]', reveal: 'track-reveal-md' },
} as const;

interface Props {
  size?: keyof typeof SIZES;
  /** Where the track sits; its rail is its bottom edge. */
  className?: string;
}

/**
 * A wooden track the little train rides across, forever (see .train-ride in
 * globals.css; with reduced motion it stands still). The track stays put and only
 * shows around the train: it appears just ahead of it and fades out behind
 * (.track-reveal, a moving mask in step with the train). Decoration only.
 */
export function TrainTrack({ size = 'md', className = 'relative' }: Props) {
  const s = SIZES[size];
  return (
    <div aria-hidden="true" className={`${className} ${s.box} overflow-hidden`}>
      <div className={`train-ride absolute ${s.offset} left-0`}>
        <div className="train-bob">
          <Train width={s.train} christmas={isChristmasSeason()} />
        </div>
      </div>
      <div className={`track-reveal ${s.reveal} absolute inset-0`}>
        <div
          className={`absolute inset-x-0 bottom-0 ${s.sleepers} bg-[repeating-linear-gradient(90deg,#b89a6a_0_10px,transparent_10px_22px)] opacity-60`}
        />
        <div className="absolute inset-x-0 bottom-[2px] h-[2px] bg-[#8a6f45]" />
      </div>
    </div>
  );
}
