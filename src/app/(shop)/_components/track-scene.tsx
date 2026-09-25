import { Stage } from './illustrations/stage';
import { TrainTrack } from './illustrations/train-track';
import { StickyScene } from './sticky-scene';

/** Pistas: the train rides the track as you scroll. */
export function TrackScene() {
  return (
    <StickyScene
      id="pistas"
      className="track-scene bg-white"
      eyebrow="Pistas de tren"
      captions={[
        'Tramos de madera que encastran.',
        'Subidas, bajadas, puentes.',
        <>
          Cada día, <span className="text-azul">un recorrido nuevo.</span>
        </>,
      ]}
    >
      <Stage width={600} height={560} className="[--s:0.55] sm:[--s:0.75] md:[--s:1]">
        <TrainTrack />
      </Stage>
    </StickyScene>
  );
}
