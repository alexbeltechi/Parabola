"use client";

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cva } from "class-variance-authority";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "../cn";
import { DsLink, type DsLinkProps } from "../provider";

/**
 * Parabola nav item (Figma: Folio Dharmify 695:5638): a sidebar row, built on
 * the button's rules but laid out as a full-width list row. No surface at
 * rest; hover and an open group take the default button surface, the current
 * page takes the selected-button colour.
 *
 * - default: 36px, fully rounded, `text-p`, 12px padding, 8px gaps; for top-level rows.
 * - small: 24px, 8px corners (like the small button), `text-small`, 8px padding,
 *   4px gaps; for rows inside a group.
 *
 * `leading` puts something of its own where the icon goes (a colour
 * swatch); `actions` puts controls at the row's right end (usually a ⋮
 * DsDropdown on a small `text` button): the row and its actions sit side by
 * side in one wrapper, each keeping its own clicks, the actions over the
 * row's end so its hover and selected surface run under them.
 */
export const dsNavItemVariants = cva(
  [
    "group/nav flex w-full min-w-0 items-center text-left whitespace-nowrap transition-colors ds-focus",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        default: "h-9 gap-2 rounded-ds-pill px-3 text-p",
        small: "h-6 gap-1 rounded-ds-control px-2 text-small",
      },
      selected: {
        true: "bg-ds-button text-ds-on-button ds-hover-inverse",
        false: "text-ds-fg hover:bg-ds-surface/70 data-[state=open]:bg-ds-surface/70",
      },
    },
    defaultVariants: { size: "default", selected: false },
  }
);

type DsNavItemOwnProps = {
  size?: "default" | "small";
  /** The current page: takes the selected-button colour. */
  selected?: boolean;
  iconLeft?: LucideIcon;
  /** Leading content of its own in place of an icon, e.g. a colour swatch. */
  leading?: React.ReactNode;
  /** At the row's right end, after `meta`: e.g. a ⋮ menu. */
  actions?: React.ReactNode;
  /** Trailing detail such as a count: `text-small`, muted (the label colour when selected). */
  meta?: React.ReactNode;
  /** Leading chevron that turns when the row's group is open. */
  expandable?: boolean;
  children: React.ReactNode;
};

type DsNavItemProps = DsNavItemOwnProps &
  (
    | ({ href: string } & Omit<DsLinkProps, keyof DsNavItemOwnProps | "href">)
    | ({ href?: undefined } & Omit<React.ComponentProps<"button">, keyof DsNavItemOwnProps>)
  );

export function DsNavItem({
  size = "default",
  selected = false,
  iconLeft: IconLeft,
  leading,
  actions,
  meta,
  expandable,
  className,
  children,
  ...props
}: DsNavItemProps) {
  // Room at the end for the actions, which sit over it.
  const classes = cn(dsNavItemVariants({ size, selected }), actions != null && (size === "small" ? "pr-8" : "pr-11"), className);
  const content = (
    <>
      {expandable && (
        <ChevronRight aria-hidden className="transition-transform group-data-[state=open]/nav:rotate-90" />
      )}
      {IconLeft && <IconLeft aria-hidden />}
      {leading}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta != null && (
        <span className={cn("text-small", !selected && "text-ds-fg-muted")}>{meta}</span>
      )}
    </>
  );

  const item =
    props.href !== undefined ? (
      <DsLink data-slot="ds-nav-item" aria-current={selected ? "page" : undefined} className={classes} {...props}>
        {content}
      </DsLink>
    ) : (
      <button type="button" data-slot="ds-nav-item" className={classes} {...props}>
        {content}
      </button>
    );
  if (actions == null) return item;
  return (
    <div data-slot="ds-nav-item-row" className="relative flex w-full items-center">
      {item}
      <div
        className={cn(
          "absolute inset-y-0 flex items-center",
          size === "small" ? "right-0.5" : "right-1.5",
          // On the selected colour, a text button's icon takes the colour on it.
          selected && "[&_[data-slot=ds-button][data-variant=text]]:text-ds-on-button"
        )}
      >
        {actions}
      </div>
    </div>
  );
}

/**
 * A collapsible group of nav items: a default-size row with a chevron that
 * opens and closes its small child rows, indented 12px and 4px apart
 * (`ds-4`, the smallest spacing) as nav rows are. Radix Collapsible
 * handles the open state and its announcement.
 */
export function DsNavGroup({
  label,
  iconLeft,
  meta,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  label: React.ReactNode;
  iconLeft?: LucideIcon;
  meta?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Collapsible.Trigger asChild>
        <DsNavItem expandable iconLeft={iconLeft} meta={meta}>
          {label}
        </DsNavItem>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-ds-4 pt-ds-4 pl-3">{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
