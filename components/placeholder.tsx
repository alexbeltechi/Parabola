import { cn } from "../cn";

/**
 * Parabola placeholder: a calm grey block standing in for an image or video
 * still to come, with an optional note saying what goes there. For drafts,
 * previews and wireframes; never shown on a live page.
 *
 * `ratio` is a CSS aspect ratio ("3/2", "1/1", "16/9"); leave it out and size
 * the block yourself (a height, or filling its grid cell).
 */
export function DsPlaceholder({
  ratio,
  note,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { ratio?: string; note?: React.ReactNode }) {
  return (
    <div
      data-slot="ds-placeholder"
      role="img"
      aria-label={typeof note === "string" ? note : "Image to come"}
      className={cn("flex w-full items-end rounded-[24px] bg-ds-surface-subtle p-4", className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    >
      {note && <span className="max-w-[48ch] text-small text-ds-fg-subtle">{note}</span>}
    </div>
  );
}
