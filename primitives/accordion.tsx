"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";

type DsAccordionGroupState = { open: boolean; version: number };

const DsAccordionGroupContext = React.createContext<DsAccordionGroupState | null>(null);

/**
 * Opens or folds every accordion under it at once: each time `version`
 * changes, they all take `open` (a page's Collapse all / Expand all).
 * Between times each opens and folds on its own.
 */
export function DsAccordionGroup({ open, version, children }: DsAccordionGroupState & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ open, version }), [open, version]);
  return <DsAccordionGroupContext.Provider value={value}>{children}</DsAccordionGroupContext.Provider>;
}

/**
 * Parabola accordion: a title with a small chevron that folds what's under
 * it away, and at the header's right end its `actions` (a ⋮ menu). Compact:
 * a 32px header, then what's under it 8px down, lined up with the title
 * (no indent; Alex, 2026-10-29). Accordions nest: one inside
 * another is `inset`, its title in the text colour where the outer one's is muted (as /parabola's
 * Colours holds Theme colour, Surface and the rest). Under a
 * DsAccordionGroup they all open or fold at once when the group says so.
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
  /** Inside another accordion: its title in the text colour. */
  inset?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  // The group said open all or fold all: follow it, once.
  const group = React.useContext(DsAccordionGroupContext);
  const [seen, setSeen] = React.useState(group?.version);
  if (group && group.version !== seen) {
    setSeen(group.version);
    setOpen(group.open);
  }
  return (
    <section data-slot="ds-accordion" className={cn("flex flex-col", className)}>
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
