import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola pill: a small status or tag chip,
 * 22px tall, `text-small`, the theme's pill corner (`rounded-ds-chip`: the
 * buttons' by default, so fully round at Large). Optional 12px icons sit before
 * and after the label, 4px from it. The pill itself isn't interactive; give
 * it `onRemove` and its trailing × becomes a real button.
 *
 * - dark: `ds-button` with `ds-on-button` text, e.g. "Published".
 * - light: `ds-surface`, the same stone as the default button.
 * - highlight: `ds-highlight` text on its solid light tint, e.g. "Claude".
 */
export const dsPillVariants = cva(
  [
    "inline-flex h-[22px] shrink-0 items-center justify-center gap-1 rounded-ds-chip px-1.5",
    "text-small whitespace-nowrap",
    "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        dark: "bg-ds-button text-ds-on-button",
        light: "bg-ds-surface/70 text-ds-on-surface",
        highlight: "bg-(--ds-highlight-tint) text-ds-highlight",
      },
    },
    defaultVariants: { variant: "light" },
  }
);

type DsPillProps = React.ComponentProps<"span"> &
  VariantProps<typeof dsPillVariants> & {
    /** Icon before the label. */
    iconLeft?: LucideIcon;
    /** An element before the label in place of `iconLeft`, e.g. a drag handle button. */
    leading?: React.ReactNode;
    /** Icon after the label. Ignored when `onRemove` is set. */
    iconRight?: LucideIcon;
    /** Adds a × button that calls this, labelled "Remove <label>". */
    onRemove?: () => void;
  };

export function DsPill({
  variant,
  iconLeft: IconLeft,
  leading,
  iconRight: IconRight,
  onRemove,
  className,
  children,
  ...props
}: DsPillProps) {
  return (
    <span
      data-slot="ds-pill"
      data-variant={variant ?? "light"}
      className={cn(dsPillVariants({ variant }), className)}
      {...props}
    >
      {leading ?? (IconLeft && <IconLeft aria-hidden />)}
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={typeof children === "string" ? `Remove ${children}` : "Remove"}
          // The × draws at 12px; the pseudo-element widens the target to 24px.
          className="relative flex rounded-ds-sm transition-opacity ds-focus after:absolute after:-inset-1.5 hover:opacity-70"
        >
          <X aria-hidden />
        </button>
      ) : (
        IconRight && <IconRight aria-hidden />
      )}
    </span>
  );
}
