"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";

/**
 * Show more, for a long text inside a field (DsCopyField, DsTextarea with
 * `collapsible`): closed, about six lines show, fading out at the foot, and
 * nothing scrolls inside; open, the whole text sits in the page. One scroll,
 * the page's, at every width: a scroll inside a scroll is hard to work on a
 * phone. The button shows only when there's more to show.
 */

/** Closed: six lines of `text-p` (22px each). */
export const DS_SHOW_MORE_CLOSED_CLASS = "max-h-[132px] overflow-hidden ds-show-more-fade";

/** Give the text's element to `setElement` (as its `ref`); the rest says how to draw it. */
export function useDsShowMore<T extends HTMLElement>(enabled: boolean, content: unknown) {
  const [element, setElement] = React.useState<T | null>(null);
  const [open, setOpen] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!enabled || !element || open) return;
    setOverflows(element.scrollHeight > element.clientHeight + 1);
  }, [enabled, element, content, open]);
  return {
    setElement,
    element,
    open,
    toggle: () => setOpen((o) => !o),
    overflows: enabled && (overflows || open),
    closed: enabled && !open,
  };
}

export function DsShowMoreButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex items-center gap-1 rounded-ds-control text-small text-ds-fg-muted transition-colors ds-focus hover:text-ds-fg"
    >
      {open ? "Show less" : "Show more"}
      <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
    </button>
  );
}
