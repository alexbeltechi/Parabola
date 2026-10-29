"use client";

import * as React from "react";
import { ChevronRight, Copy, Moon, MoreVertical, Pencil, Plus, RotateCcw, Sun, Trash2 } from "lucide-react";
import { DsAccordion } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsConfirmDialog, DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { DsField, DsInput, DsTextarea } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { dsToast } from "../primitives/toast";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsInfoCard } from "../components/info-card";
import { DsLinkList } from "../components/link-list";
import { dsFontOptions } from "../components/font-pairing";
import { DS_DEFAULT_COLOURS, DS_ICON_LIBRARIES, dsColourShown, dsHexToHsv, dsHsvToHex, dsNormalizeHex, type DsColourKind, type DsThemeColour, type DsThemeColours } from "../colours";
import { DsColourWheel } from "../components/colour-wheel";
import { cn } from "../cn";
import { DS_DEFAULT_RADIUS, DS_RADII, DS_RADIUS_MAX, dsRadiusPx, type DsRadius } from "../radius";
import {
  DS_BODY_FAMILY,
  DS_DEFAULT_THEME,
  DS_DEFAULT_THEME_ID,
  DS_HEADING_FAMILY,
  dsThemeExport,
  parseDsThemeConfig,
  parseDsThemeExport,
  type DsThemeConfig,
} from "../theme";
import { InPanel, InPanelFooter, PanelSection, RESTORE, useThemeEditor } from "./theme-editor";

/** The theme's colours on the wheel, in the order each is based on the one before. */
const WHEEL: { kind: DsColourKind; label: string }[] = [
  { kind: "theme", label: "Primary colour" },
  { kind: "surface", label: "Surface" },
  { kind: "text", label: "Secondary colour" },
  { kind: "button", label: "Buttons" },
  { kind: "accent", label: "Accent colour" },
];

/**
 * The theme's five colours on one wheel, for the light or the dark theme
 * (whichever the preview is in). Every colour is a point: its own as a
 * solid dot, one still based on another (the surface on the primary
 * colour, buttons on the secondary, the accent on the buttons; in dark,
 * each on the light one) faint. Drag a point to give it a colour of its
 * own; hover the disc for a plus, and a click there gives the next
 * based colour its own, where you clicked. Under the wheel, the five in a
 * list: pick one to move it with the arcs or type its hex, or put it back
 * to what it's based on.
 */
function ColourWheelChoice({
  colours,
  mode,
  onChange,
}: {
  colours: DsThemeColours;
  mode: "light" | "dark";
  onChange: (colours: DsThemeColours) => void;
}) {
  const pick = mode === "light" ? "light" : "dark";
  const shiftKey = mode === "light" ? "lightShift" : "darkShift";
  const [selected, setSelected] = React.useState<DsColourKind>("theme");
  const set = (kind: DsColourKind, next: Partial<DsThemeColour>) => onChange({ ...colours, [kind]: { ...colours[kind], ...next } });
  const basis = (kind: DsColourKind) => (mode === "dark" ? "light theme" : LIGHT_BASIS[kind]);
  const based = (kind: DsColourKind) => colours[kind][pick] === null && basis(kind) !== null;
  const shown = (kind: DsColourKind) => dsColourShown(colours, kind, mode);
  // A click on the disc gives the next based colour its own: the primary first in dark, then on down the list.
  const next = WHEEL.find((w) => based(w.kind));
  const chosen = WHEEL.find((w) => w.kind === selected) ?? WHEEL[0];
  const [text, setText] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  return (
    <div className="flex flex-col gap-ds-16">
      <DsColourWheel
        points={WHEEL.map((w) => ({ id: w.kind, label: w.label, colour: shown(w.kind), based: based(w.kind) }))}
        selected={selected}
        onSelect={(id) => setSelected(id as DsColourKind)}
        onChange={(id, hex) => set(id as DsColourKind, { [pick]: hex })}
        addLabel={next && `Add ${next.label}`}
        onAdd={
          next &&
          ((hue, saturation) => {
            // Pages and cards keep their brightness; text, buttons and the accent come out as colour, not black.
            const { v } = dsHexToHsv(shown(next.kind));
            const page = next.kind === "theme" || next.kind === "surface";
            set(next.kind, { [pick]: dsHsvToHex(hue, saturation, page ? v : Math.max(v, 0.85)) });
            setSelected(next.kind);
          })
        }
      />
      <DsInput
        aria-label={`${chosen.label} hex`}
        className="w-full font-mono"
        value={editing ? text : shown(chosen.kind)}
        onFocus={() => {
          setText(shown(chosen.kind));
          setEditing(true);
        }}
        onBlur={() => setEditing(false)}
        onChange={(e) => {
          setText(e.target.value);
          const hex = dsNormalizeHex(e.target.value);
          if (hex) set(chosen.kind, { [pick]: hex });
        }}
      />
      <ul className="flex flex-col">
        {WHEEL.map((w) => {
          const own = colours[w.kind][pick] !== null;
          const reset = basis(w.kind) ?? "Parabola's";
          return (
            <li key={w.kind} className="flex items-center gap-ds-4">
              <button
                type="button"
                aria-pressed={selected === w.kind}
                onClick={() => setSelected(w.kind)}
                className={cn(
                  "-mx-ds-8 flex h-9 min-w-0 flex-1 items-center gap-ds-8 rounded-ds-control px-ds-8 text-left text-p ds-focus ds-hover",
                  selected === w.kind && "bg-ds-surface-subtle"
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_var(--ds-border)]", based(w.kind) && "opacity-50")}
                  style={{ backgroundColor: shown(w.kind) }}
                />
                <span className="truncate text-ds-fg">{w.label}</span>
                <span className="ml-auto truncate text-small text-ds-fg-muted">
                  {based(w.kind) ? `Based on ${basis(w.kind)}` : shown(w.kind)}
                </span>
              </button>
              {own && (
                <DsButton
                  size="small"
                  variant="text"
                  iconLeft={RotateCcw}
                  aria-label={basis(w.kind) ? `${w.label}: based on ${reset} again` : `${w.label}: Parabola's own again`}
                  title={basis(w.kind) ? `Based on ${reset} again` : "Parabola's own again"}
                  onClick={() => set(w.kind, { [pick]: null, [shiftKey]: undefined })}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * A panel section's ⋮, at its header's right: Restore puts that part of the
 * open theme back to Parabola's, with Undo in the toast.
 */
function SectionRestore({
  section,
  theme,
  setTheme,
  restore,
}: {
  section: string;
  theme: DsThemeConfig;
  setTheme: (theme: DsThemeConfig) => void;
  restore: (theme: DsThemeConfig) => DsThemeConfig;
}) {
  return (
    <DsDropdown>
      <DsDropdownTrigger asChild>
        <DsButton size="small" variant="text" iconLeft={MoreVertical} aria-label={`More for ${section}`} />
      </DsDropdownTrigger>
      <DsDropdownContent align="end">
        <DsDropdownItem
          iconLeft={RotateCcw}
          onSelect={() => {
            const before = theme;
            setTheme(restore(theme));
            dsToast(`${section} restored`, { action: { label: "Undo", onClick: () => setTheme(before) } });
          }}
        >
          Restore
        </DsDropdownItem>
      </DsDropdownContent>
    </DsDropdown>
  );
}

/** The theme dropdown's last option, which adds a theme rather than opening one. */
const ADD_THEME = "__add-theme";

/**
 * The open theme as code, folded at the panel's foot: a full export
 * (`dsThemeExport`) a person or an AI can build from as it is (every colour
 * by its role in light and dark, the fonts, the type scale, the corners) and
 * Parabola can read back. It shows its first lines; a click in selects it
 * all. Copy it to keep it, share it or hand it to a prompt; paste one in
 * (or just its settings) and it's applied at once.
 */
function ThemeCode({ theme, name, setTheme }: { theme: DsThemeConfig; name: string; setTheme: (theme: DsThemeConfig) => void }) {
  const code = React.useMemo(() => JSON.stringify(dsThemeExport(theme, name), null, 2), [theme, name]);
  const [text, setText] = React.useState(code);
  const [invalid, setInvalid] = React.useState(false);
  // A click in selects it all (copy takes the whole theme, a paste replaces it); the mouse coming up keeps that.
  const justFocused = React.useRef(false);
  // A change made anywhere else shows here.
  const [shown, setShown] = React.useState(code);
  if (code !== shown) {
    setShown(code);
    setText(code);
    setInvalid(false);
  }
  return (
    <DsAccordion
      title="Code"
      defaultOpen={false}
      actions={
        <DsButton
          size="small"
          variant="text"
          iconLeft={Copy}
          aria-label="Copy the theme as code"
          onClick={() => navigator.clipboard.writeText(code).then(() => dsToast.success("Theme copied"))}
        />
      }
    >
      {/* The first ten lines or so, the rest a scroll away, fading out at the foot. */}
      <DsTextarea
        aria-label="The theme as code"
        className="relative w-full font-mono after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-10 after:rounded-b-ds-lg after:bg-gradient-to-t after:from-ds-field after:to-transparent [&_textarea]:max-h-[180px] [&_textarea]:overflow-y-auto [&_textarea]:text-small"
        spellCheck={false}
        value={text}
        invalid={invalid}
        onFocus={(e) => {
          e.currentTarget.select();
          justFocused.current = true;
        }}
        onMouseUp={(e) => {
          if (justFocused.current) e.preventDefault();
          justFocused.current = false;
        }}
        onChange={(e) => {
          setText(e.target.value);
          try {
            setTheme(parseDsThemeExport(JSON.parse(e.target.value)));
            setInvalid(false);
          } catch {
            setInvalid(true);
          }
        }}
      />
    </DsAccordion>
  );
}

/** What each colour is based on in the light theme until it's given its own (colours.ts); null: Parabola's own. */
const LIGHT_BASIS: Record<DsColourKind, string | null> = {
  theme: null,
  surface: "primary colour",
  text: null,
  button: "secondary colour",
  accent: "buttons",
};

/**
 * The theme's radius: None, Small, Medium, Large and Custom in one row, the
 * five sharing its width; Custom opens a field for the pixels (the cards'
 * and buttons' corner, the smaller ones scaled from it).
 */
function RadiusChoice({ radius, onChange }: { radius: DsRadius; onChange: (radius: DsRadius) => void }) {
  const custom = typeof radius === "number";
  const [text, setText] = React.useState(custom ? String(radius) : "");
  return (
    <div className="flex flex-col gap-ds-8">
      <div className="flex items-center gap-ds-4" role="group" aria-label="Radius">
        {/* Small is left out of the choices (an older theme's still reads); Custom covers what's between. */}
        {DS_RADII.filter((r) => r.id !== "small").map((r) => (
          <DsButton key={r.id} size="small" className="min-w-0 flex-1 px-0" pressed={radius === r.id} onClick={() => onChange(r.id)}>
            {r.label}
          </DsButton>
        ))}
        <DsButton
          size="small"
          className="min-w-0 flex-1 px-0"
          pressed={custom}
          onClick={() => {
            if (custom) return;
            // From the cards' corner it had, so nothing jumps but the pills.
            const px = dsRadiusPx(radius).lg;
            setText(String(px));
            onChange(px);
          }}
        >
          Custom
        </DsButton>
      </div>
      {custom && (
        <DsInput
          aria-label="Radius in pixels"
          inputMode="numeric"
          className="w-full"
          value={text}
          placeholder="24"
          meta="px"
          onChange={(e) => {
            setText(e.target.value);
            const px = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(px)) onChange(Math.min(DS_RADIUS_MAX, Math.max(0, px)));
          }}
        />
      )}
    </div>
  );
}

/** A theme's name in a dialog: for a new theme (a copy of the open one) or to rename one. */
function ThemeNameDialog({
  title,
  description,
  initial,
  action,
  onClose,
  onSave,
}: {
  title: string;
  description: string;
  initial: string;
  action: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = React.useState(initial);
  return (
    <DsDialog open onOpenChange={(open) => !open && onClose()} title={title} description={description}>
      <form
        className="flex flex-col gap-ds-20"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim());
        }}
      >
        <DsField label="Name">
          <DsInput autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Evening" />
        </DsField>
        <DsDialogActions>
          <DsButton type="submit" variant="primary" disabled={!name.trim()}>
            {action}
          </DsButton>
        </DsDialogActions>
      </form>
    </DsDialog>
  );
}

/**
 * Theme: Parabola's home screen for making a theme, in the manner of
 * shadcn's create page (decisions, 2026-10-28). The page is a site's page
 * wearing the open theme (its nav, a post's opening, buttons, a list of
 * writing, one card on the surface); the panel on
 * the right holds the theme's main choices: which theme (the site's reads
 * "(default)"; Parabola itself never changes, a change to it opens a copy,
 * Custom, to create), light or dark for the preview, the five colours, the
 * Heading and Font families' fonts, the radius and the icon library. The
 * rest is on Typography. Create theme or Save theme sits at the panel's
 * foot while there's something to keep; a site picks its theme in
 * Settings › Design. Every spacing is a Parabola one.
 */
export function ThemeSection() {
  const {
    library,
    entry,
    theme,
    setTheme,
    status,
    createTheme,
    saving,
    select,
    addTheme,
    renameTheme,
    removeTheme,
    backToParabola,
    previewMode: mode,
    setPreviewMode,
  } = useThemeEditor();
  const [naming, setNaming] = React.useState<"add" | "rename" | "create" | null>(null);
  const [restoring, setRestoring] = React.useState(false);

  const setFamilyFont = (familyId: string, font: string) =>
    setTheme({ ...theme, families: theme.families.map((f) => (f.id === familyId ? { ...f, font } : f)) });
  const fontOptions = dsFontOptions(theme);
  const heading = theme.families.find((f) => f.id === DS_HEADING_FAMILY);
  const body = theme.families.find((f) => f.id === DS_BODY_FAMILY) ?? theme.families[0];

  return (
    // A page of a site at the CMS's reading width (600px), as the site lays one out: most of it on the
    // page itself, in the theme colour; a card (the surface) only where a site puts one.
    <div className="flex w-full max-w-[600px] flex-col gap-ds-80">
      <div className="flex items-center justify-between gap-ds-16">
        <span className="text-p text-ds-fg">Ilo Odena</span>
        <nav className="flex items-center gap-ds-4" aria-label="Preview nav">
          <DsButton variant="text" current>
            Writing
          </DsButton>
          <DsButton variant="text">About</DsButton>
          <DsThemeToggle variant="text" />
        </nav>
      </div>

      <article className="flex flex-col gap-ds-20">
        <div className="flex flex-wrap items-center gap-ds-8">
          <DsPill variant="highlight">New</DsPill>
          <DsPill>Essay</DsPill>
          <DsPill variant="dark">Published</DsPill>
        </div>
        <h1 className="text-display text-ds-fg">Ars longa, vita brevis</h1>
        <h2 className="text-h2 text-ds-fg">Make the small version first</h2>
        <p className="text-prose text-ds-fg-muted">
          Everything I&apos;ve finished started bigger and got smaller. Everything I abandoned stayed big.
        </p>
        <p className="text-small text-ds-fg-muted">2026 · 2 min · Small, the floor</p>
      </article>

      {/* A card above the fold, on the surface, with the big marketing buttons. */}
      <section className="@container flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-20">
        <div className="flex flex-col gap-ds-4">
          <h3 className="text-h3 text-ds-fg">The studio notebook</h3>
          <p className="text-p text-ds-fg-muted">One letter a season: what I made, what I dropped and why.</p>
        </div>
        <div className="@max-2xl:ds-fields-fill">
          <DsInput aria-label="Email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-wrap items-center gap-ds-8">
          <DsButton variant="primary" size="large">
            Subscribe
          </DsButton>
          <DsButton size="large">Learn more</DsButton>
        </div>
      </section>

      <section className="flex flex-col gap-ds-20">
        <h2 className="text-h2 text-ds-fg">Writing</h2>
        <DsLinkList
          items={[
            { label: "How to listen to a lake", href: "#", meta: "2026 · 2 min" },
            { label: "Keep fewer moments", href: "#", meta: "2026 · 1 min" },
            { label: "Make the small version first", href: "#", meta: "2026 · 2 min" },
          ]}
          more={{ label: "All 6 posts", href: "#" }}
        />
      </section>

      {/* A product card, as the admin shows a draft: its name and state, a note, its actions. */}
      <section className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-20">
        <div className="flex items-start justify-between gap-ds-16">
          <div className="flex flex-col gap-ds-4">
            <h3 className="text-h3 text-ds-fg">How to listen to a lake</h3>
            <p className="text-small text-ds-fg-muted">Edited today · 3 images</p>
          </div>
          <DsPill>Draft</DsPill>
        </div>
        <DsInfoCard title="Not live yet">
          <p>Changes to a published post wait until you publish them.</p>
        </DsInfoCard>
        <div className="flex flex-wrap items-center gap-ds-8">
          <DsButton variant="primary">Publish</DsButton>
          <DsButton>Save</DsButton>
          <DsButton variant="text">Preview</DsButton>
        </div>
      </section>

      <InPanel>
        <PanelSection
          title="Theme"
          actions={
            <DsDropdown>
              <DsDropdownTrigger asChild>
                <DsButton size="small" variant="text" iconLeft={MoreVertical} aria-label={`More for ${entry.name}`} />
              </DsDropdownTrigger>
              <DsDropdownContent align="end">
                <DsDropdownItem iconLeft={Pencil} disabled={entry.id === DS_DEFAULT_THEME_ID} onSelect={() => setNaming("rename")}>
                  Rename
                </DsDropdownItem>
                <DsDropdownItem iconLeft={Copy} onSelect={() => addTheme(`${entry.name} copy`)}>
                  Duplicate
                </DsDropdownItem>
                <DsDropdownItem iconLeft={RotateCcw} onSelect={() => setRestoring(true)}>
                  Restore
                </DsDropdownItem>
                <DsDropdownItem
                  tone="danger"
                  iconLeft={Trash2}
                  disabled={entry.id === DS_DEFAULT_THEME_ID || entry.id === library.active}
                  onSelect={() => removeTheme(entry.id)}
                >
                  Delete
                </DsDropdownItem>
              </DsDropdownContent>
            </DsDropdown>
          }
        >
          <DsSelect
            aria-label="Theme"
            key={library.themes.map((t) => t.id).join()}
            // Parabola, Parabola's own, is the default every theme starts from and restores to; Add theme is the last option.
            options={[
              ...library.themes.map((t) => ({ value: t.id, label: t.id === DS_DEFAULT_THEME_ID ? `${t.name} (default)` : t.name })),
              { value: ADD_THEME, label: "Add theme", indicator: <Plus aria-hidden className="size-4" /> },
            ]}
            value={entry.id}
            onValueChange={(value) => (value === ADD_THEME ? setNaming("add") : select(value))}
          />
        </PanelSection>

        <PanelSection
          title="Colours"
          actions={<SectionRestore section="Colours" theme={theme} setTheme={setTheme} restore={(t) => ({ ...t, colours: DS_DEFAULT_COLOURS })} />}
        >
          <div className="flex items-center gap-ds-8" role="group" aria-label="Mode">
            {/* The preview's mode only; the UI's is the sidebar's toggle. */}
            <DsButton size="small" iconLeft={Sun} pressed={mode === "light"} onClick={() => setPreviewMode("light")}>
              Light
            </DsButton>
            <DsButton size="small" iconLeft={Moon} pressed={mode === "dark"} onClick={() => setPreviewMode("dark")}>
              Dark
            </DsButton>
          </div>
          <ColourWheelChoice colours={theme.colours} mode={mode} onChange={(colours) => setTheme({ ...theme, colours })} />
        </PanelSection>

        <PanelSection
          title="Typography"
          actions={
            <SectionRestore
              section="Typography"
              theme={theme}
              setTheme={setTheme}
              restore={(t) => parseDsThemeConfig({ ...t, families: DS_DEFAULT_THEME.families, hiddenFonts: [] })}
            />
          }
        >
          {heading && (
            <DsField label={heading.label}>
              <DsSelect options={fontOptions} value={heading.font} onValueChange={(font) => setFamilyFont(heading.id, font)} />
            </DsField>
          )}
          <DsField label={body.label}>
            <DsSelect options={fontOptions} value={body.font} onValueChange={(font) => setFamilyFont(body.id, font)} />
          </DsField>
          {/* In-app, so the unpublished draft comes along. */}
          <DsButton href="/parabola/typography/font-families" variant="text" size="small" iconRight={ChevronRight} className="-ml-2 self-start">
            More settings
          </DsButton>
        </PanelSection>

        <PanelSection
          title="Radius"
          actions={<SectionRestore section="Radius" theme={theme} setTheme={setTheme} restore={(t) => ({ ...t, radius: DS_DEFAULT_RADIUS })} />}
        >
          <RadiusChoice radius={theme.radius} onChange={(radius) => setTheme({ ...theme, radius })} />
        </PanelSection>

        <PanelSection
          title="Icons"
          actions={<SectionRestore section="Icons" theme={theme} setTheme={setTheme} restore={(t) => ({ ...t, icons: DS_DEFAULT_THEME.icons })} />}
        >
          <DsField label="Icon library">
            <DsSelect
              options={DS_ICON_LIBRARIES.map((l) => ({ value: l.id, label: l.ready ? l.label : `${l.label} (soon)`, disabled: !l.ready }))}
              value={theme.icons}
              onValueChange={(icons) => setTheme({ ...theme, icons })}
            />
          </DsField>
        </PanelSection>

        <ThemeCode theme={theme} name={entry.name} setTheme={setTheme} />
      </InPanel>

      {/* At the panel's foot while Custom, the working copy, is open: name it a theme of its own. */}
      {status === "custom" && (
        <InPanelFooter>
          <DsButton variant="primary" className="w-full" loading={saving} onClick={() => setNaming("create")}>
            Create theme
          </DsButton>
        </InPanelFooter>
      )}

      {naming === "create" && (
        <ThemeNameDialog
          title="Create a theme"
          description="Parabola stays as it is; this is a theme of its own, for a site to pick in Settings › Design."
          initial={entry.name}
          action="Create theme"
          onClose={() => setNaming(null)}
          onSave={async (name) => {
            setNaming(null);
            await createTheme(name);
          }}
        />
      )}
      <DsConfirmDialog
        open={restoring}
        onOpenChange={setRestoring}
        title={RESTORE.all.title}
        description={RESTORE.all.description}
        confirmLabel="Restore"
        onConfirm={() => {
          setRestoring(false);
          const undoIt = backToParabola();
          dsToast(RESTORE.all.done, { action: { label: "Undo", onClick: undoIt } });
        }}
      />

      {naming === "add" && (
        <ThemeNameDialog
          title="Add a theme"
          description={`A copy of ${entry.name}, to change as you like. Publish keeps it.`}
          initial=""
          action="Add theme"
          onClose={() => setNaming(null)}
          onSave={(name) => {
            addTheme(name);
            setNaming(null);
          }}
        />
      )}
      {naming === "rename" && (
        <ThemeNameDialog
          title={`Rename ${entry.name}`}
          description="What it's called here and in Settings › Design."
          initial={entry.name}
          action="Rename"
          onClose={() => setNaming(null)}
          onSave={(name) => {
            renameTheme(entry.id, name);
            setNaming(null);
          }}
        />
      )}
    </div>
  );
}
