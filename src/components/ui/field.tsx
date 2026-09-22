import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const control =
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm shadow-xs focus:border-black focus:outline-none disabled:bg-neutral-50 aria-invalid:border-red-500';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-28', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
  className?: string;
}

/** Label + control + hint/errors, wired for accessibility. */
export function Field({ label, htmlFor, hint, errors, children, className }: FieldProps) {
  const hasError = Boolean(errors?.length);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hasError ? (
        <p id={`${htmlFor}-error`} className="text-xs text-red-600">
          {errors!.join(' · ')}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}
