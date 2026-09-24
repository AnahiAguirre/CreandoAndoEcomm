import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-full font-medium',
    'transition-[background-color,color,transform,opacity] duration-300 ease-suave',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-rojo text-white hover:bg-rojo-dark',
        secondary: 'border border-madera-dark bg-crema text-tinta hover:bg-madera-soft',
        ghost: 'text-tinta hover:bg-madera-soft',
        link: 'text-azul underline-offset-4 hover:underline',
        danger: 'bg-rojo text-white hover:bg-rojo-dark',
      },
      size: {
        sm: 'h-8 px-3.5 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
