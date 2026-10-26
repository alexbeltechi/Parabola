import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola tray: the floating surface under a select, multi-select, ⋮ menu or
 * date picker. Page colour, 1px `ds-border` outline, 16px corners, the
 * `shadow-ds-raised` elevation and a 4px inset so rows don't touch the edge.
 * Radix popovers, menus and selects take this class on their content.
 */
export const DS_TRAY_CLASS = cn(
  "z-(--ds-z-tray) rounded-ds-lg border border-ds-border bg-ds-bg p-1 text-ds-fg shadow-ds-raised",
  "max-h-(--radix-popper-available-height) overflow-y-auto"
);

/** A plain tray, for static previews or content outside a Radix popover. */
export function DsTray({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="ds-tray" className={cn(DS_TRAY_CLASS, className)} {...props} />;
}

/**
 * Menu item: a full-width row inside a tray, in the button's type and sizing
 * (`text-p`, 36px tall, 16px icons, 8px gaps). States are data attributes so
 * Radix items and hand-rolled listbox options share one look:
 * `data-highlighted` (hover or arrow keys), `data-disabled`.
 */
export const dsMenuItemVariants = cva(
  [
    "flex h-9 w-full cursor-default items-center gap-2 rounded-ds-md px-3 text-left text-p whitespace-nowrap outline-none select-none",
    "data-[highlighted]:bg-ds-surface/70",
    "data-[disabled]:pointer-events-none data-[disabled]:text-ds-fg-subtle",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      tone: {
        default: "text-ds-fg",
        /** Secondary actions such as "Create …". */
        subtle: "text-ds-fg-subtle",
        /** Destructive actions such as "Delete". */
        danger: "text-ds-error",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export type DsMenuItemContentProps = {
  /** Left slot: an icon, a DsCheckboxMark, a DsRadioMark or a colour dot. */
  indicator?: React.ReactNode;
  iconLeft?: LucideIcon;
  /** Trailing detail such as a count: `text-small`, muted. */
  meta?: React.ReactNode;
  /** Trailing slot, e.g. the check on a selected single-choice item. */
  trailing?: React.ReactNode;
  children: React.ReactNode;
};

/** The inside of a menu item, shared by every kind of item. */
export function DsMenuItemContent({
  indicator,
  iconLeft: IconLeft,
  meta,
  trailing,
  children,
}: DsMenuItemContentProps) {
  return (
    <>
      {indicator}
      {IconLeft && <IconLeft aria-hidden />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta != null && <span className="text-small text-ds-fg-muted">{meta}</span>}
      {trailing}
    </>
  );
}

/** A static menu item, for previews and custom listboxes. */
export function DsMenuItem({
  tone,
  highlighted,
  disabled,
  className,
  indicator,
  iconLeft,
  meta,
  trailing,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof dsMenuItemVariants> &
  DsMenuItemContentProps & { highlighted?: boolean; disabled?: boolean }) {
  return (
    <div
      data-slot="ds-menu-item"
      data-highlighted={highlighted || undefined}
      data-disabled={disabled || undefined}
      className={cn(dsMenuItemVariants({ tone }), className)}
      {...props}
    >
      <DsMenuItemContent indicator={indicator} iconLeft={iconLeft} meta={meta} trailing={trailing}>
        {children}
      </DsMenuItemContent>
    </div>
  );
}

/** A 12px colour dot for the indicator slot, e.g. a category's own colour. */
export function DsColourDot({ color }: { color: string }) {
  return <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

/** A thin rule between groups of items. */
export function DsMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="separator" className={cn("-mx-1 my-1 h-px bg-ds-border", className)} {...props} />;
}
