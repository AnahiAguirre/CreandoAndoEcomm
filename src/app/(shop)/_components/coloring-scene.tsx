import { ColoringSheet } from './illustrations/coloring-sheet';
import { Stage } from './illustrations/stage';
import { StickyScene } from './sticky-scene';

/** Imprimibles: the sheet gets colored in, one area at a time, as you scroll. */
export function ColoringScene() {
  return (
    <StickyScene
      id="imprimibles"
      className="coloring-scene h-[1600px] bg-amarillo-crema"
      eyebrow="Imprimibles en PDF"
      captions={[
        'Láminas listas para imprimir.',
        'Los colores los elige cada chico.',
        <>
          ¿Terminó? <span className="text-rojo-vivo">Imprimís otra.</span>
        </>,
      ]}
    >
      <Stage width={420} height={560} className="[--s:0.6] sm:[--s:0.8] md:[--s:1]">
        <ColoringSheet />
      </Stage>
    </StickyScene>
  );
}
