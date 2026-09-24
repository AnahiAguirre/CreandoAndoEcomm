'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Stagger within a group, in ms. Keep it under ~300 or it reads as lag. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Fades content in once, as it enters the viewport. One-shot on purpose:
 * re-animating on every scroll pass is what makes a site feel restless.
 * The transition itself lives in globals.css (`[data-reveal]`), so content
 * is styled correctly even before this component hydrates.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or reduced motion): show it and move on.
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.reveal = 'shown';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.style.transitionDelay = `${delay}ms`;
        node.dataset.reveal = 'shown';
        observer.disconnect();
      },
      // Fire a bit before the element is fully on screen, like Apple does:
      // by the time you look at it, it has already settled.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
