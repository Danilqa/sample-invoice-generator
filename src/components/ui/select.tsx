import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // The value truncates with an ellipsis instead of being cut off
        'flex h-(--field-h) w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-field py-2 pr-2.5 pl-3 text-left text-base whitespace-nowrap text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 outline-none hover:border-[color-mix(in_oklch,var(--input),var(--foreground)_12%)] keyboard-focus:border-ring keyboard-focus:bg-background keyboard-focus:ring-[3px] keyboard-focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground data-[state=open]:border-ring data-[state=open]:bg-background sm:text-sm *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-150 in-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) max-w-(--radix-select-content-available-width) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl bg-popover text-popover-foreground shadow-[0_12px_32px_-8px_rgb(0_0_0/0.18),0_2px_6px_-2px_rgb(0_0_0/0.06)] ring-1 ring-foreground/[0.08] duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:shadow-[0_16px_40px_-8px_rgb(0_0_0/0.7)]',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className="p-1.5 data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  description,
  icon,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  // Secondary line under the label, e.g. account numbers
  description?: React.ReactNode;
  // Leading icon; stays in the list and is not copied into the trigger
  icon?: React.ReactNode;
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-start gap-2.5 rounded-lg py-2 pr-9 pl-2.5 text-sm select-none focus:bg-accent focus:text-accent-foreground outline-none keyboard-focus:outline-solid keyboard-focus:outline-2 keyboard-focus:-outline-offset-2 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {icon && <span className="flex h-5 items-center text-muted-foreground">{icon}</span>}
      <span className="flex min-w-0 flex-col gap-0.5">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && (
          <span data-slot="select-item-description" className="text-xs text-muted-foreground tabular-nums">
            {description}
          </span>
        )}
      </span>
      <span className="pointer-events-none absolute top-1/2 right-2.5 flex size-4 -translate-y-1/2 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1.5 my-1.5 h-px bg-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className="z-10 flex cursor-pointer items-center justify-center bg-popover py-1 text-muted-foreground"
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className="z-10 flex cursor-pointer items-center justify-center bg-popover py-1 text-muted-foreground"
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
