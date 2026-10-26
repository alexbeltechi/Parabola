import { cn } from "../cn";

/** Parabola divider: a 1px `ds-border` rule between sections. */
export function DsDivider({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr data-slot="ds-divider" className={cn("w-full border-0 border-t border-ds-border", className)} {...props} />;
}
