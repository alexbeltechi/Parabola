import { cn } from "../cn";
import { DsLink } from "../provider";

/**
 * Parabola media tile: a piece of content in a feed or grid. A square-cornered media
 * box, then the title, a muted line under it (e.g. the categories) and an
 * optional description, all centred. The whole tile is one link: the title's
 * link stretches over it, so a click anywhere opens it and hovering anywhere
 * underlines the title (no underline at rest).
 *
 * The media is yours to render (an optimised image, a video poster), passed
 * as `media`; `mediaStyle` sizes its box (aspect ratio, width). With no media
 * the tile is text only, at a reading width. Props it doesn't use reach the
 * root <article>, `ref` included (for lazy loading).
 */
export function DsMediaTile({
  href,
  title,
  meta,
  description,
  media,
  mediaStyle,
  className,
  ...props
}: Omit<React.ComponentProps<"article">, "title"> & {
  href: string;
  title: React.ReactNode;
  /** The muted line under the title, e.g. "Design, Photography". */
  meta?: React.ReactNode;
  /** A few lines under it; clamped to three. */
  description?: React.ReactNode;
  media?: React.ReactNode;
  /** Sizes the media box, e.g. `{ aspectRatio: 1.5 }`. */
  mediaStyle?: React.CSSProperties;
}) {
  return (
    <article
      data-slot="ds-media-tile"
      className={cn("group relative flex w-full flex-col items-center gap-ds-16", className)}
      {...props}
    >
      {media && (
        <div className="relative w-full overflow-hidden bg-ds-surface-subtle" style={mediaStyle}>
          {media}
        </div>
      )}
      <div className={cn("flex w-full flex-col items-center gap-ds-8 text-center", !media && "max-w-[600px]")}>
        {/* Title and meta line, 4px apart. */}
        <div className="flex flex-col items-center gap-ds-4">
          <DsLink
            href={href}
            className="text-h3 text-ds-fg group-hover:underline focus-visible:underline after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </DsLink>
          {meta && <p className="text-p text-ds-fg-muted">{meta}</p>}
        </div>
        {description && <p className="line-clamp-3 w-full text-prose text-ds-fg-muted">{description}</p>}
      </div>
    </article>
  );
}
