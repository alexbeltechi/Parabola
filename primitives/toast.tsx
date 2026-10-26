"use client";

import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola toast (Figma: Folio Dharmify 713:9389): a short message in the
 * selected-button colours, `ds-surface-inverse` with a blur behind, 16px
 * corners, 16px side padding. The title is P in the page colour, an optional
 * description P at 70%, and an optional action sits on the right as a round
 * button on a second layer of the same surface.
 *
 * Mount `DsToaster` once (the admin layout does), then call sonner's `toast`
 * as usual, re-exported here as `dsToast`:
 *   dsToast("Block removed", { action: { label: "Undo", onClick: restore } });
 */
const TOAST_CLASS =
  "flex w-[var(--width)] items-center gap-3 rounded-ds-lg bg-ds-surface-inverse px-4 py-2 text-ds-bg shadow-ds-raised backdrop-blur-[24px]";
const ACTION_CLASS =
  "ml-auto flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-ds-surface-inverse px-3 text-p whitespace-nowrap text-ds-bg backdrop-blur-[8px] ds-hover-inverse ds-focus [&_svg]:size-4";

// Sonner's own styling is off (`unstyled`); the toast draws from Parabola
// tokens, which follow the theme by themselves, so Sonner needn't know it.
export function DsToaster() {
  return (
    <Sonner
      position="bottom-center"
      gap={8}
      icons={{
        success: <CircleCheck aria-hidden />,
        info: <Info aria-hidden />,
        warning: <TriangleAlert aria-hidden />,
        error: <OctagonX aria-hidden />,
        loading: <Loader2 aria-hidden className="animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: TOAST_CLASS,
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "text-p",
          description: "text-p text-ds-bg/70",
          icon: "flex size-4 shrink-0 items-center [&_svg]:size-4",
          actionButton: ACTION_CLASS,
          cancelButton: cn(ACTION_CLASS, "ml-0 bg-transparent"),
        },
      }}
      style={{ "--width": "min(356px, calc(100vw - 32px))" } as React.CSSProperties}
    />
  );
}

export { toast as dsToast };

/**
 * The toast's look without sonner, for the /parabola page and other static previews.
 */
export function DsToast({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The trailing round button, e.g. a DsToastAction. */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="ds-toast" role="status" className={cn(TOAST_CLASS, "w-[356px] max-w-full", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-p">{title}</p>
        {description && <p className="truncate text-p text-ds-bg/70">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** The toast's action button, for static previews (sonner draws its own from `action`). */
export function DsToastAction({
  iconOnly,
  className,
  ...props
}: React.ComponentProps<"button"> & { iconOnly?: boolean }) {
  return <button type="button" className={cn(ACTION_CLASS, iconOnly && "w-9 px-0", className)} {...props} />;
}
