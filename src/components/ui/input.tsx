import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-(--field-h) w-full min-w-0 rounded-lg border border-input bg-field px-3 py-1 text-base text-ellipsis text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/70 hover:border-[color-mix(in_oklch,var(--input),var(--foreground)_12%)] focus-visible:border-ring focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
