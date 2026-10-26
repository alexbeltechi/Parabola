"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../cn";
import { DS_FIELD_BOX_CLASS, DS_FIELD_INPUT_CLASS } from "./field";
import { dsToast } from "./toast";

/**
 * Parabola copy field: a read-only value in the field's box, cut short with
 * an ellipsis, and a copy button inside it on the right that copies the
 * whole value (a prompt, a command, a link, a key). Clicking the text
 * selects it all, for copying by hand.
 */
export function DsCopyField({
  value,
  mono,
  className,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: string;
  /** Set it in the monospace face, for commands and code. */
  mono?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = () =>
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        dsToast("Copied");
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => dsToast("Couldn't copy", { description: "Select the text and copy it instead." })
    );

  return (
    <div data-slot="ds-copy-field" data-copied={copied || undefined} className={cn(DS_FIELD_BOX_CLASS, "pr-2", className)} {...props}>
      <input
        readOnly
        value={value}
        title={value}
        aria-label={ariaLabel ?? "Text to copy"}
        onFocus={(e) => e.currentTarget.select()}
        className={cn(DS_FIELD_INPUT_CLASS, "truncate", mono && "font-mono text-small")}
      />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy"}
        className="relative flex size-6 shrink-0 items-center justify-center rounded-ds-control text-ds-fg-muted transition-colors ds-focus after:absolute after:-inset-1 hover:text-ds-fg"
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </button>
    </div>
  );
}
