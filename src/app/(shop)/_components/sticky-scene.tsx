import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  id: string;
  /** Background plus the class that names the scene's timeline (`.assemble-scene`…). */
  className: string;
  eyebrow: string;
  /** Three lines that light up one after the other. */
  captions: [ReactNode, ReactNode, ReactNode];
  /** The drawing on the right, animated by the same timeline. */
  children: ReactNode;
}

/**
 * A tall section with a sticky stage: while you scroll through it, the
 * drawing moves and the captions light up one by one. The section's height is
 * the length of the animation.
 */
export function StickyScene({ id, className, eyebrow, captions, children }: Props) {
  return (
    <section id={id} className={cn('relative h-[1800px] scroll-mt-14', className)}>
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] max-h-[820px] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-6 px-4 md:grid-cols-2 md:gap-0 md:px-0">
          <div className="flex flex-col gap-3 md:gap-9 md:pr-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-tinta-soft md:text-[15px]">{eyebrow}</p>
            {captions.map((caption, i) => (
              <h2
                key={i}
                className={`scene-caption scene-caption-${i + 1} text-[28px] font-bold leading-[1.05] md:text-[56px]`}
              >
                {caption}
              </h2>
            ))}
          </div>
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </section>
  );
}
