import { CarPuzzle } from './illustrations/car-puzzle';
import { Stage } from './illustrations/stage';
import { StickyScene } from './sticky-scene';

/** Rompecabezas: the car's pieces fly into the board when it comes into view. */
export function AssembleScene() {
  return (
    <StickyScene
      id="armar"
      className="assemble-scene bg-arena"
      play="view"
      eyebrow="Juguete de madera"
      captions={[
        'Piezas grandes y gruesas.',
        'Colores vivos sobre madera.',
        <>
          Se arma, se desarma, <span className="text-rojo-vivo">se vuelve a armar.</span>
        </>,
      ]}
      cta={{ label: 'Elegí tu rompecabezas', href: '#elegidos' }}
    >
      <Stage width={600} height={620} className="[--s:0.5] sm:[--s:0.7] md:[--s:0.9]">
        <CarPuzzle />
      </Stage>
    </StickyScene>
  );
}
