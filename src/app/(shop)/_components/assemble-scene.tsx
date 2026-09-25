import { CarPuzzle } from './illustrations/car-puzzle';
import { Stage } from './illustrations/stage';
import { StickyScene } from './sticky-scene';

/** Rompecabezas: the car's pieces fly into the board as you scroll. */
export function AssembleScene() {
  return (
    <StickyScene
      id="armar"
      className="assemble-scene bg-arena"
      eyebrow="Juguete de madera"
      captions={[
        'Piezas grandes y gruesas.',
        'Colores vivos sobre madera.',
        <>
          Se arma, se desarma, <span className="text-rojo-vivo">se vuelve a armar.</span>
        </>,
      ]}
    >
      <Stage width={600} height={620} className="[--s:0.5] sm:[--s:0.7] md:[--s:0.9]">
        <CarPuzzle motion="scatter" />
      </Stage>
    </StickyScene>
  );
}
