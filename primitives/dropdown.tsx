"use client";

import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { cn } from "../cn";
import { DsCheckboxMark } from "./checkbox";
import { DsRadioMark } from "./radio";
import {
  DsMenuItemContent,
  DsMenuSeparator,
  DS_TRAY_CLASS,
  dsMenuItemVariants,
  type DsMenuItemContentProps,
} from "./tray";

/**
 * Parabola dropdown menu, e.g. behind a ⋮ button: Radix's DropdownMenu (arrow
 * keys, type-ahead, Escape) drawn as a Parabola tray of menu items. Plain
 * items run an action; checkbox items toggle; radio items pick one of a set.
 */
export const DsDropdown = Menu.Root;
export const DsDropdownTrigger = Menu.Trigger;
export const DsDropdownRadioGroup = Menu.RadioGroup;

export function DsDropdownContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(DS_TRAY_CLASS, "min-w-48", className)}
        {...props}
      />
    </Menu.Portal>
  );
}

type ItemExtras = Omit<DsMenuItemContentProps, "children"> & { children: React.ReactNode };

export function DsDropdownItem({
  tone,
  indicator,
  iconLeft,
  meta,
  trailing,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Menu.Item>, "children"> &
  ItemExtras & { tone?: "default" | "subtle" | "danger" }) {
  return (
    <Menu.Item className={cn(dsMenuItemVariants({ tone }), className)} {...props}>
      <DsMenuItemContent indicator={indicator} iconLeft={iconLeft} meta={meta} trailing={trailing}>
        {children}
      </DsMenuItemContent>
    </Menu.Item>
  );
}

export function DsDropdownCheckboxItem({
  checked,
  children,
  meta,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Menu.CheckboxItem>, "children"> & {
  checked: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Menu.CheckboxItem
      checked={checked}
      // Keep the tray open so several boxes can be ticked in one go.
      onSelect={(e) => e.preventDefault()}
      className={cn(dsMenuItemVariants(), className)}
      {...props}
    >
      <DsMenuItemContent indicator={<DsCheckboxMark checked={checked} />} meta={meta}>
        {children}
      </DsMenuItemContent>
    </Menu.CheckboxItem>
  );
}

export function DsDropdownRadioItem({
  value,
  children,
  meta,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Menu.RadioItem>, "children"> & {
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Menu.RadioItem value={value} className={cn(dsMenuItemVariants(), "group", className)} {...props}>
      <DsMenuItemContent
        indicator={
          <>
            <span className="hidden group-data-[state=checked]:contents">
              <DsRadioMark checked />
            </span>
            <span className="contents group-data-[state=checked]:hidden">
              <DsRadioMark checked={false} />
            </span>
          </>
        }
        meta={meta}
      >
        {children}
      </DsMenuItemContent>
    </Menu.RadioItem>
  );
}

/** A small muted title over a group of items, e.g. "Sort by". */
export function DsDropdownLabel({ className, ...props }: React.ComponentProps<typeof Menu.Label>) {
  return <Menu.Label className={cn("px-3 pt-2 pb-1 text-small text-ds-fg-muted", className)} {...props} />;
}

export function DsDropdownSeparator() {
  return <Menu.Separator asChild><DsMenuSeparator /></Menu.Separator>;
}
