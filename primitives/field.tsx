"use client";

import * as React from "react";
import { CircleX, Search, type LucideIcon } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola fields, the style used by the
 * admin post editor: 2px `ds-field-border` outline (the border, or drawn
 * from a field colour of its own), 16px radius, `text-p` with a
 * `ds-fg-subtle` placeholder; while you're in it the outline turns the
 * Parabola focus colour. `invalid` turns it `ds-error` instead (DsField sets
 * it for you). The box is filled with solid `ds-field`, a step darker than
 * `ds-surface-subtle` so it still reads on a card, and solid so a field
 * pinned in a floating bar (see ds-nav-fade) hides what scrolls beneath it. Disabled keeps the
 * box and greys its contents. Always 36px
 * tall, the same as a button, however its contents change; only multi-line
 * fields (textarea, multi-select) grow. The standard field width
 * (DS_FIELD_WIDTH_CLASS) on its own; inside a DsField it fills the field,
 * which carries the width instead.
 *
 * Small (`size="small"`): the mini field, the small button's size: 24px
 * tall, its corners (`rounded-ds-control`), `text-small`, 8px sides, for
 * dense rows of numbers and codes (a colour's hue, its hex). A DsField of
 * that size has a small label to match.
 *
 * DS_FIELD_BOX_CLASS is exported so every field-shaped control (select and
 * date triggers, multi-select) draws the same box, and DS_FIELD_INVALID_CLASS
 * its error outline, always 2px, so it shows even in a theme whose fields
 * have no outline.
 */
export const DS_FIELD_WIDTH_CLASS = "w-(--ds-field-width) max-w-full";

export const DS_FIELD_INVALID_CLASS = "border-2 border-ds-error";

// The outline's thickness is the theme's (`--ds-field-border-width`, 2px by default, 0 with the outline off).
export const DS_FIELD_BOX_CLASS = [
  `group flex h-9 ${DS_FIELD_WIDTH_CLASS} items-center gap-2 rounded-ds-lg border-[length:var(--ds-field-border-width)] border-ds-field-border bg-ds-field px-4`,
  "transition-colors ds-focus-within",
  "text-p text-ds-fg",
  "disabled:cursor-not-allowed disabled:text-ds-fg-subtle has-[:disabled]:cursor-not-allowed has-[:disabled]:text-ds-fg-subtle",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

/** The small field's box, laid over DS_FIELD_BOX_CLASS: the small button's height, corners, type and sides. */
export const DS_FIELD_SMALL_CLASS = "h-6 gap-1 rounded-ds-control px-2 text-small";

/**
 * A form's fields: left-aligned at the standard width, side by side, wrapping
 * onto new rows as the form narrows, never stretched to fill a row. A field
 * that should fill the row (a long text, a list of files) takes `w-full` on
 * its DsField and gets a row to itself.
 */
export const DS_FIELDS_CLASS = "flex flex-wrap items-start gap-ds-20";

/**
 * The `bare` look: no box at all, just the text on the page, for writing
 * surfaces such as post blocks, where
 * the field should read as part of the page. Same type as the boxed field.
 */
export const DS_FIELD_BARE_CLASS = "flex w-full items-center gap-2 text-p text-ds-fg [&_svg]:size-4 [&_svg]:shrink-0";

export const DS_FIELD_INPUT_CLASS =
  "min-w-0 flex-1 bg-transparent outline-none placeholder:text-ds-fg-subtle disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none";

/** The clear (ⓧ) button inside a field: 20px, taking clicks across 24px. */
export const DS_FIELD_CLEAR_CLASS =
  "relative -mr-1 size-5 items-center justify-center rounded-ds-control text-ds-fg transition-opacity ds-focus after:absolute after:-inset-0.5 hover:opacity-70";

type DsFieldContextValue = {
  id: string;
  invalid: boolean;
  required: boolean;
  describedBy?: string;
};

const DsFieldContext = React.createContext<DsFieldContextValue | null>(null);

type DsFieldControlProps = {
  id?: string;
  className?: string;
  invalid?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
};

/**
 * What every field-shaped control (select, date picker, multi-select) takes
 * and hands to its focusable element, so it can be named without a DsField
 * (e.g. a filter in a toolbar) and laid out from outside.
 */
export type DsControlProps = {
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

/**
 * For field-shaped controls: folds in what an enclosing DsField supplies (the
 * id its label points at, its error state, required, and the note under it)
 * so the control needs no wiring, and fills the field (`w-full`, before the
 * control's own `className`). Outside a DsField the props pass through.
 */
export function useDsField<P extends DsFieldControlProps>(props: P): P {
  const field = React.useContext(DsFieldContext);
  if (!field) return props;
  const describedBy = [field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ");
  return {
    ...props,
    className: cn("w-full", props.className),
    id: field.id,
    invalid: field.invalid || props.invalid,
    required: field.required || props.required,
    "aria-describedby": describedBy || undefined,
  };
}

type DsInputOwnProps = {
  /** Icon before the text, e.g. a calendar or search glass. */
  iconLeft?: LucideIcon;
  /** Icon after the text, e.g. a chevron on a picker. */
  iconRight?: LucideIcon;
  /** Small trailing text such as a count: `text-small`, subtle. */
  meta?: React.ReactNode;
  /** Adds a clear button, shown only while the field is focused and has text. */
  clearable?: boolean;
  /** Called when the clear button empties the field; implies `clearable`. */
  onClear?: () => void;
  /** Force the focus look on, for previewing the state. */
  showFocus?: boolean;
  /** Error state: red outline, and `aria-invalid` on the input. */
  invalid?: boolean;
  /** No box: the text sits directly on the page. See DS_FIELD_BARE_CLASS. */
  bare?: boolean;
  /** Small: the mini field, the small button's size (DS_FIELD_SMALL_CLASS). */
  size?: "default" | "small";
};

export type DsInputProps = DsInputOwnProps &
  Omit<React.ComponentProps<"input">, keyof DsInputOwnProps>;

export function DsInput({ ref, ...fieldProps }: DsInputProps) {
  const {
    iconLeft: IconLeft,
    iconRight: IconRight,
    meta,
    clearable,
    onClear,
    showFocus,
    invalid,
    bare,
    size = "default",
    className,
    onChange,
    ...props
  } = useDsField(fieldProps);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const controlled = props.value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = React.useState(
    () => props.defaultValue != null && String(props.defaultValue) !== ""
  );
  const hasValue = controlled ? String(props.value) !== "" : uncontrolledHasValue;

  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const clear = () => {
    if (!controlled && inputRef.current) {
      inputRef.current.value = "";
      setUncontrolledHasValue(false);
    }
    onClear?.();
    // The button disappears with the text, so hand focus back to the input.
    inputRef.current?.focus();
  };

  return (
    <div
      data-slot="ds-input"
      data-focus={showFocus || undefined}
      data-invalid={invalid || undefined}
      className={cn(
        bare ? DS_FIELD_BARE_CLASS : [DS_FIELD_BOX_CLASS, size === "small" && DS_FIELD_SMALL_CLASS, invalid && DS_FIELD_INVALID_CLASS],
        className
      )}
    >
      {IconLeft && <IconLeft aria-hidden />}
      <input
        ref={setRef}
        className={DS_FIELD_INPUT_CLASS}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          if (!controlled) setUncontrolledHasValue(e.target.value !== "");
          onChange?.(e);
        }}
        {...props}
      />
      {meta != null && <span className="text-small text-ds-fg-subtle">{meta}</span>}
      {(clearable || onClear) && hasValue && (
        <button
          type="button"
          // Keep focus in the input on click; otherwise the field blurs, the
          // button hides, and the click never lands.
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          aria-label="Clear"
          className={cn(DS_FIELD_CLEAR_CLASS, "hidden group-focus-within:flex group-data-[focus]:flex")}
        >
          <CircleX aria-hidden />
        </button>
      )}
      {IconRight && <IconRight aria-hidden />}
    </div>
  );
}

/**
 * Parabola number field: a DsInput for a whole number, as fields with numbers
 * behave everywhere: the up and down arrows step it (Shift for steps of 10),
 * kept between `min` and `max` (or, with `wrap`, round past them, as an angle
 * does); typing shows what's typed and applies it as soon as it's a whole
 * number in range; leaving it shows the value again. Controlled: `value`,
 * and `onValueChange` with the new number.
 */
export function DsNumberInput({
  value,
  onValueChange,
  min = 0,
  max,
  step = 1,
  wrap = false,
  className,
  ...props
}: Omit<DsInputProps, "value" | "onChange" | "type" | "inputMode"> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max: number;
  step?: number;
  /** Past `max` comes round to `min` and back, as degrees do. */
  wrap?: boolean;
}) {
  const [text, setText] = React.useState<string | null>(null);
  const fit = (n: number) =>
    wrap ? ((((n - min) % (max - min + 1)) + (max - min + 1)) % (max - min + 1)) + min : Math.min(max, Math.max(min, n));
  return (
    <DsInput
      {...props}
      inputMode="numeric"
      className={cn("tabular-nums", className)}
      value={text ?? String(value)}
      onFocus={(e) => {
        setText(String(value));
        e.currentTarget.select();
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setText(null);
        props.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        const delta = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0;
        if (!delta || e.defaultPrevented) return;
        e.preventDefault();
        const next = fit(value + delta * step * (e.shiftKey ? 10 : 1));
        setText(String(next));
        onValueChange(next);
      }}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number.parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n >= min && n <= max) onValueChange(n);
      }}
    />
  );
}

/**
 * Search field: leading glass and a clear button while you type. Pass
 * `value` and `onValueChange` to control it, or leave them out and read the
 * query some other way (`defaultValue`, a form).
 */
export function DsSearch({
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Search",
  ...props
}: Omit<DsInputProps, "value" | "defaultValue" | "onChange" | "onClear" | "clearable" | "iconLeft"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const set = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <DsInput
      type="search"
      iconLeft={Search}
      placeholder={placeholder}
      value={value ?? uncontrolled}
      onChange={(e) => set(e.target.value)}
      onClear={() => set("")}
      {...props}
    />
  );
}

/**
 * Multi-line field: the same box, growing with its text from three lines.
 * `bare` drops the box and grows from one line, like writing on the page.
 */
export function DsTextarea(
  allProps: React.ComponentProps<"textarea"> & { invalid?: boolean; showFocus?: boolean; bare?: boolean }
) {
  const { invalid, showFocus, bare, className, ...props } = useDsField(allProps);
  return (
    <div
      data-slot="ds-textarea"
      data-focus={showFocus || undefined}
      data-invalid={invalid || undefined}
      className={cn(
        bare ? [DS_FIELD_BARE_CLASS, "items-start"] : [DS_FIELD_BOX_CLASS, "h-auto items-start py-2", invalid && DS_FIELD_INVALID_CLASS],
        className
      )}
    >
      <textarea
        rows={bare ? 1 : 3}
        aria-invalid={invalid || undefined}
        className={cn(DS_FIELD_INPUT_CLASS, bare ? "min-h-[22px]" : "min-h-[66px]", "resize-none [field-sizing:content]")}
        {...props}
      />
    </div>
  );
}

/**
 * Label above, and below either a description or, when `error` is set, the
 * error message in its place. The field-shaped control inside (input,
 * textarea, search, select, multi-select, date picker) picks up the label's
 * id, the note and the error state through context, so it can sit at any
 * depth. Give the field an `id` rather than the control. `required` adds the
 * asterisk to the label and marks the control required. The field is the
 * standard field width (`--ds-field-width`) and the control fills it; pass
 * `className="w-full"` for one that fills its row instead.
 */
export function DsField({
  id: idProp,
  label,
  description,
  error,
  required,
  size = "default",
  children,
  className,
}: {
  /** Small: a small label and gap, for small fields (DsInput `size="small"`). */
  size?: "default" | "small";
  /** The control's id; generated when left out. */
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error message; replaces the description and marks the control invalid. */
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const noteId = `${id}-note`;
  const note = error || description;
  const context = React.useMemo<DsFieldContextValue>(
    () => ({ id, invalid: Boolean(error), required: Boolean(required), describedBy: note ? noteId : undefined }),
    [id, error, required, note, noteId]
  );

  return (
    <div data-slot="ds-field" className={cn("flex flex-col text-left", size === "small" ? "gap-1" : "gap-2", DS_FIELD_WIDTH_CLASS, className)}>
      {label && (
        <label htmlFor={id} className={cn(size === "small" ? "text-small" : "text-p", "text-ds-fg-muted")}>
          {label}
          {required && <span aria-hidden>*</span>}
        </label>
      )}
      <DsFieldContext.Provider value={context}>{children}</DsFieldContext.Provider>
      {note && (
        <p
          id={noteId}
          role={error ? "alert" : undefined}
          className={cn("text-small", error ? "text-ds-error" : "text-ds-fg-muted")}
        >
          {note}
        </p>
      )}
    </div>
  );
}
