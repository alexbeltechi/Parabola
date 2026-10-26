"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../cn";

/**
 * Parabola switch: the Radix primitive shadcn's Switch wraps, drawn like the
 * checkbox so the two read as one family. Off is a 2px `ds-fg-subtle` outline
 * with a `ds-fg-subtle` thumb; on fills with `ds-fg` and the thumb turns the
 * page colour. 20×32, taking clicks across 24px of height.
 */
export function DsSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="ds-switch"
      className={cn(
        "group/switch relative inline-flex h-5 w-8 shrink-0 items-center rounded-full border-2 px-0.5 transition-colors",
        "border-ds-fg-subtle data-[state=unchecked]:hover:border-ds-fg",
        "data-[state=checked]:border-transparent data-[state=checked]:bg-ds-fg",
        "after:absolute after:-inset-x-0.5 after:-inset-y-1",
        "ds-focus",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-3 rounded-full bg-ds-fg-subtle transition-[translate,background-color]",
          "group-hover/switch:data-[state=unchecked]:bg-ds-fg data-[state=checked]:translate-x-3 data-[state=checked]:bg-ds-bg"
        )}
      />
    </SwitchPrimitive.Root>
  );
}
