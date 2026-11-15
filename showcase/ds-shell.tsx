"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, ChevronsDownUp, ChevronsUpDown, House, Menu } from "lucide-react";
import { DsAccordionGroup } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { DsSearch } from "../primitives/field";
import { DsMenu, DsNavBar } from "../primitives/nav";
import { DsNavGroup, DsNavItem } from "../primitives/nav-item";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsToaster } from "../primitives/toast";
import { DsTopBar } from "../primitives/top-bar";
import { DS_THEME_SCOPE } from "../theme";
import { DsModeScope } from "../provider";
import { DS_GROUPS, DS_TIERS, dsHref, type DsGroup } from "./registry";
import { PanelFooterSlotContext, PanelSlotContext, ThemeEditorProvider, ThemeHeaderActions, useThemeEditor } from "./theme-editor";

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
/** Top left of the sidebar: a menu to Parabola's home or back to the website. */
function ShellMenu() {
  const router = useRouter();
  return (
    <DsDropdown>
      <DsDropdownTrigger asChild>
        <DsButton size="small" iconLeft={Menu} aria-label="Menu" />
      </DsDropdownTrigger>
      <DsDropdownContent align="start">
        <DsDropdownItem iconLeft={House} onSelect={() => router.push("/parabola")}>
          Home
        </DsDropdownItem>
        <DsDropdownItem iconLeft={ArrowLeft} onSelect={() => router.push("/")}>
          Back to website
        </DsDropdownItem>
      </DsDropdownContent>
    </DsDropdown>
  );
}

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
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col gap-4 overflow-y-auto border-r border-ds-border bg-ds-surface-subtle p-5 md:flex">
        <div className="flex items-center justify-between">
          <ShellMenu />
          <DsThemeToggle size="small" />
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

      <main className="flex min-h-screen flex-col bg-ds-bg pt-[76px] md:ml-[240px] md:pt-0">
        {children}
      </main>
      {/* One toaster for every page: the theme's, and the Toast specimen's. */}
      <DsToaster />
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
/** The open theme's name, as the Theme page's title. */
function ThemeTitle() {
  return <>{useThemeEditor().entry.name}</>;
}

export function DsCanvas({
  group,
  title,
  themeTitle = false,
  children,
}: {
  group: string;
  title: string;
  /** Show the open theme's name as the title (the Theme page: "Theme" over "Parabola"). */
  themeTitle?: boolean;
  children: React.ReactNode;
}) {
  const [slot, setSlot] = React.useState<HTMLElement | null>(null);
  const [footer, setFooter] = React.useState<HTMLElement | null>(null);
  const { previewMode, setPreviewMode } = useThemeEditor();
  // Collapse all, then Expand all: every accordion on the page (the panel's sections) at once.
  const [allOpen, setAllOpen] = React.useState(true);
  const [version, setVersion] = React.useState(0);
  return (
    <PanelSlotContext.Provider value={slot}>
      <PanelFooterSlotContext.Provider value={footer}>
      <DsAccordionGroup open={allOpen} version={version}>
      {/* One grid for the header, the page and its panel, so the header stays pinned
          over all of it: on phones the panel comes under the page, and a header
          sticky only within the page's own column would scroll away there. From
          lg the header runs across the page and the panel, a rule under it, and
          the two scroll on their own beneath it, the panel a column on the right
          only while the page puts something in it (otherwise the page takes the width). */}
      <div className="grid flex-1 grid-cols-1 grid-rows-[auto_1fr_auto] lg:h-screen lg:flex-none lg:grid-cols-[minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:[&:has(>aside>div:first-child:not(:empty))]:grid-cols-[minmax(0,1fr)_400px]">
        {/* Pinned on the page colour (as the panel is; the sidebar sits on the surface), so the page never shows through behind
            the title and the theme's actions. Below md it sits right under the fixed
            nav bar (76px, its colour reaching up behind the bar), with no padding of
            its own above. */}
        <DsTopBar surface="solid" className="top-[76px] self-start before:absolute before:inset-x-0 before:bottom-full before:h-[76px] before:bg-ds-bg md:top-0 md:before:hidden lg:col-span-full lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-ds-16 px-5 py-3">
            <div className="flex min-w-0 flex-col">
              <p className="text-small text-ds-fg-subtle">{group}</p>
              <h1 className="text-p text-ds-fg">{themeTitle ? <ThemeTitle /> : title}</h1>
            </div>
            {/* Collapse all / Expand all first, then the theme's Undo, Redo, Save, Publish and ⋮ menu, wherever you are. */}
            <ThemeHeaderActions
              leading={
                <DsButton
                  size="small"
                  variant="text"
                  iconLeft={allOpen ? ChevronsDownUp : ChevronsUpDown}
                  aria-label={allOpen ? "Collapse all" : "Expand all"}
                  title={allOpen ? "Collapse all" : "Expand all"}
                  onClick={() => {
                    setAllOpen((o) => !o);
                    setVersion((v) => v + 1);
                  }}
                />
              }
            />
          </div>
        </DsTopBar>
        {/* The page wears the open theme (theme-editor), light or dark as the panel says; everything
            around it stays Parabola's own, in the UI's mode. */}
        <div
          data-ds-mode={previewMode}
          className={`${DS_THEME_SCOPE} flex min-w-0 items-center-safe justify-center bg-ds-bg px-6 py-12 lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:overflow-y-auto`}>
          <DsModeScope onThemeChange={setPreviewMode}>{children}</DsModeScope>
        </div>
        {/* The page's properties; hidden while it has none. A rule between sections,
            so folded ones still read as separate. */}
        {/* Its sections scroll; its foot (a page's main action) stays pinned under them, on the panel's own colour.
            Hidden while the page puts nothing there. */}
        <aside
          aria-label="Properties"
          className="flex flex-col border-t border-ds-border [&:has(>div:first-child:empty)]:hidden lg:col-start-2 lg:row-start-2 lg:min-h-0 lg:border-t-0 lg:border-l"
        >
          <div
            ref={setSlot}
            className="flex flex-col gap-ds-16 p-ds-16 lg:min-h-0 lg:flex-1 lg:overflow-y-auto [&>*+*]:border-t [&>*+*]:border-ds-border [&>*+*]:pt-ds-16"
          />
          <div ref={setFooter} className="sticky bottom-0 border-t border-ds-border bg-ds-bg p-ds-16 empty:hidden" />
        </aside>
      </div>
      </DsAccordionGroup>
      </PanelFooterSlotContext.Provider>
    </PanelSlotContext.Provider>
  );
}
