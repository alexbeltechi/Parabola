"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight, CircleX } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";
import { DS_FIELD_BOX_CLASS, DS_FIELD_CLEAR_CLASS, useDsField, type DsControlProps } from "./field";
import { DS_TRAY_CLASS } from "./tray";

const WEEKDAYS = [
  { short: "Mo", long: "Monday" },
  { short: "Tu", long: "Tuesday" },
  { short: "We", long: "Wednesday" },
  { short: "Th", long: "Thursday" },
  { short: "Fr", long: "Friday" },
  { short: "Sa", long: "Saturday" },
  { short: "Su", long: "Sunday" },
];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Same day n months on, clamped to the last day of a shorter month (Jan 31 → Feb 28). */
function addMonths(d: Date, n: number) {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay));
}

// One locale for everything the picker shows or announces, matching the admin.
const LOCALE = "en-US";
const DAY_LABEL = new Intl.DateTimeFormat(LOCALE, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const SHORT = new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric", year: "numeric" });
const MONTH = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" });

/** Six Monday-first weeks covering the month of `view`. */
function monthWeeks(view: Date): Date[][] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
}

/**
 * Parabola date picker (Figma: Folio Dharmify 702:7553): a field showing the
 * date ("Today: Jan 13, 2026") with a calendar icon and a clear button, opening
 * a month calendar in a tray. Days are 36px circles in the button type: the
 * chosen day takes the selected-button colour, today the button surface.
 * Arrow keys move by day and week, Page Up/Down by month, Home/End to the
 * week's ends, Enter picks. Inside a DsField it picks up the field's id,
 * error state, required and note.
 */
export function DsDatePicker(allProps: {
  value: Date | null;
  onValueChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Force the focus look on, for previewing the state. */
  showFocus?: boolean;
} & DsControlProps) {
  const {
    value,
    onValueChange,
    placeholder = "Select date",
    disabled,
    required,
    invalid,
    showFocus,
    id,
    "aria-describedby": describedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    className,
  } = useDsField(allProps);
  const today = new Date();
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState<Date>(value ?? today);
  const gridRef = React.useRef<HTMLDivElement>(null);
  // Focus follows the focused day only when the grid has it (or the tray just
  // opened): paging months with the arrow buttons leaves focus on the button.
  const moveFocus = React.useRef(false);

  const label = value ? `${sameDay(value, today) ? "Today: " : ""}${SHORT.format(value)}` : null;

  React.useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    const key = focused.toDateString();
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus());
  }, [open, focused]);

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => addDays(focused, -((focused.getDay() + 6) % 7)),
      End: () => addDays(focused, 6 - ((focused.getDay() + 6) % 7)),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      moveFocus.current = true;
      setFocused(move());
    }
  };

  const pick = (day: Date) => {
    onValueChange(day);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setFocused(value ?? today);
          moveFocus.current = true;
        }
        setOpen(next);
      }}
    >
      <div
        data-slot="ds-date-picker"
        data-focus={showFocus || undefined}
        data-invalid={invalid || undefined}
        data-state={open ? "open" : "closed"}
        className={cn(DS_FIELD_BOX_CLASS, invalid && "border-ds-error", className)}
      >
        <Popover.Trigger
          id={id}
          disabled={disabled}
          data-field-trigger
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          className="flex min-w-0 flex-1 items-center gap-2 self-stretch text-left outline-none disabled:cursor-not-allowed"
        >
          <Calendar aria-hidden />
          <span className={cn("truncate", !label && "text-ds-fg-subtle")}>{label ?? placeholder}</span>
        </Popover.Trigger>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onValueChange(null)}
            aria-label="Clear date"
            className={cn(DS_FIELD_CLEAR_CLASS, "flex")}
          >
            <CircleX aria-hidden />
          </button>
        )}
      </div>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={6} className={cn(DS_TRAY_CLASS, "w-auto p-3")}>
          <div className="mb-2 flex items-center justify-between">
            <DsButton variant="text" iconOnly aria-label="Previous month" onClick={() => setFocused(addMonths(focused, -1))}>
              <ChevronLeft />
            </DsButton>
            <p className="text-p text-ds-fg" aria-live="polite">
              {MONTH.format(focused)}
            </p>
            <DsButton variant="text" iconOnly aria-label="Next month" onClick={() => setFocused(addMonths(focused, 1))}>
              <ChevronRight />
            </DsButton>
          </div>
          <div ref={gridRef} role="grid" aria-label={MONTH.format(focused)} onKeyDown={onGridKeyDown}>
            <div role="row" className="grid grid-cols-7">
              {WEEKDAYS.map((d) => (
                <span
                  key={d.short}
                  role="columnheader"
                  aria-label={d.long}
                  className="grid h-9 place-content-center text-small text-ds-fg-subtle"
                >
                  {d.short}
                </span>
              ))}
            </div>
            {monthWeeks(focused).map((week) => (
              <div key={week[0].toDateString()} role="row" className="grid grid-cols-7">
                {week.map((day) => {
                  const selected = value !== null && sameDay(day, value);
                  const outside = day.getMonth() !== focused.getMonth();
                  return (
                    <button
                      key={day.toDateString()}
                      type="button"
                      role="gridcell"
                      data-day={day.toDateString()}
                      tabIndex={sameDay(day, focused) ? 0 : -1}
                      aria-selected={selected}
                      aria-label={DAY_LABEL.format(day)}
                      aria-current={sameDay(day, today) ? "date" : undefined}
                      onClick={() => pick(day)}
                      className={cn(
                        "grid size-9 place-content-center rounded-ds-pill text-p transition-colors ds-focus",
                        selected
                          ? "bg-ds-surface-inverse text-ds-bg ds-hover-inverse"
                          : cn(
                              "ds-hover",
                              sameDay(day, today) && "bg-ds-surface/70",
                              outside ? "text-ds-fg-subtle" : "text-ds-fg"
                            )
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
