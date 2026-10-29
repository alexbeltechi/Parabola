"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../cn";
import { dsNormalizeHex } from "../colours";
import { DS_FIELD_BOX_CLASS, DS_FIELD_INPUT_CLASS, DS_FIELD_SMALL_CLASS } from "../primitives/field";
import { DS_TRAY_CLASS } from "../primitives/tray";
import { DsColourPicker } from "./colour-picker";

/**
 * Parabola colour field, as Figma and Paper show a colour: a field with the
 * colour's swatch and its hex beside it (without the #, typed or pasted).
 * Click the swatch for the picker in a tray (DsColourPicker: the square, the
 * hex, hue, warmth and brightness), which follows live. Small by default, the
 * mini field's size. Controlled: `value` is a `#RRGGBB`, `onChange` gets the
 * new one.
 */
export function DsColourField({
  value,
  onChange,
  size = "small",
  className,
  "aria-label": label,
}: {
  value: string;
  onChange: (hex: string) => void;
  size?: "default" | "small";
  className?: string;
  "aria-label"?: string;
}) {
  const [text, setText] = React.useState<string | null>(null);
  return (
    <Popover.Root>
      <div data-slot="ds-colour-field" className={cn(DS_FIELD_BOX_CLASS, size === "small" && DS_FIELD_SMALL_CLASS, "w-full pl-1", className)}>
        <Popover.Trigger
          aria-label={label ? `${label}: pick a colour` : "Pick a colour"}
          className="size-4 shrink-0 rounded-ds-sm shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ds-fg)_18%,transparent)] ds-focus"
          style={{ backgroundColor: value }}
        />
        <input
          aria-label={label}
          spellCheck={false}
          className={cn(DS_FIELD_INPUT_CLASS, "font-mono uppercase")}
          value={text ?? value.replace(/^#/, "")}
          onFocus={(e) => {
            setText(value.replace(/^#/, ""));
            e.currentTarget.select();
          }}
          onBlur={() => setText(null)}
          onChange={(e) => {
            setText(e.target.value);
            const hex = dsNormalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
        />
      </div>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={6} className={cn(DS_TRAY_CLASS, "w-[264px] p-3")}>
          <DsColourPicker aria-label={label} value={value} onChange={onChange} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
