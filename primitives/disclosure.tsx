"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";

/**
 * Parabola disclosure: something folded away behind one quiet line of text,
 * "Show advanced options ⌄", which opens it below and becomes "Hide advanced
 * options ⌃". Closed by default. For what most people don't need on every
 * visit (fine-tuning, how to set something up with your AI), so the page
 * stays short; the box it sits in grows to hold it. The text button sits
 * flush with the text around it (its padding pulled back), and what opens is
 * 16px under it.
 *
 * `label` is what's folded, as a phrase that follows "Show" and "Hide"
 * ("advanced options", "AI instructions").
 */
export function DsDisclosure({
  label,
  defaultOpen = false,
  className,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <div data-slot="ds-disclosure" className={cn("flex flex-col gap-ds-16", className)}>
      <DsButton
        variant="text"
        size="small"
        iconRight={open ? ChevronUp : ChevronDown}
        aria-expanded={open}
        aria-controls={id}
        className="-ml-2 self-start"
        onClick={() => setOpen((on) => !on)}
      >
        {open ? `Hide ${label}` : `Show ${label}`}
      </DsButton>
      {open && (
        <div id={id} className="flex flex-col gap-ds-16">
          {children}
        </div>
      )}
    </div>
  );
}
