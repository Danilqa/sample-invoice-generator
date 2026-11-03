import * as React from 'react';
import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center rounded-[5px] bg-foreground/[0.06] px-1 font-sans text-[11px] leading-none font-medium text-muted-foreground tabular-nums select-none',
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
