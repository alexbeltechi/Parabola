import * as React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "../cn";
import { DsLink } from "../provider";

export type DsLinkListItem = {
  label: string;
  href: string;
  /** On the right, muted and smaller: a year and read time, a handle, a note. */
  meta?: string;
};

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/**
 * Parabola link list: links one a row, as a site lists its writing, its
 * pages or where to follow it (nicksaraev.com's lists; decisions,
 * 2026-10-28). Each label is in the reading size (`text-prose`) and the page
 * colour, underlined in the border colour, the underline darkening on hover;
 * its meta sits on the right in P, subtle. Links off the site open in a new
 * tab with a small ↗. `divided` puts rules between the rows (a links page);
 * `more` ends the list with one muted link and an arrow, a little apart
 * ("All 19 posts", "Learn more about me").
 *
 * Distinct from the link inside prose (the page colour, a solid underline):
 * this one is a list of places to go, so it reads quieter.
 */
export function DsLinkList({
  items,
  divided = false,
  more,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  items: DsLinkListItem[];
  divided?: boolean;
  more?: { label: string; href: string };
}) {
  return (
    <div data-slot="ds-link-list" className={cn("flex flex-col gap-ds-16", className)} {...props}>
      <ul className={cn("flex flex-col", divided && "divide-y divide-ds-border border-y border-ds-border")}>
        {items.map((item) => {
          const external = isExternal(item.href);
          const content = (
            <>
              <span className="min-w-0 text-prose text-ds-fg">
                <span className="underline decoration-ds-border underline-offset-4 transition-colors group-hover:decoration-ds-fg">
                  {item.label}
                </span>
                {external && <ArrowUpRight aria-hidden className="ml-0.5 inline size-4 align-baseline text-ds-fg-subtle" />}
              </span>
              {item.meta && <span className="shrink-0 text-p text-ds-fg-subtle tabular-nums">{item.meta}</span>}
            </>
          );
          const rowClass = "group flex items-baseline justify-between gap-4";
          return (
            <li key={`${item.href}-${item.label}`} className={divided ? "py-3" : "py-1.5"}>
              {external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                  {content}
                </a>
              ) : (
                <DsLink href={item.href} className={rowClass}>
                  {content}
                </DsLink>
              )}
            </li>
          );
        })}
      </ul>
      {more && (
        <DsLink
          href={more.href}
          className="inline-flex items-center gap-1 self-start pt-ds-8 text-p text-ds-fg-muted transition-colors hover:text-ds-fg"
        >
          {more.label}
          <ArrowRight aria-hidden className="size-4" />
        </DsLink>
      )}
    </div>
  );
}
