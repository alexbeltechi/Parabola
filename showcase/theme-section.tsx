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
import { DS_ICON_LIBRARIES, dsColourShown, type DsColourKind, type DsThemeColours } from "../colours";
import { DsCheckbox } from "../primitives/checkbox";
import { DsColourPicker } from "../components/colour-picker";
import { DsLink, useDsSetTheme } from "../provider";
import { DS_RADII, DS_RADIUS_MAX, dsRadiusPx, type DsRadius } from "../radius";
import { DS_BODY_FAMILY, DS_DEFAULT_THEME_ID, DS_HEADING_FAMILY } from "../theme";
import { InPanel, PanelSection, useThemeEditor } from "./theme-editor";

/**
 * One card of the preview: a few words on what it shows, then the pieces
 * themselves, on the page colour with no outline, floating on the canvas,
 * so pieces that sit on a surface of their own (the info card) stand out.
 * Fields fill it unless it's wide.
 */
function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="@container rounded-ds-lg bg-ds-bg p-ds-20">
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

/**
 * One of the theme's three colours in the panel, for the light or the dark
 * theme (whichever the page is in): its name, then the colour picker sitting
 * on the colour it is now (Parabola's own until you move it), where you drag
 * or type a hex and see it change at once. In dark, "Based on light theme"
 * (on by default) keeps it the light one's counterpart; moving the picker
 * gives it a dark colour of its own and turns that off.
 */
function ColourChoice({
  kind,
  label,
  colours,
  mode,
  onChange,
}: {
  kind: DsColourKind;
  label: string;
  colours: DsThemeColours;
  mode: "light" | "dark";
  onChange: (colours: DsThemeColours) => void;
}) {
  const colour = colours[kind];
  const set = (next: Partial<typeof colour>) => onChange({ ...colours, [kind]: { ...colour, ...next } });
  return (
    <div className="flex flex-col gap-ds-8">
      <span className="text-p text-ds-fg">{label}</span>
      {mode === "dark" && (
        <label className="inline-flex items-center gap-ds-8 self-start">
          <DsCheckbox
            checked={colour.dark === null}
            onCheckedChange={(on) => set({ dark: on ? null : dsColourShown(colours, kind, "dark") })}
          />
          <span className="text-p text-ds-fg">Based on light theme</span>
        </label>
      )}
      <DsColourPicker
        aria-label={label}
        value={dsColourShown(colours, kind, mode)}
        onChange={(hex) => set(mode === "light" ? { light: hex } : { dark: hex })}
      />
    </div>
  );
}

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
        {DS_RADII.map((r) => (
          <DsButton key={r.id} className="min-w-0 flex-1 px-0" pressed={radius === r.id} onClick={() => onChange(r.id)}>
            {r.label}
          </DsButton>
        ))}
        <DsButton
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
 * shadcn's create page (decisions, 2026-10-28). The page is Parabola's
 * pieces wearing the open theme, one card under another at the CMS's
 * reading width (600px), the theme as data last; the panel on the right holds the
 * theme's main choices: which theme (Default and any added; Add theme
 * copies the open one under a new name), light or dark, the theme
 * colour, fonts and UI and the accent colour, the Heading and Font families' fonts, and the icon
 * library. The rest is on Typography. Publish is top right; a site picks
 * its theme in Settings › Design. Every spacing is a Parabola one.
 */
export function ThemeSection() {
  const { library, entry, theme, setTheme, select, addTheme, renameTheme, removeTheme } = useThemeEditor();
  const dark = useDarkMode();
  const mode = dark ? "dark" : "light";
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
          <DsButton variant="primary" size="large">
            Book a call
          </DsButton>
        </div>
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
      <Tile label="Lists and notes">
        <DsLinkList
          items={[
            { label: "How to listen to a lake", href: "#", meta: "2026 · 2 min" },
            { label: "Keep fewer moments", href: "#", meta: "2026 · 1 min" },
          ]}
          more={{ label: "All 6 posts", href: "#" }}
        />
        <DsInfoCard title="Not live yet">
          <p>Changes to a published post wait until you publish them.</p>
        </DsInfoCard>
      </Tile>

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
            kind="theme"
            label="Theme colour"
            colours={theme.colours}
            mode={mode}
            onChange={(colours) => setTheme({ ...theme, colours })}
          />
          <ColourChoice
            kind="ui"
            label="Fonts and UI"
            colours={theme.colours}
            mode={mode}
            onChange={(colours) => setTheme({ ...theme, colours })}
          />
          <ColourChoice
            kind="accent"
            label="Accent colour"
            colours={theme.colours}
            mode={mode}
            onChange={(colours) => setTheme({ ...theme, colours })}
          />
        </PanelSection>

        <PanelSection title="Type">
          {heading && (
            <DsField label={heading.label}>
              <DsSelect options={fontOptions} value={heading.font} onValueChange={(font) => setFamilyFont(heading.id, font)} />
            </DsField>
          )}
          <DsField label={body.label}>
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

        <PanelSection title="Radius">
          <RadiusChoice radius={theme.radius} onChange={(radius) => setTheme({ ...theme, radius })} />
        </PanelSection>

        <PanelSection title="Icons">
          <DsField label="Icon library">
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
