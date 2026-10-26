import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../cn";
import { DsLink } from "../provider";

/**
 * Parabola list row (Figma: Folio Dharmify 699:6599): one item in an admin
 * list, e.g. a post, page or media file. Optional leading control (usually a
 * DsCheckbox), a 48px thumbnail with 12px corners, a title (P) with an
 * optional pill beside it, up to two lines of detail (P then Small, subtle),
 * and trailing actions (usually a ⋮ DsDropdown on a small `text` button, so it
 * has no background). 16px side padding, 12px gaps,
 * 16px corners; hovering lifts it onto `ds-surface-subtle`.
 *
 * Give it `href` or `onOpen` and the whole row opens the item: the title
 * becomes the link (or button) and stretches over the row, while the leading
 * control and actions sit above it and keep their own clicks. `selected`
 * marks the item open beside the list (Figma 699:6154) in the selected-button
 * colour.
 */
export function DsListRow({
  leading,
  thumbnail,
  thumbnailIcon: ThumbnailIcon,
  title,
  pill,
  meta,
  detail,
  actions,
  href,
  onOpen,
  selected = false,
  hover = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  leading?: React.ReactNode;
  /** Image URL for the 48px thumbnail. */
  thumbnail?: string | null;
  /** Shown in the thumbnail's place when there's no image. */
  thumbnailIcon?: LucideIcon;
  title: React.ReactNode;
  pill?: React.ReactNode;
  /** First detail line, e.g. a date. */
  meta?: React.ReactNode;
  /** Second detail line, e.g. a status, in the smaller size. */
  detail?: React.ReactNode;
  actions?: React.ReactNode;
  /** Opens the item by navigating here. */
  href?: string;
  /** Opens the item in place, e.g. in a pane beside the list. Ignored with `href`. */
  onOpen?: () => void;
  /** The item that's open: inverse colours and `aria-current`. */
  selected?: boolean;
  /** Lift onto `ds-surface-subtle` on hover. Turn off for a row that isn't a list item, e.g. a file in a form. */
  hover?: boolean;
}) {
  const interactive = href !== undefined || onOpen !== undefined;
  const titleClass = cn(
    "truncate text-p",
    selected ? "text-ds-bg" : "text-ds-fg",
    // Stretch the title's hit area over the whole row.
    interactive && "text-left ds-focus-stretched after:absolute after:inset-0 after:rounded-ds-lg"
  );
  const ariaCurrent = selected ? ("true" as const) : undefined;
  const detailColour = selected ? "text-ds-bg/70" : "text-ds-fg-subtle";

  return (
    <div
      data-slot="ds-list-row"
      data-selected={selected || undefined}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-ds-lg px-4 py-2 transition-colors",
        selected
          ? [
              "bg-ds-surface-inverse text-ds-bg backdrop-blur-[24px]",
              // Default buttons in the row (the ⋮) darken to sit on the inverse surface.
              "[&_[data-slot=ds-button][data-variant=default]]:bg-ds-bg/15 [&_[data-slot=ds-button][data-variant=default]]:text-ds-bg",
              // The checkbox too: an unchecked one gets a page-colour outline, a
              // checked one fills with the page colour, since its usual inverse
              // fill would vanish into the row.
              "[&_[data-slot=ds-checkbox][data-state=unchecked]]:border-ds-bg/60",
              "[&_[data-slot=ds-checkbox][data-state=checked]]:bg-ds-bg [&_[data-slot=ds-checkbox][data-state=checked]]:text-ds-fg",
            ]
          : hover && "hover:bg-ds-surface-subtle",
        className
      )}
      {...props}
    >
      {leading && <div className="relative z-10 flex shrink-0">{leading}</div>}
      {thumbnail ? (
        <img src={thumbnail} alt="" className="size-12 shrink-0 rounded-ds-md bg-ds-surface object-cover" />
      ) : (
        ThumbnailIcon && (
          <div
            aria-hidden
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-ds-md [&_svg]:size-5",
              selected ? "bg-ds-bg/15 text-ds-bg/70" : "bg-ds-surface/70 text-ds-fg-subtle"
            )}
          >
            <ThumbnailIcon />
          </div>
        )
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <div className="flex min-w-0 items-center gap-1">
          {href !== undefined ? (
            <DsLink href={href} aria-current={ariaCurrent} className={titleClass}>
              {title}
            </DsLink>
          ) : onOpen ? (
            <button type="button" onClick={onOpen} aria-current={ariaCurrent} className={titleClass}>
              {title}
            </button>
          ) : (
            <p className={titleClass}>{title}</p>
          )}
          {pill}
        </div>
        {meta && <p className={cn("truncate text-p", detailColour)}>{meta}</p>}
        {detail && <p className={cn("truncate text-small", detailColour)}>{detail}</p>}
      </div>
      {actions && <div className="relative z-10 flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
