import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola empty state: what an empty section says, as one muted line and
 * optionally one action under it (a button), centred both ways in the space
 * it's given. Give it a flex column parent with room to grow (it takes
 * `flex-1`), so it sits in the middle of the section, not under the header.
 * One line, never a title plus a sentence.
 */
export function DsEmptyState({
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** The one line: "No posts yet", "Choose a post or create a new one". */
  children: React.ReactNode;
  /** One button, e.g. "New post". */
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="ds-empty-state"
      className={cn("flex min-h-40 flex-1 flex-col items-center justify-center gap-4 p-5 text-center", className)}
      {...props}
    >
      <p className="text-p text-ds-fg-muted">{children}</p>
      {action}
    </div>
  );
}
