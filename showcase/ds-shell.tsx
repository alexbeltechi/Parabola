"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, ChevronLeft } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsSearch } from "../primitives/field";
import { DsMenu, DsNavBar } from "../primitives/nav";
import { DsNavGroup, DsNavItem } from "../primitives/nav-item";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DS_GROUPS, DS_TIERS, dsHref, type DsGroup } from "./registry";
import { PanelSlotContext, ThemeEditorProvider, ThemeHeaderActions } from "./theme-editor";

/** Sidebar contents: search, then each tier's label and its collapsible groups. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const currentGroup = DS_GROUPS.find((g) => g.pages.some((p) => pathname === dsHref(g, p)))?.slug;
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(currentGroup ? [currentGroup] : []));

  // Arriving on a page (from a link or the back button) opens its group.
  React.useEffect(() => {
    if (currentGroup) setOpen((prev) => (prev.has(currentGroup) ? prev : new Set(prev).add(currentGroup)));
  }, [currentGroup]);

  const q = query.trim().toLowerCase();
  const tiers = DS_TIERS.map((tier) => ({
    ...tier,
    groups: tier.groups
      .map((group) => ({
        ...group,
        pages: q
          ? group.pages.filter((p) => p.label.toLowerCase().includes(q) || group.label.toLowerCase().includes(q))
          : group.pages,
      }))
      .filter((group) => group.pages.length > 0),
  })).filter((tier) => tier.groups.length > 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <DsSearch aria-label="Search components" value={query} onValueChange={setQuery} className="w-full" />
      <nav aria-label="Parabola" className="flex flex-col gap-ds-4">
        {tiers.map((tier, i) => (
          <React.Fragment key={tier.label ?? i}>
            {tier.label && <p className="px-3 pt-5 pb-1 text-small text-ds-fg-subtle">{tier.label}</p>}
            {tier.groups.map((group) => renderGroup(group))}
          </React.Fragment>
        ))}
        {tiers.length === 0 && <p className="px-3 py-2 text-p text-ds-fg-subtle">No matches</p>}
      </nav>
    </div>
  );

  function renderGroup(group: DsGroup) {
    return group.single ? (
      <DsNavItem
        key={group.slug}
        href={dsHref(group, group.pages[0])}
        iconLeft={group.icon}
        selected={pathname === dsHref(group, group.pages[0])}
        onClick={onNavigate}
        // The chevron the group rows carry, dimmed: there's nothing to open, but
        // it keeps the row from reading as a sub-item of the group above.
        expandable
        className="[&>svg:first-child]:opacity-40"
      >
        {group.label}
      </DsNavItem>
    ) : (
      <DsNavGroup
        key={group.slug}
        label={group.label}
        iconLeft={group.icon}
        meta={group.pages.length}
        // While searching, every group with a match stays open.
        open={q ? true : open.has(group.slug)}
        onOpenChange={(isOpen) => {
          if (q) return;
          setOpen((prev) => {
            const next = new Set(prev);
            if (isOpen) next.add(group.slug);
            else next.delete(group.slug);
            return next;
          });
          // Opening a group lands on its first page, as Storybook does,
          // unless you're already on one of its pages.
          if (isOpen && group.slug !== currentGroup) router.push(dsHref(group, group.pages[0]));
        }}
      >
        {group.pages.map((page) => {
          const href = dsHref(group, page);
          return (
            <DsNavItem
              key={page.slug}
              href={href}
              size="small"
              iconLeft={Bookmark}
              selected={pathname === href}
              onClick={onNavigate}
            >
              {page.label}
            </DsNavItem>
          );
        })}
      </DsNavGroup>
    );
  }
}

/**
 * The /parabola frame, Storybook-style: a 240px sidebar (back, theme, search, nav)
 * on the page colour, and everything to its right a `ds-surface-subtle`
 * canvas holding the current page. Below `md` the sidebar moves into the
 * hamburger menu.
 */
export function DsShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  // The menu (and the scroll lock it holds) mustn't linger if the window
  // grows past the breakpoint where the sidebar takes over.
  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = () => query.matches && setMenuOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <ThemeEditorProvider>
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col gap-4 overflow-y-auto p-5 md:flex">
        <div className="flex items-center justify-between">
          <DsButton href="/" iconLeft={ChevronLeft} aria-label="Back to site" />
          <DsThemeToggle />
        </div>
        <SidebarNav />
      </aside>

      <div className="md:hidden">
        <DsNavBar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((o) => !o)} />
        <DsMenu
          open={menuOpen}
          onClose={closeMenu}
          className="items-stretch justify-start overflow-y-auto px-5 pt-[76px] pb-10"
        >
          {/* The menu is modal, so it carries its own copy of the bar for closing it. */}
          <DsNavBar menuOpen onMenuToggle={closeMenu} />
          <SidebarNav onNavigate={closeMenu} />
        </DsMenu>
      </div>

      <main className="flex min-h-screen flex-col bg-ds-surface-subtle pt-[76px] md:ml-[240px] md:pt-0">
        {children}
      </main>
    </ThemeEditorProvider>
  );
}

/**
 * One /parabola page on the canvas: its name top left, the theme's actions
 * top right, the content centred, and, when the page has any, its options in
 * a panel on the right, set apart by a rule (Linear's
 * properties panel: collapsible sections of controls; under the content below
 * `lg`). Pages put things there with `InPanel` (theme-editor.tsx).
 */
export function DsCanvas({ group, title, children }: { group: string; title: string; children: React.ReactNode }) {
  const [slot, setSlot] = React.useState<HTMLElement | null>(null);
  return (
    <PanelSlotContext.Provider value={slot}>
      <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Pinned over the page, which fades out beneath it (`ds-nav-fade`), as in the
            admin. The canvas isn't the page colour, so the fade takes the canvas's own
            (`--ds-bg` is reset here; nothing in the bar draws with it otherwise). Below
            md it sits under the fixed nav bar (76px). Clicks pass through the gradient. */}
        <header className="pointer-events-none sticky top-[76px] z-20 flex items-center justify-between gap-4 ds-nav-fade px-6 pt-6 pb-5 [--ds-bg:var(--ds-surface-subtle)] md:top-0 [&>*]:pointer-events-auto">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-small text-ds-fg-subtle">{group}</p>
            <h1 className="text-h3 text-ds-fg">{title}</h1>
          </div>
          {/* The theme's Undo, Restore default and Publish, wherever you are. */}
          <ThemeHeaderActions />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-12">{children}</div>
      </div>
      {/* The page's properties; hidden while it has none. */}
      <aside
        ref={setSlot}
        aria-label="Properties"
        className="flex flex-col gap-ds-20 border-t border-ds-border p-ds-20 empty:hidden lg:sticky lg:top-0 lg:h-screen lg:w-[300px] lg:shrink-0 lg:overflow-y-auto lg:border-t-0 lg:border-l"
      />
      </div>
    </PanelSlotContext.Provider>
  );
}
