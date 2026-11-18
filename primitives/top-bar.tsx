import * as React from "react";
import { cn } from "../cn";
import type { DsNavSurface } from "../nav-style";

/**
 * Parabola top bar: the bar pinned to the top of a page, holding its title
 * and actions in rows (a title row, then a search or filters row if the page
 * has one). Rows set their own sides (`px-5`) and are compact: 12px above
 * and below (`py-3`), as on /parabola and every admin page. Three surfaces:
 *
 * - blur (the default): the nav fade (`ds-nav-fade`), content blurring
 *   softly away beneath it; clicks pass through the fade's empty space to
 *   the content. Every page's bar, admin and site, wears it.
 * - solid: the page colour and nothing else, no rule; content scrolls away
 *   beneath it. A bar that wants a rule adds its own (`border-b border-ds-border`).
 * - transparent: nothing behind it, for a bar over a picture or the page's
 *   own top.
 *
 * A site's nav takes its surface from the theme (`theme.nav.surface`, nav-style.ts).
 */
export type DsTopBarSurface = DsNavSurface;

const SURFACES: Record<DsTopBarSurface, string> = {
  solid: "bg-ds-bg",
  transparent: "",
  blur: "pointer-events-none ds-nav-fade pb-5 [&>*]:pointer-events-auto",
};

export function DsTopBar({
  surface = "blur",
  className,
  ...props
}: React.ComponentProps<"header"> & { surface?: DsTopBarSurface }) {
  return (
    <header
      data-slot="ds-top-bar"
      data-surface={surface}
      className={cn("sticky top-0 z-20 flex flex-col", SURFACES[surface], className)}
      {...props}
    />
  );
}
