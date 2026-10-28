import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../cn";
import { DsLink, type DsLinkProps } from "../provider";

/**
 * Parabola button (Figma: Folio Dharmify 693:3362), built from the homepage
 * nav pills: `text-p` label, 8px gap between icon, label and trailing meta.
 *
 * Variants (style):
 * - default: fully rounded, on `ds-surface` at 70% with a blur behind, so it
 *   reads over images.
 * - primary: the same shape, solid `ds-fg`; the one main action on a screen
 *   (Publish, Save).
 * - danger: solid `ds-error`, for a confirmed destructive action (Delete).
 * - text: the ghost button. No surface at rest, for quiet actions like
 *   "Read more", a row's ⋮ or a site's nav. Hovering lays a light surface
 *   (`ds-surface` at 40%) under it, lighter than a default button so a row
 *   of them stays calm (decisions, 2026-10-28); it has the same padding as
 *   the others to give that room.
 *
 * Sizes, for every variant, labelled or icon-only:
 * - default: 36px tall, fully rounded, 12px side padding (36px square icon-only).
 * - small (Figma 699:6154, the image row actions): 24px tall, 8px corners
 *   (`rounded-ds-control`, squarer than the pill), 8px side padding,
 *   `text-small` label, 4px gaps (24px square icon-only). Icons stay 16px.
 *   For dense rows of secondary actions.
 *
 * Destructive (`destructive` prop): the same button in shadcn's red
 * (`ds-error`), for actions that delete or discard. On the default variant
 * it's red text on a 10% red tint, on the text variant red text; the solid
 * red button is the `danger` variant. There's no warning (yellow) style.
 *
 * State (props, not variants); on the default variant both are drawn in
 * `ds-surface-inverse`, on the text variant as its hover surface:
 * - `pressed`: a toggle that's on; sets `aria-pressed`.
 * - `current`: the link to the page you're on; sets `aria-current="page"`.
 *
 * Disabled: surfaces stay and the label greys to `ds-fg-subtle`; solid and
 * inverse buttons, whose label can't grey, fade to 40% instead.
 *
 * Colours are palette tokens only (tokens.css), so light and dark come for free.
 */
// Every variant takes the same padding: the text one shows a surface on hover.
const PADDED: ("default" | "primary" | "danger" | "text")[] = ["default", "primary", "danger", "text"];

export const dsButtonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "whitespace-nowrap transition-[color,background-color,opacity]",
    "ds-focus",
    "disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "backdrop-blur-[24px] bg-ds-surface/70 text-ds-fg ds-hover disabled:text-ds-fg-subtle",
        primary: "backdrop-blur-[24px] bg-ds-fg text-ds-bg ds-hover-inverse disabled:opacity-40",
        danger: "backdrop-blur-[24px] bg-ds-error text-ds-bg ds-hover-inverse disabled:opacity-40",
        // The ghost: one light surface on hover, no tint, the same as when it's current.
        text: "text-ds-fg hover:bg-ds-surface/40 disabled:bg-transparent disabled:text-ds-fg-subtle",
      },
      size: {
        default: "gap-2 rounded-full text-p",
        small: "gap-1 rounded-ds-control text-small",
      },
      /** Pressed or current: set from those props rather than passed directly. */
      inverse: {
        true: "",
      },
      /** Set from the `destructive` prop. */
      destructive: {
        true: "",
      },
      iconOnly: {
        true: "px-0",
      },
    },
    compoundVariants: [
      { variant: PADDED, size: "default", className: "h-9 px-3" },
      { variant: PADDED, size: "small", className: "h-6 px-2" },
      // Icon-only is square at either size, text variant included (its hit area).
      { iconOnly: true, size: "default", className: "size-9 px-0" },
      { iconOnly: true, size: "small", className: "size-6 px-0" },
      {
        variant: "default",
        destructive: true,
        className: "bg-ds-error/10 text-ds-error disabled:text-ds-error/50",
      },
      {
        variant: "text",
        destructive: true,
        className: "text-ds-error hover:bg-ds-error/10 disabled:text-ds-error/50",
      },
      {
        variant: "primary",
        destructive: true,
        className: "bg-ds-error",
      },
      {
        variant: "default",
        inverse: true,
        className: "bg-ds-surface-inverse text-ds-bg ds-hover-inverse disabled:text-ds-bg disabled:opacity-40",
      },
      {
        variant: "text",
        inverse: true,
        className: "bg-ds-surface/40 text-ds-fg",
      },
    ],
    defaultVariants: { variant: "default", size: "default" },
  }
);

type DsButtonOwnProps = Omit<VariantProps<typeof dsButtonVariants>, "inverse"> & {
  /** Icon before the label. With no children it renders icon-only. */
  iconLeft?: LucideIcon;
  /** Icon after the label (and after `meta`), e.g. a chevron. */
  iconRight?: LucideIcon;
  /** Small trailing text such as a count: `text-small`, muted. */
  meta?: React.ReactNode;
  /** Busy: a spinner replaces the left icon and the button is disabled. */
  loading?: boolean;
  /** A toggle that's on: inverse colours and `aria-pressed`. Pass `false` for one that's off. */
  pressed?: boolean;
  /** The link to the current page: inverse colours and `aria-current="page"`. */
  current?: boolean;
  /** Red, for deleting or discarding. See the variants note above. */
  destructive?: boolean;
};

type DsButtonAsButton = DsButtonOwnProps & { href?: undefined } & Omit<
    React.ComponentProps<"button">,
    keyof DsButtonOwnProps
  >;

/** With `href` it renders the app's link (DsProvider `link`), passing link props through. */
type DsButtonAsLink = DsButtonOwnProps & { href: string } & Omit<DsLinkProps, keyof DsButtonOwnProps | "href">;

export type DsButtonProps = DsButtonAsButton | DsButtonAsLink;

export function DsButton({
  variant = "default",
  size = "default",
  iconLeft: IconLeft,
  iconRight: IconRight,
  meta,
  iconOnly: iconOnlyProp,
  loading,
  pressed,
  current,
  destructive,
  className,
  children,
  ...props
}: DsButtonProps) {
  // Inferred from an icon with no label; pass it explicitly for custom icon children.
  const iconOnly = iconOnlyProp ?? (!children && meta == null && !!(IconLeft || IconRight));
  const inverse = Boolean(pressed || current);
  // Meta is muted on light surfaces; on solid and inverse ones it keeps the
  // label colour, as no fade of it stays legible there.
  const metaClass =
    !destructive && ((variant === "default" && !inverse) || variant === "text")
      ? "text-ds-fg-muted in-disabled:text-ds-fg-subtle"
      : undefined;
  const shared = {
    "data-slot": "ds-button",
    "data-variant": variant,
    "data-size": size,
    "aria-pressed": pressed,
    "aria-current": current ? ("page" as const) : undefined,
    className: cn(dsButtonVariants({ variant, size, inverse, iconOnly, destructive: destructive || undefined }), className),
  };

  const content = (
    <>
      {loading ? <Loader2 aria-hidden className="animate-spin" /> : IconLeft && <IconLeft aria-hidden />}
      {children}
      {meta != null && <span className={cn("text-small", metaClass)}>{meta}</span>}
      {IconRight && <IconRight aria-hidden />}
    </>
  );

  if (props.href !== undefined) {
    return (
      <DsLink {...props} {...shared}>
        {content}
      </DsLink>
    );
  }

  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      {...shared}
    >
      {content}
    </button>
  );
}
