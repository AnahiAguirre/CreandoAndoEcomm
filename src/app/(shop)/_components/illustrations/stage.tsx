import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  /** The drawing's own size, in px. Its animations are written in these px. */
  width: number;
  height: number;
  /** Sets `--s`, the scale per breakpoint, e.g. `[--s:0.55] md:[--s:1]`. */
  className?: string;
  children: ReactNode;
}

/**
 * Draws its children at a fixed pixel size and scales the result, so the
 * scroll animations (written in px, like the design) stay exact at any width.
 * The outer box takes the scaled size, so layout around it stays honest.
 */
export function Stage({ width, height, className, children }: Props) {
  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: `calc(${width}px * var(--s, 1))`, height: `calc(${height}px * var(--s, 1))` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, scale: 'var(--s, 1)' } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
