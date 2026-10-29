"use client";

import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola scroll row (Alex, 2026-10-29): one row of things (pills,
 * chips, cards) that scrolls sideways when it's wider than its place, the
 * scrollbar hidden, its edge fading out on whichever side has more, so it's
 * plain there's more to slide to. A track of taste pills is one. When the
 * item picked in it changes (`aria-pressed`, `aria-current`), from a click
 * or from elsewhere, the row slides it into view, smoothly, so a change made
 * by another control is seen (Alex, 2026-10-29).
 */
export function DsScrollRow({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [more, setMore] = React.useState({ left: false, right: false });
  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore((m) =>
      m.left === left && m.right === right ? m : { left, right },
    );
  }, []);
  React.useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);
  // The picked item into view, clear of the faded edges: at once the first time, smoothly after.
  const shown = React.useRef<Element | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    const on = el?.querySelector(
      '[aria-pressed="true"], [aria-current="page"]',
    );
    if (!el || !on || on === shown.current) return;
    const first = shown.current === null;
    shown.current = on;
    const row = el.getBoundingClientRect();
    const item = on.getBoundingClientRect();
    const by =
      item.left < row.left + 32
        ? item.left - row.left - 32
        : item.right > row.right - 32
          ? item.right - row.right + 32
          : 0;
    if (by) el.scrollBy({ left: by, behavior: first ? "auto" : "smooth" });
  });
  // Fade 32px at an edge with more beyond it.
  const mask = `linear-gradient(to right, ${more.left ? "transparent" : "black"}, black 32px, black calc(100% - 32px), ${more.right ? "transparent" : "black"})`;
  return (
    <div
      ref={ref}
      data-slot="ds-scroll-row"
      onScroll={measure}
      className={cn(
        "flex items-center gap-ds-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      {...props}
    >
      {children}
    </div>
  );
}
