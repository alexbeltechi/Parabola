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
 *
 * `outline` draws any of them as a 1px line with no fill: dark in the button
 * colour, light in the fields' grey line, highlight in the highlight colour.
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
      /** A line and no fill. */
      outline: {
        true: "",
      },
    },
    compoundVariants: [
      { outline: true, variant: "dark", className: "bg-transparent text-ds-fg shadow-[inset_0_0_0_1px_var(--ds-button)]" },
      { outline: true, variant: "light", className: "bg-transparent text-ds-fg shadow-[inset_0_0_0_1px_var(--ds-field-border)]" },
      { outline: true, variant: "highlight", className: "bg-transparent text-ds-highlight shadow-[inset_0_0_0_1px_var(--ds-highlight)]" },
    ],
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
  variant = "light",
  outline,
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
      data-outline={outline || undefined}
      className={cn(dsPillVariants({ variant, outline: outline || undefined }), className)}
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
