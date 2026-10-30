"use client";

import * as React from "react";
import { cn } from "../cn";
import { DsCopyButton } from "./copy-button";
import { DS_FIELD_BOX_CLASS, DS_FIELD_INPUT_CLASS } from "./field";
import { DS_SHOW_MORE_CLOSED_CLASS, DsShowMoreButton, useDsShowMore } from "./show-more";

/**
 * Parabola copy field: a read-only value in the field's box and a copy
 * button inside it on the right that copies the whole value (a prompt, a
 * command, a link, a key). Clicking the text selects it all, for copying by
 * hand.
 *
 * Three versions: one line, cut short with an ellipsis (the default);
 * `wrap`, where the text runs onto as many lines as it needs and the box
 * grows downward, so a prompt can be read before it's copied, stopping at
 * ten lines with an ellipsis; or `collapsible`, for long text such as a
 * brand guide: six lines and Show more (show-more.tsx). Wrapped, the copy
 * button floats over the text's top right corner instead of taking a
 * column. The copy is always whole.
 */
export function DsCopyField({
  value,
  mono,
  wrap,
  collapsible,
  className,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: string;
  /** Set it in the monospace face, for commands and code. */
  mono?: boolean;
  /** Show the whole text over several lines (up to ten) instead of one cut-short line. */
  wrap?: boolean;
  /** Wrapped, six lines with Show more under them for the rest. */
  collapsible?: boolean;
}) {
  const lines = wrap || collapsible;
  const { setElement, open, toggle, overflows, closed } = useDsShowMore<HTMLParagraphElement>(Boolean(collapsible), value);
  return (
    <div
      data-slot="ds-copy-field"
      className={cn(DS_FIELD_BOX_CLASS, "relative", lines ? "h-auto flex-col items-stretch gap-ds-8 py-2" : "pr-2", className)}
      {...props}
    >
      {lines ? (
        <p
          ref={setElement}
          aria-label={ariaLabel ?? "Text to copy"}
          className={cn(
            "min-w-0 select-all whitespace-pre-wrap break-words",
            collapsible ? closed && DS_SHOW_MORE_CLOSED_CLASS : "line-clamp-10",
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
      {overflows && <DsShowMoreButton open={open} onToggle={toggle} />}
      <DsCopyButton value={value} floating={lines} />
    </div>
  );
}
