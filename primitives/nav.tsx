"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, Menu, X } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";
import { DsThemeToggle } from "./theme-toggle";

/**
 * Top bar: back on
 * the left, which leaves for `backHref` (the homepage by default) rather than
 * stepping back through history; theme and menu on the right, 20px from the
 * edges. A DsMenu is modal, so while one is open render the bar inside it
 * too (see the /parabola shell) to keep its close button reachable.
 */
export function DsNavBar({
  menuOpen,
  onMenuToggle,
  backHref = "/",
  menuClassName,
  children,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
  /** Where back leaves to. */
  backHref?: string;
  /** Classes for the menu button, e.g. `md:hidden` when the page shows its own links from that width up. */
  menuClassName?: string;
  /** Centred between back and the right-hand buttons, e.g. section links. */
  children?: React.ReactNode;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-5 top-5 z-(--ds-z-nav) flex items-center justify-between [&>*]:pointer-events-auto">
      <DsButton href={backHref} iconLeft={ChevronLeft} aria-label="Back to site" />
      {/* In the DOM between the sides so Tab follows the visual left-to-right order. */}
      {children}
      <div className="flex items-center gap-2">
        <DsThemeToggle />
        <DsButton
          iconLeft={menuOpen ? X : Menu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className={menuClassName}
          onClick={onMenuToggle}
        />
      </div>
    </div>
  );
}

/**
 * Full-screen menu (Figma: 693:5293): the nav pills stacked in the middle of
 * a frosted sheet. A Radix Dialog, so it's a true modal: focus moves in when
 * it opens, Tab stays inside, Escape closes it, focus returns to whatever
 * opened it, and the page underneath stops scrolling. Put its close button
 * inside it (anything outside is inert while it's open).
 */
export function DsMenu({
  open,
  onClose,
  label = "Menu",
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** Announced name of the dialog. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Radix hands focus back only to a Dialog.Trigger, and this menu is opened
  // from outside, so remember what had focus and return it on close. A layout
  // effect runs before Radix moves focus into the menu.
  const returnFocus = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    if (open) returnFocus.current = document.activeElement as HTMLElement | null;
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus.current?.focus();
          }}
          className={cn(
            "fixed inset-0 z-(--ds-z-menu) flex flex-col items-center justify-center gap-1 outline-none ds-frosted",
            className
          )}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
