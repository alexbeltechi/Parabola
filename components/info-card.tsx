import * as React from "react";
import { Info, type LucideIcon } from "lucide-react";
import { cn } from "../cn";

/**
 * Parabola info card: a side note on a screen, set apart on the subtle
 * surface with an icon: another way to do the thing at hand, a tip, what
 * happens next. A title of a few words, then one short line (muted) and,
 * if needed, an action. Not for errors (those are toasts or field errors)
 * and not for page copy on the site.
 */
export function DsInfoCard({
  icon: Icon = Info,
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: LucideIcon;
  /** A few words: "Made for agents". */
  title?: React.ReactNode;
}) {
  return (
    <div
      data-slot="ds-info-card"
      className={cn("flex gap-3 rounded-ds-lg bg-ds-surface-subtle p-4 text-p text-ds-fg", className)}
      {...props}
    >
      <Icon aria-hidden className="mt-1 size-4 shrink-0 text-ds-fg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {title && <p className="text-p text-ds-fg">{title}</p>}
        <div className="flex flex-col gap-3 text-ds-fg-muted">{children}</div>
      </div>
    </div>
  );
}
