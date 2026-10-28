"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola checkbox (Figma: Folio Dharmify 706:8558): the Radix primitive
 * shadcn's Checkbox wraps, drawn from palette tokens only. 16px box, 4px
 * corners. Unchecked is a 2px `ds-fg-subtle` outline; checked fills with
 * `ds-button` (the selected-button colour) and a 12px check in
 * `ds-on-button`. The box draws at 16px but takes clicks across 24px. Pair it
 * with a label.
 */
const BOX_CLASS = cn(
  "grid size-4 shrink-0 place-content-center rounded-ds-sm border-2 border-ds-fg-subtle transition-colors",
  "data-[state=checked]:border-transparent data-[state=checked]:bg-ds-button data-[state=checked]:text-ds-on-button",
  "[&_svg]:size-3"
);

export function DsCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="ds-checkbox"
      className={cn(
        BOX_CLASS,
        "relative after:absolute after:-inset-1 hover:border-ds-fg data-[state=checked]:ds-hover-inverse",
        "ds-focus",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/**
 * The checkbox's look without the control, for rows that are themselves the
 * control (a multi-select option, a menu checkbox item).
 */
export function DsCheckboxMark({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden data-state={checked ? "checked" : "unchecked"} className={BOX_CLASS}>
      {checked && <CheckIcon />}
    </span>
  );
}
