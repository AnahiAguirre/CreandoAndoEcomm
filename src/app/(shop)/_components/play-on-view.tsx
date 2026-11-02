'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  className?: string;
  children: ReactNode;
}

/**
 * A block whose animations play by themselves every time it comes into view,
 * going down the page or coming back up. It drives `data-play`:
 *   - no attribute: out of view (and before hydration), the drawing shows its
 *     finished state, so without JS nothing is lost;
 *   - `idle`: it just peeked in, the first frame is held;
 *   - `running`: half of it is on screen, the animation plays.
 * Leaving the screen removes the attribute, which throws the animation away; that
 * is what makes it start from the beginning the next time (pausing alone would
 * resume it where it stopped). Wrap each drawing on its own, not the whole
 * section: on a phone things stack, and a section-wide trigger would play the
 * lower drawings before anyone scrolls down to them.
 */
export function PlayOnView({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Several can be queued after a fast scroll; only the latest says where it is now.
        const entry = entries[entries.length - 1];
        if (!entry) return;
        const state = block.dataset.play;
        if (entry.intersectionRatio === 0) {
          // Fully out of view: forget the animation so it can start over.
          delete block.dataset.play;
        } else if (entry.intersectionRatio >= 0.5) {
          if (state === 'running') return;
          if (!state) {
            // Entered in one jump (an anchor link): show the first frame, then play.
            block.dataset.play = 'idle';
            void block.offsetWidth;
          }
          block.dataset.play = 'running';
        } else if (!state) {
          block.dataset.play = 'idle';
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(block);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
