'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Stagger within a group, in ms. Keep it under ~300 or it reads as lag. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /**
   * Fade in again every time it comes back into view (the home, where the
   * sections are a story you scroll through up and down). Off by default: in
   * lists, re-animating on every pass makes a page feel restless.
   */
  repeat?: boolean;
}

/**
 * Fades content in as it enters the viewport — once, unless `repeat`. The
 * transition itself lives in globals.css (`[data-reveal]`), so content is
 * styled correctly even before this component hydrates.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className, repeat = false }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or reduced motion): show it and move on.
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.reveal = 'shown';
      return;
    }

    const show = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry?.isIntersecting) return;
        node.style.transitionDelay = `${delay}ms`;
        node.dataset.reveal = 'shown';
        if (!repeat) show.disconnect();
      },
      // Fire a bit before the element is fully on screen, like Apple does:
      // by the time you look at it, it has already settled.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    show.observe(node);

    // Hide it again only once it is completely off screen, so it never vanishes
    // while a corner of it is still visible (the -12% margin above would do that).
    const hide = repeat
      ? new IntersectionObserver((entries) => {
          const entry = entries[entries.length - 1];
          if (!entry || entry.isIntersecting) return;
          node.style.transitionDelay = '0ms';
          node.dataset.reveal = '';
        })
      : null;
    hide?.observe(node);

    return () => {
      show.disconnect();
      hide?.disconnect();
    };
  }, [delay, repeat]);

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
