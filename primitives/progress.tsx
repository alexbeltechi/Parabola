import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola progress bar: how much of something is used or done, e.g. storage
 * against a plan's limit. An 8px track, fully rounded, in a faint shade of
 * the text colour so it shows on any surface; the fill is the text colour
 * with no rounding of its own, so the track clips its left end round and its
 * right edge stays straight wherever it stops. A `meter` to assistive tech,
 * named by `label`.
 */
export function DsProgress({
  value,
  max = 100,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "role" | "children"> & {
  /** How much, out of `max`. Clamped to the range. */
  value: number;
  max?: number;
  /** What it measures, e.g. "Storage used". */
  label: string;
}) {
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  return (
    <div
      data-slot="ds-progress"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ds-fg/10", className)}
      {...props}
    >
      <div className="h-full bg-ds-fg transition-[width] duration-300" style={{ width: `${share * 100}%` }} />
    </div>
  );
}
