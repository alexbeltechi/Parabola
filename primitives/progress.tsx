import * as React from "react";
import { cn } from "../cn";
import { DS_ACCENTS } from "../accents";
import { DsColourDot } from "./tray";

/** The accents in the order segments take them: well spread, red last so it doesn't read as a warning. */
const SEGMENT_ORDER = ["Blue", "Orange", "Green", "Violet", "Pink", "Teal", "Sky", "Stone", "Red"] as const;

/** The colour for the nth segment (or anything listed alongside one), from Parabola's accents. */
export function dsSegmentColor(index: number): string {
  const name = SEGMENT_ORDER[((index % SEGMENT_ORDER.length) + SEGMENT_ORDER.length) % SEGMENT_ORDER.length];
  return DS_ACCENTS.find((a) => a.name === name)!.value;
}

export type DsProgressSegment = {
  /** How much, in the same units as `max`. */
  value: number;
  /** Its name, for the legend and assistive tech, e.g. a project's name. */
  label: string;
  /** On the right of its legend line, e.g. "82 MB". */
  meta?: React.ReactNode;
  /** A colour of its own; by default the next of Parabola's accents. */
  color?: string;
};

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
 *
 * `segments` splits the fill into parts side by side, e.g. each project's
 * share of a storage plan, each in one of Parabola's accents (in a fixed,
 * well-spread order, so the same index keeps the same colour), with a legend
 * under the bar: a dot, the label, and its meta. `value` is then their sum.
 */
export function DsProgress({
  value,
  max = 100,
  label,
  title,
  meta,
  description,
  segments,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "role" | "children" | "title"> & {
  /** How much, out of `max`. Clamped to the range. Leave out with `segments`. */
  value?: number;
  max?: number;
  /** What it measures, for assistive tech, e.g. "Storage used". Defaults to the title. */
  label?: string;
  /** A title above the bar, e.g. "Storage". */
  title?: React.ReactNode;
  /** Beside the title, on the right, e.g. "0 MB of 1 GB free". */
  meta?: React.ReactNode;
  /** A line under the bar. */
  description?: React.ReactNode;
  /** Parts of the fill, side by side, with a legend under the bar. */
  segments?: DsProgressSegment[];
}) {
  const total = segments ? segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0) : (value ?? 0);
  const widthOf = (v: number) => (max > 0 ? Math.min(Math.max(v / max, 0), 1) * 100 : 0);
  const name = label ?? (typeof title === "string" ? title : undefined);
  const alone = title === undefined && description === undefined && segments === undefined;

  const bar = (
    <div
      data-slot="ds-progress"
      role="meter"
      aria-label={name}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(total, 0), max)}
      className={cn("flex h-2 w-full overflow-hidden rounded-full bg-ds-fg/10", alone && className)}
      {...(alone ? props : {})}
    >
      {segments ? (
        segments.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className="h-full shrink-0 transition-[width] duration-300"
            style={{ width: `${widthOf(s.value)}%`, backgroundColor: s.color ?? dsSegmentColor(i) }}
          />
        ))
      ) : (
        <div className="h-full shrink-0 bg-ds-fg transition-[width] duration-300" style={{ width: `${widthOf(total)}%` }} />
      )}
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
      {segments && segments.length > 0 && (
        <ul className="flex flex-col gap-1">
          {segments.map((s, i) => (
            <li key={`${s.label}-${i}`} className="flex items-center gap-2 text-small text-ds-fg-muted">
              <DsColourDot color={s.color ?? dsSegmentColor(i)} />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              {s.meta !== undefined && <span className="shrink-0">{s.meta}</span>}
            </li>
          ))}
        </ul>
      )}
      {description !== undefined && <p className="text-small text-ds-fg-muted">{description}</p>}
    </div>
  );
}
