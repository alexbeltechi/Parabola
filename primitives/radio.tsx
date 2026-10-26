"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../cn";

/**
 * Parabola radio: the checkbox's single-choice twin. A 16px circle with the
 * same 2px `ds-fg-subtle` outline; selected fills with `ds-surface-inverse`
 * and a 6px dot in the page colour. Like the checkbox it takes clicks across
 * 24px. Arrow keys move between options.
 */
const CIRCLE_CLASS = cn(
  "grid size-4 shrink-0 place-content-center rounded-full border-2 border-ds-fg-subtle transition-colors",
  "data-[state=checked]:border-transparent data-[state=checked]:bg-ds-surface-inverse"
);

const DOT = <span className="block size-1.5 rounded-full bg-ds-bg" />;

export function DsRadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root data-slot="ds-radio-group" className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

export function DsRadio({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="ds-radio"
      className={cn(
        CIRCLE_CLASS,
        "relative after:absolute after:-inset-1 hover:border-ds-fg data-[state=checked]:ds-hover-inverse",
        "ds-focus",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator>{DOT}</RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

/** The radio's look without the control, for rows that are the control. */
export function DsRadioMark({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden data-state={checked ? "checked" : "unchecked"} className={CIRCLE_CLASS}>
      {checked && DOT}
    </span>
  );
}
