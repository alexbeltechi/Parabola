import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../cn";
import { DsLink, type DsLinkProps } from "../provider";

/**
 * Parabola button, built from the homepage
 * nav pills: `text-p` label, 8px gap between icon, label and trailing meta.
 *
 * Variants (style):
 * - default: fully rounded, on `ds-surface` at 70% with a blur behind, so it
 *   reads over images.
 * - primary: the same shape, solid `ds-button` (the theme's button colour,
 *   the text's by default); the one main action on a screen
 *   (Publish, Save). It wears the theme's button look (button-style.ts):
 *   a gradient, an outline, a 3D label, each off by default.
 * - danger: solid `ds-error`, for a confirmed destructive action (Delete).
 * - text: the ghost button. No surface at rest, for quiet actions like
 *   "Read more", a row's ⋮ or a site's nav. Hovering lays a light surface
 *   (`ds-surface` at 40%) under it, lighter than a default button so a row
 *   of them stays calm; it has the same padding as
 *   the others to give that room.
 *
 * Sizes, for every variant, labelled or icon-only:
 * - large: 56px tall, `text-prose` (18px) label, 20px icons, 20px side
 *   padding (56px square icon-only). For the one big call to action on a
 *   page (a landing page's "Book a call").
 * - default: 36px tall, 12px side padding (36px square icon-only).
 * - small (Figma 699:6154, the image row actions): 24px tall, 8px corners
 *   (`rounded-ds-control`, squarer than the pill), 8px side padding,
 *   `text-small` label, 4px gaps (24px square icon-only). Icons stay 16px.
 *   For dense rows of secondary actions.
 *
 * Corners: large and default are pills (`rounded-ds-pill`), fully round at
 * the theme's Large radius and rounded rectangles below it (radius.ts).
 *
 * Destructive (`destructive` prop): the same button in shadcn's red
 * (`ds-error`), for actions that delete or discard. On the default variant
 * it's red text on a 10% red tint, on the text variant red text; the solid
 * red button is the `danger` variant. There's no warning (yellow) style.
 *
 * Outline (`outline` prop): any variant drawn as a line with no fill, the
 * fields' own line (`ds-field-border`, `--ds-field-border-width`: 2px by
 * default), so a row of outline buttons sits with selects and inputs. The
 * default and text variants take the field's grey line and the text colour;
 * primary takes the button colour for line and label; danger and
 * `destructive` take red. Pressed or current, an outline button fills as any
 * other does, so in a row of outline chips the picked one is solid. The line
 * is drawn inside the edge, so the button's size doesn't change.
 *
 * State (props, not variants); on the default variant both are drawn in
 * `ds-button`, as primary is; on the text variant in the default button's
 * own grey, so a picked chip and a plain button share one
 * surface:
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
        default: "backdrop-blur-[24px] bg-ds-surface/70 text-ds-on-surface ds-hover disabled:text-ds-fg-subtle",
        // The theme's button look (button-style.ts): a gradient under the hover wash, an inset outline, and a
        // label shadow, which falls on text only, never the icons; or no fill at all, the label in the button
        // colour (an outline or a text button).
        primary: [
          "backdrop-blur-[24px] [background-color:var(--ds-button-fill,var(--ds-button))] [color:var(--ds-button-label,var(--ds-on-button))] disabled:opacity-40",
          "[background-image:var(--ds-button-image)] [box-shadow:var(--ds-button-ring)] [text-shadow:var(--ds-button-text-shadow)]",
          "hover:[background-image:linear-gradient(var(--ds-hover-inverse),var(--ds-hover-inverse)),var(--ds-button-image)]",
        ],
        danger: "backdrop-blur-[24px] bg-ds-error text-ds-bg ds-hover-inverse disabled:opacity-40",
        // The ghost: one light surface on hover, no tint, the same as when it's current.
        text: "text-ds-fg hover:bg-ds-surface/40 disabled:bg-transparent disabled:text-ds-fg-subtle",
      },
      size: {
        large: "gap-2 rounded-ds-pill text-prose [&_svg]:size-5",
        default: "gap-2 rounded-ds-pill text-p",
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
      /** A line and no fill, for any variant. See the Outline note above. */
      outline: {
        true: "",
      },
      iconOnly: {
        true: "px-0",
      },
    },
    compoundVariants: [
      { variant: PADDED, size: "large", className: "h-14 px-5" },
      { variant: PADDED, size: "default", className: "h-9 px-3" },
      { variant: PADDED, size: "small", className: "h-6 px-2" },
      // Icon-only is square at every size, text variant included (its hit area).
      { iconOnly: true, size: "large", className: "size-14 px-0" },
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
        // Red, plain: the theme's button look is for its own colour.
        className:
          "bg-ds-error [background-image:none] [box-shadow:none] [text-shadow:none] hover:[background-image:linear-gradient(var(--ds-hover-inverse),var(--ds-hover-inverse))]",
      },
      {
        variant: "default",
        inverse: true,
        className: "bg-ds-button text-ds-on-button ds-hover-inverse disabled:text-ds-on-button disabled:opacity-40",
      },
      {
        variant: "text",
        inverse: true,
        className: "bg-ds-surface/70 text-ds-on-surface ds-hover",
      },
      // Outline: no fill, the fields' line inside the edge. Listed last so it wins over the fills above;
      // not when pressed or current, which fill as usual.
      {
        outline: true,
        inverse: false,
        variant: ["default", "text"],
        className:
          "bg-transparent backdrop-blur-none text-ds-fg shadow-[inset_0_0_0_var(--ds-field-border-width)_var(--ds-field-border)] hover:bg-ds-surface/40 disabled:text-ds-fg-subtle",
      },
      {
        outline: true,
        inverse: false,
        variant: "primary",
        className:
          "backdrop-blur-none [background-color:transparent] [background-image:none] [text-shadow:none] [color:var(--ds-button)] [box-shadow:inset_0_0_0_var(--ds-field-border-width)_var(--ds-button)] hover:[background-image:linear-gradient(var(--ds-hover),var(--ds-hover))]",
      },
      {
        outline: true,
        inverse: false,
        variant: "danger",
        className: "bg-transparent backdrop-blur-none text-ds-error shadow-[inset_0_0_0_var(--ds-field-border-width)_var(--ds-error)] hover:bg-ds-error/10",
      },
      {
        outline: true,
        inverse: false,
        destructive: true,
        className:
          "bg-transparent [background-color:transparent] [background-image:none] text-ds-error [color:var(--ds-error)] shadow-[inset_0_0_0_var(--ds-field-border-width)_var(--ds-error)] [box-shadow:inset_0_0_0_var(--ds-field-border-width)_var(--ds-error)] hover:bg-ds-error/10 hover:[background-image:none]",
      },
    ],
    defaultVariants: { variant: "default", size: "default", inverse: false },
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
  /** A line and no fill. See the Outline note above. */
  outline?: boolean;
  /**
   * Renamable: a double-click turns the label into a field in place, the
   * button's own size and look; Enter or leaving it keeps the new name,
   * Escape keeps the old one. Given the name, trimmed and not empty.
   */
  onRename?: (name: string) => void;
  /** Start in the field, as a new item that's named first does. */
  renaming?: boolean;
  /** The field closed, renamed or not. */
  onRenameEnd?: () => void;
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
  outline,
  onRename,
  renaming,
  onRenameEnd,
  className,
  children,
  ...props
}: DsButtonProps) {
  const [editing, setEditing] = React.useState(false);
  // The name as it's typed while renaming (null: not changed yet, the label as it was).
  const [typed, setTyped] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (renaming) setEditing(true);
  }, [renaming]);
  // Inferred from an icon with no label; pass it explicitly for custom icon children.
  const iconOnly = iconOnlyProp ?? (!children && meta == null && !!(IconLeft || IconRight));
  const inverse = Boolean(pressed || current);
  // Meta is muted on light surfaces; on solid and inverse ones it keeps the
  // label colour, as no fade of it stays legible there.
  const metaClass =
    !destructive && ((variant === "default" && !inverse) || variant === "text" || (outline && !inverse && variant !== "danger"))
      ? "text-ds-fg-muted in-disabled:text-ds-fg-subtle"
      : undefined;
  const shared = {
    "data-slot": "ds-button",
    "data-variant": variant,
    "data-size": size,
    "data-outline": outline || undefined,
    "aria-pressed": pressed,
    "aria-current": current ? ("page" as const) : undefined,
    className: cn(dsButtonVariants({ variant, size, inverse, iconOnly, destructive: destructive || undefined, outline: outline || undefined }), className),
  };

  const content = (
    <>
      {loading ? <Loader2 aria-hidden className="animate-spin" /> : IconLeft && <IconLeft aria-hidden />}
      {children}
      {meta != null && <span className={cn("text-small", metaClass)}>{meta}</span>}
      {IconRight && <IconRight aria-hidden />}
    </>
  );

  if (onRename && editing) {
    const start = typeof children === "string" ? children : "";
    const draft = typed ?? start;
    const setDraft = setTyped;
    const finish = (value: string | null) => {
      setEditing(false);
      setTyped(null);
      const name = value?.trim();
      if (name && name !== start) onRename(name);
      onRenameEnd?.();
    };
    return (
      <span {...shared} aria-pressed={undefined}>
        {IconLeft && <IconLeft aria-hidden />}
        {/* The field as wide as its words, as the label was: a hidden copy of them sizes it, so the button keeps its
            width until the name does change. */}
        <span className="inline-grid">
          <span aria-hidden className="invisible whitespace-pre [grid-area:1/1]">
            {draft || " "}
          </span>
          <input
            autoFocus
            defaultValue={start}
            aria-label="Name"
            size={1}
            onFocus={(e) => e.currentTarget.select()}
            onInput={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") finish(e.currentTarget.value);
              if (e.key === "Escape") finish(null);
            }}
            onBlur={(e) => finish(e.currentTarget.value)}
            className="w-full min-w-0 bg-transparent p-0 text-inherit outline-none [font:inherit] [grid-area:1/1]"
          />
        </span>
      </span>
    );
  }

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
      onDoubleClick={
        onRename
          ? (e) => {
              props.onDoubleClick?.(e);
              setEditing(true);
            }
          : props.onDoubleClick
      }
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      {...shared}
    >
      {content}
    </button>
  );
}
