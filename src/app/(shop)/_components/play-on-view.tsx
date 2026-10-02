'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  className?: string;
  children: ReactNode;
}

/**
 * A block whose animations play once, on their own, the first time it comes
 * into view. It drives `data-play`: `idle` (hold the first frame) once hydrated,
 * `running` when half of it is on screen. Wrap each drawing on its own, not the
 * whole section: on a phone things stack, and a section-wide trigger would play
 * the lower drawings before anyone scrolls down to them. Before hydration there
 * is no attribute at all, so without JS the drawing just shows its finished state.
 */
export function PlayOnView({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block) return;

    block.dataset.play = 'idle';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        block.dataset.play = 'running';
        observer.disconnect();
      },
      { threshold: 0.5 },
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
