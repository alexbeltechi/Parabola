"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, GripVertical, Plus } from "lucide-react";
import { cn } from "../cn";
import { DsCheckboxMark } from "./checkbox";
import { DS_FIELD_BOX_CLASS, DS_FIELD_INPUT_CLASS, useDsField, type DsControlProps } from "./field";
import { DsPill } from "./pill";
import { DsMenuItemContent, DS_TRAY_CLASS, dsMenuItemVariants } from "./tray";

export type DsMultiSelectOption = { value: string; label: string };

/**
 * Parabola multi-select: pick several options, typing to filter, with an
 * optional "Create" row for new ones. The field grows to hold the choices as
 * dark pills; the options open in a tray as checkbox menu items. An ARIA
 * combobox: arrow keys move through the options, Enter picks, Backspace on an
 * empty query removes the last pill, Escape closes.
 *
 * Each pill's grip reorders it: drag it (mouse, pen or touch), or focus it
 * and use the arrow keys. Inside a DsField it picks up the field's id, error
 * state, required and note.
 */
export function DsMultiSelect(allProps: {
  options: DsMultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Offer a "Create" row for text that matches no option. */
  onCreate?: (label: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Force the focus look on, for previewing the state. */
  showFocus?: boolean;
} & DsControlProps) {
  const {
    options,
    value,
    onValueChange,
    onCreate,
    placeholder = "Add",
    disabled,
    required,
    invalid,
    showFocus,
    id,
    className,
    "aria-describedby": describedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
  } = useDsField(allProps);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [dragged, setDragged] = React.useState<number | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const trimmed = query.trim();
  const matches = options.filter((o) => o.label.toLowerCase().includes(trimmed.toLowerCase()));
  const canCreate =
    Boolean(onCreate) && trimmed !== "" && !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  const rowCount = matches.length + (canCreate ? 1 : 0);
  const activeIndex = Math.min(active, Math.max(rowCount - 1, 0));

  const toggle = (v: string) =>
    onValueChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const choose = (index: number) => {
    if (index < matches.length) toggle(matches[index].value);
    else if (canCreate) onCreate?.(trimmed);
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, rowCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && rowCount > 0) {
      e.preventDefault();
      choose(activeIndex);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      onValueChange(value.slice(0, -1));
    }
  };

  /** Moves the pill at `from` to `to`; returns false if there's nowhere to go. */
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return false;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onValueChange(next);
    return true;
  };

  const onGripKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const v = value[index];
    if (!move(index, index + step)) return;
    setAnnouncement(`${labelOf(v)} moved to position ${index + step + 1} of ${value.length}`);
    // Keep focus on the grip that moved, now in its new place.
    requestAnimationFrame(() =>
      boxRef.current?.querySelector<HTMLButtonElement>(`[data-grip="${CSS.escape(v)}"]`)?.focus()
    );
  };

  // Pointer drag: the grip captures the pointer, and whichever pill is under
  // it takes the dragged one's place. Works for mouse, pen and touch alike.
  const onGripPointerMove = (e: React.PointerEvent) => {
    if (dragged === null) return;
    const over = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-pill-index]")?.dataset.pillIndex;
    if (over === undefined) return;
    if (move(dragged, Number(over))) setDragged(Number(over));
  };

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          ref={boxRef}
          data-slot="ds-multi-select"
          data-focus={showFocus || undefined}
          data-invalid={invalid || undefined}
          data-state={open ? "open" : "closed"}
          onMouseDown={(e) => {
            // Clicks on the box (not its buttons) land in the input.
            if (disabled) return;
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.fill) {
              e.preventDefault();
              inputRef.current?.focus();
              setOpen(true);
            }
          }}
          className={cn(
            DS_FIELD_BOX_CLASS,
            "h-auto min-h-9 cursor-text items-center py-[5px] pr-3 pl-2",
            invalid && "border-ds-error",
            className
          )}
        >
          <div data-fill="true" className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {value.map((v, i) => (
              <DsPill
                key={v}
                variant="dark"
                data-pill-index={i}
                leading={
                  !disabled && (
                    <button
                      type="button"
                      data-grip={v}
                      aria-label={`Reorder ${labelOf(v)}`}
                      aria-roledescription="sortable"
                      onKeyDown={onGripKeyDown(i)}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setDragged(i);
                      }}
                      onPointerMove={onGripPointerMove}
                      onPointerUp={() => setDragged(null)}
                      onPointerCancel={() => setDragged(null)}
                      className="relative -ml-0.5 flex cursor-grab touch-none rounded-ds-sm ds-focus after:absolute after:-inset-1.5 active:cursor-grabbing"
                    >
                      <GripVertical aria-hidden />
                    </button>
                  )
                }
                onRemove={disabled ? undefined : () => onValueChange(value.filter((x) => x !== v))}
                className={cn(dragged === i && "opacity-50")}
              >
                {labelOf(v)}
              </DsPill>
            ))}
            <input
              ref={inputRef}
              id={id}
              role="combobox"
              disabled={disabled}
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={open && rowCount > 0 ? optionId(activeIndex) : undefined}
              aria-invalid={invalid || undefined}
              aria-required={required || undefined}
              aria-describedby={describedBy}
              aria-label={ariaLabel}
              aria-labelledby={labelledBy}
              value={query}
              placeholder={value.length === 0 ? placeholder : undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              className={cn(DS_FIELD_INPUT_CLASS, "h-[22px] min-w-12 px-2")}
            />
          </div>
          {!disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={open ? "Hide options" : "Show options"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen((o) => !o);
                inputRef.current?.focus();
              }}
              className="relative flex self-center text-ds-fg after:absolute after:-inset-1"
            >
              <ChevronDown aria-hidden className={cn("transition-transform", open && "rotate-180")} />
            </button>
          )}
          <span aria-live="polite" className="sr-only">
            {announcement}
          </span>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          // Focus stays in the input so typing keeps filtering.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (boxRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className={cn(DS_TRAY_CLASS, "w-(--radix-popover-trigger-width)")}
        >
          <div id={listId} role="listbox" aria-multiselectable="true">
            {matches.map((option, i) => {
              const selected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={selected}
                  data-highlighted={i === activeIndex || undefined}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={dsMenuItemVariants()}
                >
                  <DsMenuItemContent indicator={<DsCheckboxMark checked={selected} />}>
                    {option.label}
                  </DsMenuItemContent>
                </div>
              );
            })}
            {canCreate && (
              <div
                id={optionId(matches.length)}
                role="option"
                aria-selected={false}
                data-highlighted={activeIndex === matches.length || undefined}
                onMouseEnter={() => setActive(matches.length)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(matches.length)}
                className={dsMenuItemVariants({ tone: "subtle" })}
              >
                <DsMenuItemContent iconLeft={Plus}>Create “{trimmed}”</DsMenuItemContent>
              </div>
            )}
            {rowCount === 0 && (
              <p className="px-3 py-2 text-p text-ds-fg-subtle">No matches</p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
