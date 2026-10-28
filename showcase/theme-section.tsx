"use client";

import * as React from "react";
import { Moon, MoreVertical, Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsCopyField } from "../primitives/copy-field";
import { DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { DsField, DsInput } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { DsSwitch } from "../primitives/switch";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsInfoCard } from "../components/info-card";
import { DsLinkList } from "../components/link-list";
import { dsFontOptions } from "../components/font-pairing";
import {
  DS_ACCENT_COLOURS,
  DS_BACKGROUND_PRESETS,
  DS_BASE_COLOURS,
  DS_ICON_LIBRARIES,
  dsBackgroundTokens,
  dsBaseTokens,
  dsColourSwatch,
  dsCounterpart,
  dsIsHex,
} from "../colours";
import { DsColourPicker } from "../components/colour-picker";
import { cn } from "../cn";
import { DsLink, useDsSetTheme } from "../provider";
import { DS_BODY_FAMILY, DS_DEFAULT_THEME_ID, DS_HEADING_FAMILY } from "../theme";
import { InPanel, PanelSection, useThemeEditor } from "./theme-editor";

/**
 * One card of the preview: a few words on what it shows, then the pieces
 * themselves, on the surface colour (`ds-surface-subtle`, as a site's cards
 * and panels are) with no outline, inside a page in the background colour.
 * Fields fill it unless it's wide.
 */
function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="@container rounded-ds-lg bg-ds-surface-subtle p-ds-20">
      {/* Fields fill the tile while it's narrow (under 672px), as on a phone; a wider tile gives them their usual width. */}
      <div className="flex flex-col gap-ds-16 @max-2xl:ds-fields-fill">
        <p className="text-small text-ds-fg-muted">{label}</p>
        {children}
      </div>
    </section>
  );
}

/** Whether the page is dark, kept in step with the `dark` class on <html>. */
function useDarkMode(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false
  );
}

/** A swatch of the whole rainbow, for Custom. */
const RAINBOW = "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)";

/**
 * One of the theme's colours in the panel: its name with what it is now on
 * the right (a preset's name, or Custom, and the hex), the presets as
 * swatches, and Custom, a rainbow swatch that opens the colour picker right
 * here (no pop-up), where you drag hue, saturation and brightness or type a
 * hex and see it all change at once.
 */
function ColourChoice({
  label,
  description,
  presets,
  value,
  current,
  counterpart,
  onChange,
}: {
  label: string;
  description: string;
  /** `value` is what's stored: a preset's id, a hex, or null (Background's "Base"). */
  presets: { value: string | null; label: string; swatch: string }[];
  value: string | null;
  /** The colour it shows now, for the hex beside the name and the picker's start. */
  current: string;
  /** Its colour in the dark theme, when that's worked out from this one: shown under it. */
  counterpart?: string;
  onChange: (value: string | null) => void;
}) {
  const custom = dsIsHex(value) && !presets.some((p) => p.value === value);
  const [open, setOpen] = React.useState(custom);
  const name = custom ? "Custom" : (presets.find((p) => p.value === value)?.label ?? label);
  return (
    <div className="flex flex-col gap-ds-8">
      <div className="flex items-baseline justify-between gap-ds-8">
        <span className="text-p text-ds-fg">{label}</span>
        <span className="truncate text-small text-ds-fg-muted">
          {name} · <span className="font-mono">{current}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-ds-8" role="radiogroup" aria-label={label}>
        {presets.map((preset) => {
          const on = !custom && preset.value === value;
          return (
            <button
              key={preset.label}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => {
                onChange(preset.value);
                setOpen(false);
              }}
              className={cn(
                "size-7 rounded-full border border-ds-border ds-focus",
                on && "ring-2 ring-ds-fg ring-offset-2 ring-offset-ds-surface-subtle"
              )}
              style={{ backgroundColor: preset.swatch }}
            />
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          aria-label="Custom colour"
          title="Custom"
          onClick={() => {
            setOpen((o) => !o);
            if (!custom) onChange(current);
          }}
          className={cn("size-7 rounded-full ds-focus", custom && "ring-2 ring-ds-fg ring-offset-2 ring-offset-ds-surface-subtle")}
          style={{ backgroundImage: RAINBOW }}
        />
      </div>
      {open && <DsColourPicker value={current} onChange={onChange} />}
      {counterpart && (
        <p className="flex items-center gap-ds-8 text-small text-ds-fg-muted">
          <span aria-hidden className="size-3 shrink-0 rounded-full border border-ds-border" style={{ backgroundColor: counterpart }} />
          In dark: its counterpart, <span className="font-mono">{counterpart}</span>
        </p>
      )}
      <p className="text-small text-ds-fg-muted">{description}</p>
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
 * shadcn's create page (decisions, 2026-10-28). The page is Parabola's
 * pieces wearing the open theme, one card under another at the CMS's
 * reading width (600px), the theme as data last; the panel on the right holds the
 * theme's main choices: which theme (Default and any added; Add theme
 * copies the open one under a new name), light or dark, the base and
 * secondary colours, the Heading and Font families' fonts, and the icon
 * library. The rest is on Typography. Publish is top right; a site picks
 * its theme in Settings › Design. Every spacing is a Parabola one.
 */
export function ThemeSection() {
  const { library, entry, theme, setTheme, select, addTheme, renameTheme, removeTheme } = useThemeEditor();
  const dark = useDarkMode();
  const mode = dark ? "dark" : "light";
  // What Auto gives the surfaces in the light theme: shades of the background (or the base's own).
  const autoSurface = dsBackgroundTokens({
    background: theme.colours.background,
    surface: null,
    baseBg: dsBaseTokens(theme.colours.base, "light").bg,
    mode: "light",
  })["surface-subtle"];
  const setMode = useDsSetTheme();
  const [naming, setNaming] = React.useState<"add" | "rename" | null>(null);

  const setFamilyFont = (familyId: string, font: string) =>
    setTheme({ ...theme, families: theme.families.map((f) => (f.id === familyId ? { ...f, font } : f)) });
  const fontOptions = dsFontOptions(theme);
  const heading = theme.families.find((f) => f.id === DS_HEADING_FAMILY);
  const body = theme.families.find((f) => f.id === DS_BODY_FAMILY) ?? theme.families[0];

  return (
    // One column at the reading width the CMS uses (600px), each card as tall as what's in it.
    <div className="flex w-full max-w-[600px] flex-col gap-ds-20">
      {/* A page in the theme's background, its cards on the surface colour: as a site wears them. */}
      <div className="flex flex-col gap-ds-20 rounded-ds-lg border border-ds-border bg-ds-bg p-ds-20">
        <Tile label="Type">
          <p className="text-display text-ds-fg">Ars longa</p>
          <h2 className="text-h2 text-ds-fg">Make the small version first</h2>
          <p className="text-prose text-ds-fg-muted">
            Everything I&apos;ve finished started bigger and got smaller. Everything I abandoned stayed big.
          </p>
          <p className="text-small text-ds-fg-muted">Small, the floor</p>
        </Tile>
        <Tile label="Buttons">
          <div className="flex flex-wrap items-center gap-ds-8">
            <DsButton variant="primary">Publish</DsButton>
            <DsButton>Save</DsButton>
            <DsButton variant="text">Writing</DsButton>
            <DsThemeToggle variant="text" />
          </div>
        </Tile>
        <Tile label="Pills">
          <div className="flex flex-wrap items-center gap-ds-8">
            <DsPill variant="highlight">New</DsPill>
            <DsPill>Draft</DsPill>
            <DsPill variant="dark">Published</DsPill>
          </div>
        </Tile>
        <Tile label="Fields">
          <DsField label="Name" description="The project's name, and the site's.">
            <DsInput defaultValue="Ilo Odena" />
          </DsField>
          <DsField label="Layout">
            <DsSelect
              value="list"
              options={[
                { value: "list", label: "Stacked like a blog" },
                { value: "wall", label: "Posts only" },
              ]}
            />
          </DsField>
          <label className="inline-flex items-center gap-ds-8 self-start">
            <span className="text-p text-ds-fg">In the site&apos;s nav</span>
            <DsSwitch defaultChecked />
          </label>
        </Tile>
        <Tile label="Lists">
          <DsLinkList
            items={[
              { label: "How to listen to a lake", href: "#", meta: "2026 · 2 min" },
              { label: "Keep fewer moments", href: "#", meta: "2026 · 1 min" },
            ]}
            more={{ label: "All 6 posts", href: "#" }}
          />
        </Tile>
        {/* On the page itself, as notes sit on a site: its own surface shows against the background. */}
        <DsInfoCard title="Not live yet">
          <p>Changes to a published post wait until you publish them.</p>
        </DsInfoCard>
      </div>

      <DsField
        label={`${entry.name} as data`}
        description="Paste it into another Parabola site, or hand it to an agent."
        className="w-full pt-ds-20"
      >
        <DsCopyField mono wrap className="w-full" value={JSON.stringify(theme)} />
      </DsField>

      <InPanel>
        <PanelSection title="Theme">
          <DsField label="Editing">
            <DsSelect
              key={library.themes.map((t) => t.id).join()}
              options={library.themes.map((t) => ({ value: t.id, label: t.id === library.active ? `${t.name} (in use)` : t.name }))}
              value={entry.id}
              onValueChange={select}
            />
          </DsField>
          <div className="flex items-center gap-ds-8">
            <DsButton iconLeft={Plus} onClick={() => setNaming("add")}>
              Add theme
            </DsButton>
            <DsDropdown>
              <DsDropdownTrigger asChild>
                <DsButton variant="text" iconLeft={MoreVertical} aria-label={`More for ${entry.name}`} />
              </DsDropdownTrigger>
              <DsDropdownContent align="start">
                <DsDropdownItem iconLeft={Pencil} onSelect={() => setNaming("rename")}>
                  Rename
                </DsDropdownItem>
                <DsDropdownItem
                  tone="danger"
                  iconLeft={Trash2}
                  disabled={entry.id === DS_DEFAULT_THEME_ID || entry.id === library.active}
                  onSelect={() => removeTheme(entry.id)}
                >
                  Remove
                </DsDropdownItem>
              </DsDropdownContent>
            </DsDropdown>
          </div>
          <p className="text-small text-ds-fg-muted">A site picks its theme in Settings › Design.</p>
        </PanelSection>

        <PanelSection title="Colours">
          <div className="flex items-center gap-ds-8" role="group" aria-label="Mode">
            <DsButton iconLeft={Sun} pressed={!dark} onClick={() => setMode("light")}>
              Light
            </DsButton>
            <DsButton iconLeft={Moon} pressed={dark} onClick={() => setMode("dark")}>
              Dark
            </DsButton>
          </div>
          <ColourChoice
            label="Base colour"
            description="The greys: surfaces, borders, quiet text."
            presets={DS_BASE_COLOURS.map((c) => ({ value: c.id, label: c.label, swatch: c.swatch }))}
            value={theme.colours.base}
            current={dsColourSwatch("base", theme.colours.base)}
            onChange={(base) => base && setTheme({ ...theme, colours: { ...theme.colours, base } })}
          />
          <ColourChoice
            label="Accent colour"
            description="The one highlight, for what needs attention."
            presets={DS_ACCENT_COLOURS.map((c) => ({ value: c.id, label: c.label, swatch: c[mode].highlight }))}
            value={theme.colours.accent}
            current={dsColourSwatch("accent", theme.colours.accent, mode)}
            onChange={(accent) => accent && setTheme({ ...theme, colours: { ...theme.colours, accent } })}
          />
          <ColourChoice
            label="Background"
            description="The website's background; its cards, fields and panels take shades of it, and text turns black or white to read on it."
            presets={[
              { value: null, label: "Base", swatch: dsBaseTokens(theme.colours.base, "light").bg },
              ...DS_BACKGROUND_PRESETS.map((p) => ({ value: p.value, label: p.label, swatch: p.value })),
            ]}
            value={theme.colours.background}
            current={theme.colours.background ?? dsBaseTokens(theme.colours.base, "light").bg}
            counterpart={theme.colours.background ? dsCounterpart(theme.colours.background) : dsBaseTokens(theme.colours.base, "dark").bg}
            onChange={(background) => setTheme({ ...theme, colours: { ...theme.colours, background } })}
          />
          <ColourChoice
            label="Surface"
            description="Cards, side panels and fields. Auto makes them shades of the background."
            presets={[
              { value: null, label: "Auto", swatch: autoSurface },
              { value: "#FFFFFF", label: "White", swatch: "#FFFFFF" },
              ...DS_BACKGROUND_PRESETS.map((p) => ({ value: p.value, label: p.label, swatch: p.value })),
            ]}
            value={theme.colours.surface}
            current={theme.colours.surface ?? autoSurface}
            counterpart={dsCounterpart(theme.colours.surface ?? autoSurface)}
            onChange={(surface) => setTheme({ ...theme, colours: { ...theme.colours, surface } })}
          />
        </PanelSection>

        <PanelSection title="Type">
          {heading && (
            <DsField label={heading.label} description="Display to H2, unless Type scale moves them.">
              <DsSelect options={fontOptions} value={heading.font} onValueChange={(font) => setFamilyFont(heading.id, font)} />
            </DsField>
          )}
          <DsField label={body.label} description="Everything else.">
            <DsSelect options={fontOptions} value={body.font} onValueChange={(font) => setFamilyFont(body.id, font)} />
          </DsField>
          {/* In-app, so the unpublished draft comes along. */}
          <DsLink
            href="/parabola/typography/font-families"
            className="text-small text-ds-fg-muted underline underline-offset-4 hover:text-ds-fg"
          >
            More families, fonts and the type scale
          </DsLink>
        </PanelSection>

        <PanelSection title="Icons">
          <DsField label="Icon library" description="Lucide for now; the others need Parabola's icons in one place first.">
            <DsSelect
              options={DS_ICON_LIBRARIES.map((l) => ({ value: l.id, label: l.ready ? l.label : `${l.label} (soon)`, disabled: !l.ready }))}
              value={theme.icons}
              onValueChange={(icons) => setTheme({ ...theme, icons })}
            />
          </DsField>
        </PanelSection>
      </InPanel>

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
