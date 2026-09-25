/*
 * The wooden train track: a hill-shaped curve on stilts and a three-car
 * train. Colors are the drawing's own. The track's curve is repeated in
 * globals.css (`.train-car`'s offset-path, 11 px higher so the wheels sit on it).
 */

const TRACK = 'M -80 470 C 80 470 150 270 300 270 C 450 270 520 470 680 470';

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="wheel">
      <circle cx={cx} cy="76" r="13" fill="#1f1c1a" />
      <circle cx={cx} cy="76" r="5" fill="#eef0f6" />
      <rect x={cx - 1.5} y="65" width="3" height="7" fill="#eef0f6" />
    </g>
  );
}

function Wheels() {
  return (
    <>
      <Wheel cx={32} />
      <Wheel cx={88} />
    </>
  );
}

function Locomotive() {
  return (
    <>
      <rect x="8" y="46" width="104" height="26" rx="8" fill="#e2382b" />
      <rect x="8" y="46" width="104" height="6" rx="3" fill="#f06a5e" />
      <rect x="12" y="14" width="40" height="36" rx="6" fill="#3b8fd9" />
      <rect x="6" y="8" width="52" height="10" rx="5" fill="#1f5287" />
      <rect x="22" y="22" width="20" height="16" rx="4" fill="#dcebf7" />
      <rect x="62" y="26" width="42" height="22" rx="11" fill="#f7c81e" />
      <rect x="82" y="8" width="14" height="22" rx="4" fill="#1f1c1a" />
      <circle cx="110" cy="58" r="5" fill="#f7c81e" />
      <Wheels />
    </>
  );
}

function ToyWagon() {
  return (
    <>
      <rect x="8" y="40" width="104" height="32" rx="8" fill="#f7c81e" />
      <rect x="8" y="40" width="104" height="6" rx="3" fill="#fbe07a" />
      <circle cx="36" cy="30" r="12" fill="#e2382b" />
      <rect x="56" y="18" width="24" height="24" rx="5" fill="#3b8fd9" />
      <polygon points="86,40 98,16 110,40" fill="#5cb85c" />
      <Wheels />
    </>
  );
}

function LogWagon() {
  return (
    <>
      <rect x="8" y="40" width="104" height="32" rx="8" fill="#5cb85c" />
      <rect x="8" y="40" width="104" height="6" rx="3" fill="#8fd08f" />
      <rect x="20" y="22" width="80" height="20" rx="6" fill="#9a6a3a" />
      <rect x="20" y="22" width="80" height="5" rx="2" fill="#b98a58" />
      <Wheels />
    </>
  );
}

function Stilts() {
  return (
    <>
      <rect x="143" y="382" width="14" height="138" rx="3" fill="#d9bc8e" />
      <rect x="203" y="318" width="14" height="202" rx="3" fill="#d9bc8e" />
      <rect x="293" y="292" width="14" height="228" rx="3" fill="#d9bc8e" />
      <rect x="383" y="318" width="14" height="202" rx="3" fill="#d9bc8e" />
      <rect x="443" y="382" width="14" height="138" rx="3" fill="#d9bc8e" />
    </>
  );
}

/** Back to front: last car first, so the locomotive paints on top. */
const CARS = [
  { index: 2, art: <LogWagon /> },
  { index: 1, art: <ToyWagon /> },
  { index: 0, art: <Locomotive /> },
];

/**
 * The track with the train on it, 600×560 px. Inside `.track-scene` the train
 * rides the curve as you scroll; anywhere else it waits at the end of the ride.
 */
export function TrainTrack() {
  return (
    <div
      role="img"
      aria-label="Pista de tren de madera con una locomotora y dos vagones"
      className="relative h-[560px] w-[600px] overflow-hidden rounded-[28px] bg-[#eaf4fb]"
    >
      <svg viewBox="0 0 600 560" width="600" height="560" className="absolute left-0 top-0" aria-hidden="true">
        <circle cx="500" cy="96" r="40" fill="#f7c81e" />
        <ellipse cx="130" cy="90" rx="46" ry="20" fill="#ffffff" />
        <ellipse cx="166" cy="80" rx="30" ry="18" fill="#ffffff" />
        <ellipse cx="330" cy="140" rx="36" ry="16" fill="#ffffff" />
        <rect x="0" y="500" width="600" height="60" fill="#7cc36b" />
        <rect x="0" y="500" width="600" height="10" fill="#5cb85c" />
        <Stilts />
        <path d={TRACK} fill="none" stroke="#b18c5c" strokeWidth="26" transform="translate(0,3)" />
        <path d={TRACK} fill="none" stroke="#e8cda0" strokeWidth="22" />
        <path d={TRACK} fill="none" stroke="#c9a574" strokeWidth="22" strokeDasharray="3 86" />
        <path d={TRACK} fill="none" stroke="#f4e4ca" strokeWidth="4" transform="translate(0,-7)" />
      </svg>
      {CARS.map(({ index, art }) => (
        <div
          key={index}
          className={`train-car train-car-${index} absolute left-0 top-0 h-[90px] w-[120px] drop-shadow-[0_6px_6px_rgb(26_23_20/0.2)]`}
        >
          <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true">
            {art}
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Track and locomotive in a single drawing, for the catalog card. */
export function TrainTrackArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 560" className={className} aria-hidden="true">
      <rect width="600" height="560" fill="#eaf4fb" />
      <rect x="0" y="500" width="600" height="60" fill="#7cc36b" />
      <Stilts />
      <path d={TRACK} fill="none" stroke="#e8cda0" strokeWidth="22" />
      <path d={TRACK} fill="none" stroke="#c9a574" strokeWidth="22" strokeDasharray="3 86" />
      <g transform="translate(240,170) scale(1.1)">
        <Locomotive />
      </g>
    </svg>
  );
}
