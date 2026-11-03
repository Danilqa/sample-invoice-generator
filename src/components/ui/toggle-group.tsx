import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

// Segmented control: a grey track with the active option raised as a white pill
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(
        'flex h-(--field-h) items-stretch gap-0.5 rounded-[10px] border border-input/70 bg-secondary p-[3px] dark:bg-white/[0.03]',
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex min-w-0 items-center justify-center gap-2 rounded-[7px] px-2 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] duration-150 hover:text-foreground outline-none keyboard-focus:outline-solid keyboard-focus:outline-2 keyboard-focus:outline-offset-0 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)] dark:data-[state=on]:bg-white/[0.1] dark:data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.5)]',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
