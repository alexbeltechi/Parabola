"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola accordion: a title with a small chevron that folds what's under
 * it away, and at the header's right end its `actions` (a ⋮ menu). Compact:
 * a 32px header, 8px to what's under it. Accordions nest: one inside another
 * is `inset`, set in 16px from the left so it reads as part of the one above,
 * its title in the text colour where the outer one's is muted (as /parabola's
 * Colours holds Theme colour, Surface and the rest).
 */
export function DsAccordion({
  title,
  defaultOpen = true,
  actions,
  inset = false,
  className,
  contentClassName,
  children,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  /** At the header's right end, e.g. a ⋮ menu. */
  actions?: React.ReactNode;
  /** Inside another accordion: set in from the left. */
  inset?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <section data-slot="ds-accordion" className={cn("flex flex-col", inset && "pl-ds-16", className)}>
      <div className="flex h-8 items-center justify-between gap-ds-8">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "-mx-ds-8 flex min-w-0 items-center gap-ds-4 rounded-ds-control px-ds-8 text-left text-p ds-focus hover:text-ds-fg",
            inset ? "text-ds-fg" : "text-ds-fg-muted"
          )}
        >
          <span className="truncate">{title}</span>
          <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", !open && "-rotate-90")} />
        </button>
        {actions}
      </div>
      {open && (
        <div id={id} className={cn("flex flex-col gap-ds-16 pt-ds-8", contentClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}
