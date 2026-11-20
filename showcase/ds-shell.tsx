"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, House, Menu, PanelLeftClose, PanelLeftOpen, PanelRightOpen, X } from "lucide-react";
import { DsAccordionGroup } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { DsSearch } from "../primitives/field";
import { DsMenu } from "../primitives/nav";
import { DsFloatingBar, DsFloatingTitle } from "../primitives/floating-bar";
import { DsNavGroup, DsNavItem } from "../primitives/nav-item";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsToaster } from "../primitives/toast";
import { DS_THEME_SCOPE } from "../theme";
import { DsModeScope } from "../provider";
import { DS_GROUPS, DS_TIERS, dsHref, type DsGroup } from "./registry";
import { ThemeExport } from "./theme-export";
import { useThemeLook } from "./theme-look";
import { PanelAllContext, PanelFooterSlotContext, PanelSlotContext, ShellSidesContext, ThemeEditorProvider, ThemeHeaderActions, useThemeEditor, type ShellSides } from "./theme-editor";

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
        size="small"
        // The chevron the group rows carry, barely there: there's nothing to open, but
        // it keeps the row lined up with the groups around it.
        expandable
        className="[&>svg:first-child]:opacity-10"
      >
        {group.label}
      </DsNavItem>
    ) : (
      <DsNavGroup
        key={group.slug}
        label={group.label}
        iconLeft={group.icon}
        meta={group.pages.length}
        size="small"
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
/** Top left of the sidebar: a menu to Parabola's home or back to the website; just Home when there's no website. */
function ShellMenu({ backHref }: { backHref: string | null }) {
  const router = useRouter();
  // With no website to go back to there's one place to go: a plain Home button, not a menu of one.
  if (!backHref) return <DsButton size="small" variant="text" iconLeft={House} aria-label="Home" href="/parabola" />;
  return (
    <DsDropdown>
      <DsDropdownTrigger asChild>
        <DsButton size="small" iconLeft={Menu} aria-label="Menu" />
      </DsDropdownTrigger>
      <DsDropdownContent align="start">
        <DsDropdownItem iconLeft={House} onSelect={() => router.push("/parabola")}>
          Home
        </DsDropdownItem>
        <DsDropdownItem iconLeft={ArrowLeft} onSelect={() => router.push(backHref)}>
          Back to website
        </DsDropdownItem>
      </DsDropdownContent>
    </DsDropdown>
  );
}

/** Opens the sections menu, below md: the page's floating bar has the button for it. */
const ShellMenuContext = React.createContext<() => void>(() => {});

type Sides = ShellSides;
/** Where the sides were once remembered; cleared on load. */
const SIDES_KEY = "ds-shell-sides";

export function DsShell({
  children,
  backHref = "/",
}: {
  children: React.ReactNode;
  /** Where "Back to website" goes; null leaves it out (Parabola's own site, where the showcase is the website). */
  backHref?: string | null;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  // Open on every visit: collapsing (the buttons, ⌘.) lasts while the page does, never into the next visit, so the
  // UI is never hidden on landing. (It used to be remembered, and a page drawn open closed a moment after loading.)
  const [collapsed, setCollapsed] = React.useState<Sides>({ left: false, right: false });
  React.useEffect(() => {
    try {
      localStorage.removeItem(SIDES_KEY);
    } catch {}
  }, []);
  const setSides = React.useCallback((next: (sides: Sides) => Sides) => setCollapsed(next), []);
  const toggleSide = React.useCallback((side: keyof Sides) => setSides((sides) => ({ ...sides, [side]: !sides[side] })), [setSides]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "." || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      // Both at once: closed if either is open, opened only when both are closed.
      setSides((sides) => (sides.left && sides.right ? { left: false, right: false } : { left: true, right: true }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSides]);
  // A board measures how much of it runs under the sidebar when the window changes size: tell it this did too.
  React.useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [collapsed.left]);
  const min = collapsed.left;
  const sidesValue = React.useMemo(() => ({ collapsed, toggle: toggleSide }), [collapsed, toggleSide]);

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
      {/* Frosted (`ds-frosted`), so a board running under it shows through, softly. A layer of its own
          (translateZ), so the board panning under it never paints over it for a frame. */}
      <aside data-slot="ds-sidebar" className={`fixed inset-y-0 left-0 z-30 hidden w-[240px] [transform:translateZ(0)] flex-col gap-4 overflow-y-auto ds-scroll-quiet border-r border-ds-border/60 p-5 ds-frosted ${min ? "" : "md:flex"}`}>
        <div className="flex items-center justify-between">
          <ShellMenu backHref={backHref} />
          <div className="flex items-center gap-ds-4">
            <DsThemeToggle size="small" />
            <DsButton size="small" iconLeft={PanelLeftClose} aria-label="Collapse the sidebar" title="Collapse the sidebar (⌘. for both sides)" onClick={() => toggleSide("left")} />
          </div>
        </div>
        <SidebarNav />
      </aside>
      {/* The sidebar, collapsed: one small button at the top left, in line with the header's, its name and the icon that
          opens it again. The panel's is its twin, in the header at the right. */}
      {min && (
        <DsButton size="small" iconLeft={PanelLeftOpen} className="fixed top-3 left-5 z-30 hidden md:inline-flex" title="Expand the sidebar (⌘. for both sides)" onClick={() => toggleSide("left")}>
          Parabola
        </DsButton>
      )}

      {/* Below md the sections are in a menu, opened from the page's floating bar. It's modal, so it carries its own
          bar: back to the website on the left (moving between sections is the menu's job, not a back button's),
          Parabola's home in the middle, the light or dark toggle and close on the right. */}
      <DsMenu open={menuOpen} onClose={closeMenu} className="items-stretch justify-start overflow-y-auto ds-scroll-quiet pb-10 md:hidden">
        <DsFloatingBar
          leading={backHref ? <DsButton size="small" iconLeft={ArrowLeft} aria-label="Back to website" href={backHref} /> : null}
          title={
            <DsFloatingTitle size="small" href="/parabola" onClick={closeMenu}>
              Parabola
            </DsFloatingTitle>
          }
          trailing={
            <>
              <DsThemeToggle size="small" />
              <DsButton size="small" iconLeft={X} aria-label="Close menu" onClick={closeMenu} />
            </>
          }
        />
        <div className="px-5">
          <SidebarNav onNavigate={closeMenu} />
        </div>
      </DsMenu>

      <ShellMenuContext.Provider value={() => setMenuOpen(true)}>
        <ShellSidesContext.Provider value={sidesValue}>
          <main className={`flex min-h-screen flex-col bg-ds-bg ${min ? "" : "md:ml-[240px]"}`}>{children}</main>
        </ShellSidesContext.Provider>
      </ShellMenuContext.Provider>
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
/** What the open theme is, as the Theme page's title: its style, Custom, or a kept theme's name (theme-look.ts). */
function ThemeTitle() {
  return <>{useThemeLook().name}</>;
}

/** The panel card's colour: the page colour in both modes, white on the grey canvas in the light and the darkest
 *  layer in the dark, where a lighter card left its picked pills with too little to stand out from. */
const PANEL_CARD = "bg-ds-bg";

export function DsCanvas({
  group,
  title,
  themeTitle = false,
  board = false,
  children,
}: {
  group: string;
  title: string;
  /** The page is a board (showcase/board.tsx): it fills the canvas edge to edge on the UI's own colours and scrolls itself; its frames wear the theme. */
  board?: boolean;
  /** Show the open theme's name as the title (the Theme page: "Theme" over "Parabola"). */
  themeTitle?: boolean;
  children: React.ReactNode;
}) {
  const [slot, setSlot] = React.useState<HTMLElement | null>(null);
  const [footer, setFooter] = React.useState<HTMLElement | null>(null);
  const { pickedMode, setPreviewMode } = useThemeEditor();
  // Collapse all, then Expand all: every accordion on the page (the panel's sections) at once.
  const [allOpen, setAllOpen] = React.useState(true);
  const [version, setVersion] = React.useState(0);
  const toggleAll = () => {
    setAllOpen((o) => !o);
    setVersion((v) => v + 1);
  };
  const openMenu = React.useContext(ShellMenuContext);
  const { collapsed, toggle: toggleSide } = React.useContext(ShellSidesContext);
  const min = collapsed.left;
  const folded = collapsed.right;
  // Whether the page put anything in the panel: only then is there a panel to fold and open again.
  const [hasPanel, setHasPanel] = React.useState(false);
  React.useEffect(() => {
    if (!slot) return;
    const check = () => setHasPanel(slot.childElementCount > 0);
    check();
    const observer = new MutationObserver(check);
    observer.observe(slot, { childList: true });
    return () => observer.disconnect();
  }, [slot]);
  const all = React.useMemo(() => ({ open: allOpen, toggle: toggleAll }), [allOpen]);
  // The page's name for its title button: the section, then the page when it has its own ("Buttons · Label button").
  const titleText = themeTitle ? group : group === title ? title : `${group} · ${title}`;
  const name = themeTitle ? (
    <>
      {group} · <ThemeTitle />
    </>
  ) : (
    titleText
  );
  // How tall the pinned header is, for anything on the page that pins itself under it (--ds-canvas-top below).
  const [header, setHeader] = React.useState<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  React.useEffect(() => {
    if (!header) return;
    const measure = () => setHeaderHeight(header.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [header]);
  return (
    <PanelSlotContext.Provider value={slot}>
      <PanelFooterSlotContext.Provider value={footer}>
      <PanelAllContext.Provider value={all}>
      <DsAccordionGroup open={allOpen} version={version}>
      {/* Below lg, one grid: the header pinned over the page, the panel under the page (a header sticky only within
          the page's own column would scroll away there). From lg the page fills the whole screen right of the sidebar,
          and the rest floats over it: the header's buttons along the top, over a soft fade, and the panel as one card
          on the right, under them. A page that scrolls keeps clear of both (`data-canvas`); a board runs under them. */}
      <div
        style={{ "--ds-shell-header": `${headerHeight}px` } as React.CSSProperties}
        className={`grid flex-1 grid-cols-1 grid-rows-[auto_1fr_auto] lg:relative lg:block lg:h-screen lg:flex-none ${folded ? "" : "lg:[&:has(>aside>[data-panel-slot]:not(:empty))>[data-canvas]]:pr-[432px]"}`}>
        {/* The page's floating bar: its name in the middle as a button of its own, the theme's actions on the right,
            no bar behind them, only a soft fade. On a phone it's one line: the name, cut short if need be, and two
            buttons, the theme's ⋮ (everything else is in it) and the sections menu. */}
        <div ref={setHeader} className="pointer-events-none sticky top-0 z-20 self-start lg:absolute lg:inset-x-0">
          <DsFloatingBar
            className="relative hidden px-5 md:block"
            title={<DsFloatingTitle size="small">{name}</DsFloatingTitle>}
            trailing={
              <>
                {/* The panel, folded: its name and the icon that opens it again, first among the header's buttons. */}
                {folded && hasPanel && (
                  <DsButton size="small" iconRight={PanelRightOpen} className="hidden lg:inline-flex" title="Expand the panel (⌘. for both sides)" onClick={() => toggleSide("right")}>
                    {group}
                  </DsButton>
                )}
                <ThemeHeaderActions trailing={<ThemeExport />} />
              </>
            }
          />
          <DsFloatingBar
            className="relative md:hidden"
            title={
              <DsFloatingTitle size="small" aria-label={`${titleText}: open the sections`} onClick={openMenu}>
                {name}
              </DsFloatingTitle>
            }
            trailing={
              <>
                <ThemeHeaderActions compact allOpen={allOpen} onToggleAll={toggleAll} />
                <DsButton size="small" iconLeft={Menu} aria-label="Open menu" onClick={openMenu} />
              </>
            }
          />
        </div>
        {/* The page wears the open theme (theme-editor), light or dark as the panel says; everything
            around it stays Parabola's own, in the UI's mode. */}
        {/* A board's ground is a shade darker than the UI's own grey in the light, so a frame on a pale page (paper,
            white) stands off it. */}
        {/* The page is its own layer (`isolate`): what it pins inside itself, a preview's own nav, stays under the
            floating header and the panel. */}
        {board ? (
          <div className={`relative isolate h-[75vh] min-w-0 overflow-hidden bg-[color-mix(in_srgb,var(--ds-surface)_45%,var(--ds-surface-subtle))] dark:bg-ds-surface-subtle lg:absolute lg:inset-0 lg:h-auto ${min ? "" : "md:-ml-[240px] lg:left-[-240px] lg:ml-0"}`}>
            <DsModeScope onThemeChange={setPreviewMode}>{children}</DsModeScope>
          </div>
        ) : (
        <div
          // Only once a mode is picked: until then the canvas follows the page's own
          // .dark class, set before the first paint, so it never flashes light.
          data-ds-mode={pickedMode ?? undefined}
          // --ds-canvas-top: where a bar on the page pins itself (`top-(--ds-canvas-top)`), right
          // under this header: its height, whether the page scrolls (below lg) or the canvas does
          // under the floating header (from lg). The room around the page sits on the inner box, not
          // on the canvas: a scrolling box's own padding would hold a pinned bar that far down.
          data-canvas
          className={`${DS_THEME_SCOPE} isolate flex min-w-0 flex-col bg-ds-bg [--ds-canvas-top:var(--ds-shell-header)] lg:absolute lg:inset-0 lg:overflow-y-auto ds-scroll-quiet`}>
          <div className="flex min-w-0 flex-1 items-center-safe justify-center px-6 py-12 lg:pt-[calc(var(--ds-shell-header)+48px)]">
            <DsModeScope onThemeChange={setPreviewMode}>{children}</DsModeScope>
          </div>
        </div>
        )}
        {/* The page's properties, hidden while it has none. From lg one card floating on the right, under the header's
            buttons: on the page colour, with a soft shadow and no line round it, a rule
            between its sections so folded ones still read apart. Its sections scroll; its foot (a page's main action)
            stays pinned under them, hidden while the page puts nothing there. */}
        <aside
          aria-label="Properties"
          className={`flex flex-col border-t border-ds-border [&:has(>[data-panel-slot]:empty)]:hidden lg:absolute lg:top-(--ds-shell-header) lg:right-4 lg:z-10 lg:border-t-0 ${folded ? "" : `lg:bottom-4 lg:w-[400px] lg:overflow-hidden lg:rounded-[20px] lg:shadow-ds-raised ${PANEL_CARD}`}`}
        >
          <div
            ref={setSlot}
            data-panel-slot
            className={`flex min-w-0 flex-col gap-ds-16 overflow-x-hidden p-ds-16 lg:min-h-0 lg:flex-1 lg:overflow-y-auto ds-scroll-quiet lg:p-ds-20 [&>*+*]:border-t [&>*+*]:border-ds-border [&>*+*]:pt-ds-16 ${folded ? "lg:hidden" : ""}`}
          />
          <div ref={setFooter} className={`sticky bottom-0 border-t border-ds-border p-ds-16 empty:hidden ${folded ? "lg:hidden" : ""} ${PANEL_CARD}`} />
        </aside>
      </div>
      </DsAccordionGroup>
      </PanelAllContext.Provider>
      </PanelFooterSlotContext.Provider>
    </PanelSlotContext.Provider>
  );
}
