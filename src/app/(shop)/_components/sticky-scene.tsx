import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { pillButton } from './pill-button';
import { PlayOnView } from './play-on-view';

interface Cta {
  label: string;
  href: string;
}

interface Props {
  id: string;
  /** Background plus the class that names the scene's timeline (`.assemble-scene`…). */
  className: string;
  eyebrow: string;
  /** Three lines that light up one after the other. */
  captions: [ReactNode, ReactNode, ReactNode];
  /** The call to action under the captions. */
  cta: Cta;
  /** The drawing on the right, animated by the same timeline. */
  children: ReactNode;
  /**
   * `scroll` (default): pinned, and the animation follows the scroll.
   * `view`: a normal section whose animation plays by itself once it comes
   * into view (see PlayOnView).
   */
  play?: 'scroll' | 'view';
}

/**
 * A tall section with a sticky stage: while you scroll through it, the
 * drawing moves and the captions light up one by one. The section's height is
 * the length of the animation — desktop only. A phone screen has no room for
 * a long pinned choreography, so below `md` this is just a normal, short
 * section: the drawing sits still in its finished state (the "regla de oro"
 * already guarantees that — see globals.css) and nothing pins or scrolls dead.
 *
 * With `play="view"` nothing pins: the section is one screen tall and the same
 * choreography runs on a clock, on every screen size, when you reach it.
 */
export function StickyScene({ id, className, eyebrow, captions, cta, children, play = 'scroll' }: Props) {
  const content = (
    <div
      className={cn(
        'flex items-center overflow-hidden py-16 md:h-[calc(100svh-4rem)] md:max-h-[820px] md:py-0',
        play === 'scroll' && 'md:sticky md:top-16',
      )}
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-6 px-4 md:grid-cols-2 md:gap-0 md:px-0">
        <div className="flex flex-col gap-3 md:gap-7 md:pr-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-tinta-soft md:text-[15px]">{eyebrow}</p>
          {captions.map((caption, i) => (
            <h2
              key={i}
              className={`scene-caption scene-caption-${i + 1} text-[26px] font-bold leading-[1.08] md:text-[48px]`}
            >
              {caption}
            </h2>
          ))}
          <a href={cta.href} className={`${pillButton} self-start text-[17px] font-bold`}>
            {cta.label}
          </a>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );

  if (play === 'view') {
    return (
      <PlayOnView id={id} className={cn('relative scroll-mt-16', className)}>
        {content}
      </PlayOnView>
    );
  }

  return (
    <section id={id} className={cn('relative scroll-mt-16 md:h-[1800px]', className)}>
      {content}
    </section>
  );
}
