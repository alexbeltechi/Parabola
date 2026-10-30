"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { dsToast } from "./toast";

/**
 * The copy button that sits inside a field on the right (DsCopyField, a
 * DsTextarea with `copyable`): a 24px icon button that copies `value` (or
 * what it returns at the moment of the click), shows
 * a tick for a moment and says "Copied". Its hit area reaches a little past
 * its edges.
 */
export function DsCopyButton({ value }: { value: string | (() => string) }) {
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
      className="relative flex size-6 shrink-0 items-center justify-center rounded-ds-control text-ds-fg-muted transition-colors ds-focus after:absolute after:-inset-1 hover:text-ds-fg"
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
    </button>
  );
}
