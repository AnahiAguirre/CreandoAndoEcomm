import { PhotoPuzzle } from './photo-puzzle';

interface Props {
  imageUrl: string | null;
  label: string;
}

/**
 * A tall section with a sticky stage: while you scroll through it the pieces
 * fly in and the captions light up one by one. The section's height is the
 * length of the animation.
 */
export function AssembleScene({ imageUrl, label }: Props) {
  return (
    <section id="armar" className="assemble-scene relative h-[260svh] scroll-mt-14 bg-arena">
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-4 md:gap-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-soft md:text-sm">
              Juguetes de madera
            </p>
            <h2 className="scene-caption scene-caption-1 text-3xl font-bold leading-[1.05] tracking-[-0.035em] md:text-6xl">
              Hechos de madera.
            </h2>
            <h2 className="scene-caption scene-caption-2 text-3xl font-bold leading-[1.05] tracking-[-0.035em] md:text-6xl">
              Pensados para jugar sin pantallas.
            </h2>
            <h2 className="scene-caption scene-caption-3 text-3xl font-bold leading-[1.05] tracking-[-0.035em] md:text-6xl">
              Se arman, se desarman, <span className="text-rojo">se vuelven a armar.</span>
            </h2>
          </div>

          <PhotoPuzzle
            scatter
            imageUrl={imageUrl}
            label={label}
            className="mx-auto w-full max-w-[min(540px,42svh)] drop-shadow-[0_18px_22px_rgb(26_23_20/0.22)] md:max-w-[min(540px,70svh)]"
          />
        </div>
      </div>
    </section>
  );
}
