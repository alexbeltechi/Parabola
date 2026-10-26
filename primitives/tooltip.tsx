"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../cn";

/**
 * Parabola tooltip: a short label that appears on hover or keyboard focus,
 * drawn as a pill in the button's type (`text-p`, 36px, fully rounded, 12px
 * side padding) with no arrow. It takes the inverse colours, like a selected
 * button: a dark pill in the light theme, a light one in the dark theme.
 *
 * Wrap the control it describes: `<DsTooltip content="Filter"><DsButton … /></DsTooltip>`.
 * The child must take a ref and props (any DsButton does). A disabled button
 * fires no pointer events, so it shows no tooltip.
 */
export function DsTooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 300,
  className,
  children,
}: {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Milliseconds of hover before it appears. */
  delayDuration?: number;
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="ds-tooltip"
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              "z-(--ds-z-tooltip) flex h-9 items-center rounded-full px-3 text-p whitespace-nowrap select-none",
              "bg-ds-surface-inverse text-ds-bg backdrop-blur-[24px]",
              "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
              "data-[state=closed]:motion-safe:animate-out data-[state=closed]:motion-safe:fade-out-0 data-[state=closed]:motion-safe:zoom-out-95",
              className
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
