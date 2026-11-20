import * as React from "react";
import { cn } from "../cn";
import { DsButton } from "./button";

/**
 * Parabola floating bar: the newer kind of nav, buttons that float over the
 * page with no bar behind them. The page's title sits in the middle as a
 * button of its own (`DsFloatingTitle`), what goes back on the left (only
 * when there's somewhere to go back to), and the page's options on the
 * right. The buttons are the default ones, on their own surface with a blur,
 * so they read over anything.
 *
 * Behind them, a soft fade of the page colour (`ds-nav-float`) with a very
 * faint blur, so what scrolls under the top of the page quietens rather
 * than meeting a hard edge. Clicks pass through everything but the buttons.
 *
 * `column`: the width the page's content keeps (a reading column, 600px).
 * The fade still runs edge to edge, but the buttons sit in a centred column
 * that wide, so a site's name on the left and its links on the right line up
 * with the page under them. A site puts its name in `leading` and leaves the
 * middle empty; an app's page puts its title in the middle.
 *
 * The title shrinks first: on a narrow screen it truncates, the sides keep
 * their buttons. A site's nav takes it as `theme.nav.style: "floating"`
 * (nav-style.ts); the other style is the bar, `DsTopBar`.
 */
export function DsFloatingBar({
  leading,
  title,
  trailing,
  column,
  className,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  /** The page's content width, in px: the buttons keep to a centred column that wide. */
  column?: number;
  /** Left: back, when the page sits under another. */
  leading?: React.ReactNode;
  /** Middle: the page's title, a `DsFloatingTitle`. */
  title?: React.ReactNode;
  /** Right: the page's options. */
  trailing?: React.ReactNode;
}) {
  return (
    <header
      data-slot="ds-floating-bar"
      className={cn("pointer-events-none sticky top-0 z-20 block px-4 pt-3 pb-5 ds-nav-float", className)}
      {...props}
    >
      <div className="mx-auto grid w-full grid-cols-[1fr_minmax(0,max-content)_1fr] items-center gap-ds-8" style={{ maxWidth: column }}>
        <div className="flex min-w-0 items-center justify-start gap-ds-8 [&>*]:pointer-events-auto">{leading}</div>
        <div className="flex min-w-0 justify-center [&>*]:pointer-events-auto">{title}</div>
        <div className="flex min-w-0 items-center justify-end gap-ds-8 [&>*]:pointer-events-auto">{trailing}</div>
      </div>
    </header>
  );
}

/** The title in a floating bar: a button of its own, its words cut short when there's no room. */
export function DsFloatingTitle({ children, className, ...props }: React.ComponentProps<typeof DsButton>) {
  return (
    <DsButton className={cn("max-w-full min-w-0", className)} {...props}>
      <span className="truncate">{children}</span>
    </DsButton>
  );
}
