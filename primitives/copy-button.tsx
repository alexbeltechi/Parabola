"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../cn";
import { dsToast } from "./toast";

/**
 * The copy button that sits inside a field on the right (DsCopyField, a
 * DsTextarea with `copyable`): a 24px icon button that copies `value` (or
 * what it returns at the moment of the click), shows
 * a tick for a moment and says "Copied". Its hit area reaches a little past
 * its edges. `floating`: over the text in the field's top right corner, on
 * the default button's grey (DsTextarea). A wrapped DsCopyField gives it a
 * column of its own instead, so its text never runs under it.
 */
export function DsCopyButton({ value, floating }: { value: string | (() => string); floating?: boolean }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () =>
    navigator.clipboard.writeText(typeof value === "function" ? value() : value).then(
      () => {
        setCopied(true);
        dsToast("Copied");
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => dsToast("Couldn't copy", { description: "Select the text and copy it instead." })
    );

  return (
    <button
      type="button"
      onClick={copy}
      data-copied={copied || undefined}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-ds-control transition-colors ds-focus after:absolute after:-inset-1",
        floating
          ? "absolute top-1.5 right-1.5 bg-ds-surface text-ds-on-surface ds-hover"
          : "relative text-ds-fg-muted hover:text-ds-fg"
      )}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
    </button>
  );
}
