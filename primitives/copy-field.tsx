"use client";

import * as React from "react";
import { cn } from "../cn";
import { DsCopyButton } from "./copy-button";
import { DS_FIELD_BOX_CLASS, DS_FIELD_INPUT_CLASS } from "./field";

/**
 * Parabola copy field: a read-only value in the field's box and a copy
 * button inside it on the right that copies the whole value (a prompt, a
 * command, a link, a key). Clicking the text selects it all, for copying by
 * hand.
 *
 * Three versions: one line, cut short with an ellipsis (the default);
 * `wrap`, where the text runs onto as many lines as it needs and the box
 * grows downward, so a prompt can be read before it's copied, stopping at
 * ten lines with an ellipsis; or `scroll`, wrapped too but about ten lines
 * high with the rest a scroll away inside, for long text such as a brand
 * guide. The copy is always whole.
 */
export function DsCopyField({
  value,
  mono,
  wrap,
  scroll,
  className,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: string;
  /** Set it in the monospace face, for commands and code. */
  mono?: boolean;
  /** Show the whole text over several lines (up to ten) instead of one cut-short line. */
  wrap?: boolean;
  /** Wrapped, about ten lines high, the rest scrolling inside. */
  scroll?: boolean;
}) {
  const lines = wrap || scroll;
  return (
    <div
      data-slot="ds-copy-field"
      className={cn(DS_FIELD_BOX_CLASS, "pr-2", lines && "h-auto items-start py-2", className)}
      {...props}
    >
      {lines ? (
        <p
          aria-label={ariaLabel ?? "Text to copy"}
          tabIndex={scroll ? 0 : undefined}
          className={cn(
            "min-w-0 flex-1 select-all whitespace-pre-wrap break-words",
            scroll ? "max-h-[220px] overflow-y-auto" : "line-clamp-10",
            mono && "font-mono text-small"
          )}
        >
          {value}
        </p>
      ) : (
        <input
          readOnly
          value={value}
          title={value}
          aria-label={ariaLabel ?? "Text to copy"}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(DS_FIELD_INPUT_CLASS, "truncate", mono && "font-mono text-small")}
        />
      )}
      <DsCopyButton value={value} />
    </div>
  );
}
