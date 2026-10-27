import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola progress bar: how much of something is used or done, e.g. storage
 * against a plan's limit. An 8px track, fully rounded, in a faint shade of
 * the text colour so it shows on any surface; the fill is the text colour
 * with no rounding of its own, so the track clips its left end round and its
 * right edge stays straight wherever it stops. A `meter` to assistive tech,
 * named by `label` (or the title).
 *
 * Two versions: the bar alone, or, with `title` or `description`, a
 * field-like block: the title (P) with `meta` on the right (muted, e.g.
 * "0 MB of 1 GB free"), the bar, then the description underneath (Small,
 * muted), 8px apart.
 */
export function DsProgress({
  value,
  max = 100,
  label,
  title,
  meta,
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "role" | "children" | "title"> & {
  /** How much, out of `max`. Clamped to the range. */
  value: number;
  max?: number;
  /** What it measures, for assistive tech, e.g. "Storage used". Defaults to the title. */
  label?: string;
  /** A title above the bar, e.g. "Storage". */
  title?: React.ReactNode;
  /** Beside the title, on the right, e.g. "0 MB of 1 GB free". */
  meta?: React.ReactNode;
  /** A line under the bar. */
  description?: React.ReactNode;
}) {
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const name = label ?? (typeof title === "string" ? title : undefined);
  const alone = title === undefined && description === undefined;

  const bar = (
    <div
      data-slot="ds-progress"
      role="meter"
      aria-label={name}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ds-fg/10", alone && className)}
      {...(alone ? props : {})}
    >
      <div className="h-full bg-ds-fg transition-[width] duration-300" style={{ width: `${share * 100}%` }} />
    </div>
  );

  if (alone) return bar;

  return (
    <div data-slot="ds-progress-field" className={cn("flex w-full flex-col gap-2", className)} {...props}>
      {(title !== undefined || meta !== undefined) && (
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-p text-ds-fg">{title}</span>
          {meta !== undefined && <span className="text-p text-ds-fg-muted">{meta}</span>}
        </div>
      )}
      {bar}
      {description !== undefined && <p className="text-small text-ds-fg-muted">{description}</p>}
    </div>
  );
}
