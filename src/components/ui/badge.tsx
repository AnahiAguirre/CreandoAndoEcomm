import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const tones = {
  neutral: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-800',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
