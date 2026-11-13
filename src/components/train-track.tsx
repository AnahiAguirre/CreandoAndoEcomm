/** A little wooden train, drawn in the shop's colors. */
function Train({ width }: { width: number }) {
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
          <Train width={s.train} />
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
