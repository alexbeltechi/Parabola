"use client";

import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola scroll row (Alex, 2026-10-29): one row of things (pills,
 * chips, cards) that scrolls sideways when it's wider than its place, the
 * scrollbar hidden, its edge fading out on whichever side has more, so it's
 * plain there's more to slide to. A track of taste pills is one.
 */
export function DsScrollRow({ className, children, ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [more, setMore] = React.useState({ left: false, right: false });
  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
  }, []);
  React.useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);
  // Fade 32px at an edge with more beyond it.
  const mask = `linear-gradient(to right, ${more.left ? "transparent" : "black"}, black 32px, black calc(100% - 32px), ${more.right ? "transparent" : "black"})`;
  return (
    <div
      ref={ref}
      data-slot="ds-scroll-row"
      onScroll={measure}
      className={cn("flex items-center gap-ds-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      {...props}
    >
      {children}
    </div>
  );
}
