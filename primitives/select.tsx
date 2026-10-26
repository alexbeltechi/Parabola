"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../cn";
import { DS_FIELD_BOX_CLASS, useDsField, type DsControlProps } from "./field";
import { DS_TRAY_CLASS, dsMenuItemVariants } from "./tray";

export type DsSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Shown before the label, in the tray and the trigger, e.g. a DsColourDot. */
  indicator?: React.ReactNode;
};

/**
 * Parabola select: pick one option. The trigger is a field (same box, focus
 * and error states) with a chevron; the options open in a tray as menu items,
 * the chosen one marked with a trailing check. Radix's Select handles keys and
 * type-ahead. Inside a DsField it picks up the field's id, error state,
 * required and note. `name` submits the value with a form. An option's
 * `indicator` (e.g. a category's colour dot) leads its label, in the tray
 * and in the trigger once chosen.
 */
export function DsSelect(
  allProps: {
    options: DsSelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    invalid?: boolean;
    /** Force the focus look on, for previewing the state. */
    showFocus?: boolean;
  } & DsControlProps
) {
  const {
    options,
    value,
    onValueChange,
    placeholder = "Select",
    disabled,
    required,
    name,
    invalid,
    showFocus,
    id,
    className,
    "aria-describedby": describedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
  } = useDsField(allProps);
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        data-focus={showFocus || undefined}
        data-invalid={invalid || undefined}
        className={cn(
          DS_FIELD_BOX_CLASS,
          "cursor-default justify-between outline-none",
          "data-[placeholder]:text-ds-fg-subtle",
          invalid && "border-ds-error",
          className
        )}
      >
        <span className="min-w-0 truncate text-left">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden className="text-ds-fg group-disabled:text-ds-fg-subtle" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(DS_TRAY_CLASS, "w-(--radix-select-trigger-width)")}
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={dsMenuItemVariants()}
              >
                <SelectPrimitive.ItemText>
                  {option.indicator ? (
                    <span className="flex min-w-0 items-center gap-2">
                      {option.indicator}
                      <span className="truncate">{option.label}</span>
                    </span>
                  ) : (
                    option.label
                  )}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto flex">
                  <Check aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
