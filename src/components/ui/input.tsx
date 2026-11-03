import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-field px-3 py-1 text-base text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 outline-none selection:bg-foreground/15 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 hover:border-[color-mix(in_oklch,var(--input),var(--foreground)_12%)] focus-visible:border-ring/70 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/[0.07] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
