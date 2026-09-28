'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  id?: string;
  className: string;
  children: ReactNode;
}

/**
 * A section whose animations play once, on their own, the first time it comes
 * into view. It drives `data-play`: `idle` (hold the first frame) once hydrated,
 * `running` when a good part of it is on screen. Before hydration there is no
 * attribute at all, so without JS the drawing just shows its finished state.
 */
export function PlayOnView({ id, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    section.dataset.play = 'idle';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.play = 'running';
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
