"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";
import { DsTopBar } from "./top-bar";

/**
 * Parabola side panel: a full-height panel that slides in from the right
 * over the page, for work that sits beside it (page settings, a post editor
 * opened from the media library). Radix Dialog underneath, so focus moves in
 * and stays there, Escape closes it and focus returns on close.
 *
 * Page colour with a 1px `ds-border` edge and the raised shadow; the full
 * width on phones, `max-w-md` (or your `className`) from `sm` up. With a
 * `title` it draws a header like the dialog's (H3, close ×) and pads its
 * content 20px; without one the content brings its own header and padding,
 * and `label` names the panel for screen readers instead. Fields inside
 * fill its width (`ds-fields-fill`): a side panel is one field wide.
 *
 * The page behind frosts like the dialog's; `overlay={false}` leaves it
 * clear, for a panel that edits what's visible beside it.
 */
export function DsSidePanel({
  open,
  onOpenChange,
  title,
  description,
  label,
  overlay = true,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Draws the header. Leave it out when the content has its own. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** The panel's name for screen readers when there's no `title`. */
  label?: string;
  /** Frost the page behind. */
  overlay?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {overlay && (
          <Dialog.Overlay className="fixed inset-0 z-(--ds-z-menu) bg-ds-bg/60 backdrop-blur-[24px] motion-safe:animate-in motion-safe:fade-in-0" />
        )}
        <Dialog.Content
          data-slot="ds-side-panel"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          className={cn(
            "fixed inset-y-0 right-0 z-(--ds-z-menu) flex h-full w-full flex-col sm:max-w-md",
            "border-l border-ds-border bg-ds-bg text-ds-fg shadow-ds-raised outline-none ds-fields-fill",
            "motion-safe:animate-in motion-safe:slide-in-from-right",
            className
          )}
        >
          {title ? (
            // The header is pinned over the scrolling content, which fades out
            // beneath it (`ds-nav-fade`), as in the admin's top bars. Clicks
            // pass through the gradient to the content.
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <DsTopBar surface="blur" className="-mx-5 -mb-4 gap-2 px-5 pt-5 pb-8">
                <div className="flex items-start gap-2">
                  <Dialog.Title className="min-w-0 flex-1 pt-1.5 text-h3">{title}</Dialog.Title>
                  <Dialog.Close asChild>
                    <DsButton iconLeft={X} aria-label="Close" className="-mt-0.5 -mr-0.5" />
                  </Dialog.Close>
                </div>
                {description ? (
                  <Dialog.Description className="text-p text-ds-fg-muted">{description}</Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{title}</Dialog.Description>
                )}
              </DsTopBar>
              {children}
            </div>
          ) : (
            <>
              <Dialog.Title className="sr-only">{label}</Dialog.Title>
              <Dialog.Description className="sr-only">{label}</Dialog.Description>
              {children}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
