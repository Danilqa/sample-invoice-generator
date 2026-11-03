import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

// Mercury-style pill buttons: black primary, soft grey secondary.
// Keyboard focus gets a 2px outline with a transparent 2px gap, so it reads on any background.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-[background-color,color,opacity] duration-150 select-none outline-none keyboard-focus:outline-solid keyboard-focus:outline-2 keyboard-focus:outline-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/85',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)]',
        ghost:
          'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground aria-expanded:bg-foreground/[0.06] aria-expanded:text-foreground',
      },
      size: {
        default: 'h-10 gap-2 px-5 has-data-[icon=inline-start]:pl-4',
        sm: 'h-8 gap-1.5 px-3 text-[13px]',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
