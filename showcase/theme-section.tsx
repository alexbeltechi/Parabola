"use client";

import * as React from "react";
import { ChevronRight, ClipboardPaste, Copy, Moon, Shuffle, MoreVertical, Pencil, Plus, RotateCcw, Sun, Trash2 } from "lucide-react";
import { DsAccordion } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsConfirmDialog, DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownSeparator, DsDropdownTrigger } from "../primitives/dropdown";
import { DsNavItem } from "../primitives/nav-item";
import { DsField, DsInput, DsTextarea } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { dsToast } from "../primitives/toast";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsInfoCard } from "../components/info-card";
import { dsFontOptions } from "../components/font-pairing";
import { DS_DEFAULT_COLOURS, DS_ICON_LIBRARIES, dsColourShown, dsHexToHsl, dsNormalizeHex, dsShift, type DsColourOptions, type DsColourKind, type DsThemeColour, type DsThemeColours } from "../colours";
import { DsColourWheel } from "../components/colour-wheel";
import { DsColourBar } from "../components/colour-picker";
import { DsSwitch } from "../primitives/switch";
import { DS_DEFAULT_FIELD_STYLE, DS_OUTLINE_MAX, DS_OUTLINE_WIDTHS, type DsButtonStyle } from "../button-style";
import { DsAngleDial } from "../components/angle-dial";
import { DsCheckbox } from "../primitives/checkbox";
import { DS_RADII, DS_RADIUS_MAX, dsRadiusPx, type DsRadius } from "../radius";
import {
  DS_CHARACTER_DIALS,
  DS_DEFAULT_CHARACTER,
  dsCharacterBase,
  dsCharacterColourOptions,
  dsMoodLabel,
  type DsCharacter,
} from "../character";
import { DsColourField } from "../components/colour-field";
import { DS_TASTES, dsShuffleTaste } from "../taste";
import {
  DS_BODY_FAMILY,
  DS_DEFAULT_THEME,
  DS_DEFAULT_THEME_ID,
  DS_HEADING_FAMILY,
  dsThemeButtons,
  dsThemeColourTokens,
  dsThemeExport,
  dsThemeRadius,
  dsThemeWithFonts,
  dsThemeWithMood,
  parseDsThemeConfig,
  parseDsThemeExport,
  type DsThemeConfig,
} from "../theme";
import { InPanel, InPanelFooter, PanelSection, RESTORE, useThemeEditor } from "./theme-editor";

/** The theme's colours on the wheel, in the order they're picked, named for what they colour (Alex, 2026-10-29). */
const WHEEL: { kind: DsColourKind; label: string }[] = [
  { kind: "theme", label: "Background" },
  { kind: "text", label: "Primary" },
  { kind: "muted", label: "Secondary" },
  { kind: "accent", label: "Button: primary" },
  { kind: "buttonSecondary", label: "Button: secondary" },
  { kind: "field", label: "Field" },
  { kind: "surface", label: "Surface" },
];

/**
 * The theme's seven colours on one wheel, for the light or the dark theme
 * (whichever the preview is in): each a point of one size, the chosen one
 * filled with its colour, the others a thin ring. Each is based on another
 * until given its own (the primary type, the field and the surface on the
 * base; the secondary type and the primary button on the primary type;
 * the secondary button on the primary button; in dark, each on the light
 * one). The list says Auto while it's based, Custom once it's its own. Pick one in the list under the wheel (or press
 * its point), then drag its point to move it; clicking the wheel itself
 * changes nothing. The list: the six as nav items, each a solid dot of its
 * colour, its hex or what it's based on, and a ⋮ to copy or paste its hex
 * (to give two the same colour) and restore it (back to what it's based
 * on; the base to Parabola's). Delete or Backspace on the chosen point,
 * or a double click on any point, does the same.
 */
function ColourWheelChoice({
  colours,
  mode,
  options,
  onChange,
}: {
  colours: DsThemeColours;
  mode: "light" | "dark";
  /** The character's base and contrast, under the Auto colours. */
  options: DsColourOptions;
  onChange: (colours: DsThemeColours) => void;
}) {
  const pick = mode === "light" ? "light" : "dark";
  const shiftKey = mode === "light" ? "lightShift" : "darkShift";
  const [selected, setSelected] = React.useState<DsColourKind>("theme");
  const set = (kind: DsColourKind, next: Partial<DsThemeColour>) => onChange({ ...colours, [kind]: { ...colours[kind], ...next } });
  const basis = (kind: DsColourKind) => (mode === "dark" ? "light theme" : LIGHT_BASIS[kind]);
  const own = (kind: DsColourKind) => colours[kind][pick] !== null;
  const based = (kind: DsColourKind) => !own(kind) && basis(kind) !== null;
  const shown = (kind: DsColourKind) => dsColourShown(colours, kind, mode, options);
  const label = (kind: DsColourKind) => WHEEL.find((w) => w.kind === kind)?.label ?? kind;
  const remove = (kind: DsColourKind) => {
    if (!own(kind)) return;
    const before = colours;
    set(kind, { [pick]: null, [shiftKey]: undefined });
    dsToast(`${label(kind)} restored`, {
      action: { label: "Undo", onClick: () => onChange(before) },
    });
  };
  const chosen = WHEEL.find((w) => w.kind === selected) ?? WHEEL[0];
  const [text, setText] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  return (
    <div className="flex flex-col gap-ds-16">
      <DsColourWheel
        points={WHEEL.map((w) => ({
          id: w.kind,
          label: w.label,
          colour: shown(w.kind),
          based: based(w.kind),
          // The base, fields and cards keep their brightness; type and the button come out as a colour, not black.
          floor: w.kind === "text" || w.kind === "muted" ? 0.45 : w.kind === "accent" ? 0.7 : 0,
        }))}
        selected={selected}
        onSelect={(id) => setSelected(id as DsColourKind)}
        onChange={(id, hex) => set(id as DsColourKind, { [pick]: hex })}
        onRemove={(id) => remove(id as DsColourKind)}
      />
      {/* Named for the colour it is, its hex inside. */}
      <DsField size="small" label={`Colour: ${chosen.label}`} className="w-full">
        <DsInput
          size="small"
          aria-label={`${chosen.label} hex`}
          className="font-mono"
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
      </DsField>
      <div className="flex flex-col gap-ds-4">
        {WHEEL.map((w) => (
          <DsNavItem
            key={w.kind}
            selected={selected === w.kind}
            onClick={() => setSelected(w.kind)}
            leading={
              // The colour as it is, solid, with a faint see-through edge so a white or pale one still shows.
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ds-fg)_18%,transparent)]"
                style={{ backgroundColor: shown(w.kind) }}
              />
            }
            // Auto while it's worked out from another (or Parabola's own); Custom once it has a colour of its own.
            meta={own(w.kind) ? "Custom" : "Auto"}
            // Room for two actions: Restore and the ⋮.
            className="pr-[4.5rem]"
            actions={
              <>
                {/* Restore, beside the ⋮ only once it has a colour of its own; a space the same size till then, so
                    the Auto and Custom line up. */}
                {own(w.kind) ? (
                  <DsButton
                    size="small"
                    variant="text"
                    iconLeft={RotateCcw}
                    aria-label={`Restore ${w.label}`}
                    title="Restore"
                    onClick={() => remove(w.kind)}
                  />
                ) : (
                  <span aria-hidden className="size-6" />
                )}
                <DsDropdown>
                  <DsDropdownTrigger asChild>
                    <DsButton size="small" variant="text" iconLeft={MoreVertical} aria-label={`More for ${w.label}`} />
                  </DsDropdownTrigger>
                  <DsDropdownContent align="end">
                    <DsDropdownItem
                      iconLeft={Copy}
                      onSelect={() => navigator.clipboard.writeText(shown(w.kind)).then(() => dsToast.success(`${shown(w.kind)} copied`))}
                    >
                      Copy hex
                    </DsDropdownItem>
                    <DsDropdownItem
                      iconLeft={ClipboardPaste}
                      onSelect={() =>
                        navigator.clipboard.readText().then((value) => {
                          const hex = dsNormalizeHex(value);
                          if (hex) set(w.kind, { [pick]: hex });
                          else dsToast.error("No hex to paste");
                        })
                      }
                    >
                      Paste hex
                    </DsDropdownItem>
                    <DsDropdownSeparator />
                    {/* Back to what it's based on (the base back to Parabola's); there's nothing to restore while it is. */}
                    <DsDropdownItem iconLeft={RotateCcw} disabled={!own(w.kind)} onSelect={() => remove(w.kind)}>
                      Restore
                    </DsDropdownItem>
                  </DsDropdownContent>
                </DsDropdown>
              </>
            }
          >
            {w.label}
          </DsNavItem>
        ))}
      </div>
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
  // Black or white, whichever reads on the background, until it's given its own.
  text: "background",
  muted: "primary",
  accent: "primary",
  // A wash of the primary button colour on the page, until it's given its own.
  buttonSecondary: "button: primary",
  field: "background",
  surface: "background",
};

/** Ilo's photos for the preview, small copies of the seed's (seed/ilo/media). */
const PREVIEW_MEDIA = "/parabola/preview";

/** The heading family, for type set by hand over a photo. */
const HEADING_FONT = { fontFamily: "var(--ds-family-heading)" };

/**
 * A story, as Instagram shows one: Ilo's portrait full bleed, the progress
 * bars and her name at the top, and two lines laid over it in the theme, one
 * in the page colour, one on the button colour, as a post's narrative is
 * placed over an image.
 */
function PreviewStory() {
  return (
    <div className="relative aspect-[9/16] w-[220px] shrink-0 overflow-hidden rounded-ds-lg bg-ds-surface">
      <img src={`${PREVIEW_MEDIA}/ilo-portrait.jpg`} alt="Ilo, by the water" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-3 top-3 flex flex-col gap-ds-8">
        <div className="flex gap-1">
          {[1, 0.4, 0.4].map((o, i) => (
            <span key={i} className="h-0.5 flex-1 rounded-full bg-ds-bg" style={{ opacity: o }} />
          ))}
        </div>
        <div className="flex items-center gap-ds-8">
          <span className="flex size-6 items-center justify-center rounded-full bg-ds-button text-[10px] text-ds-on-button">IO</span>
          <span className="text-small text-ds-bg">iloodena</span>
        </div>
      </div>
      <p className="absolute top-[38%] left-3 max-w-[80%] rounded-ds-sm bg-ds-bg px-2 py-1 text-h3 leading-tight text-ds-fg" style={HEADING_FONT}>
        Keep fewer moments
      </p>
      <span className="absolute bottom-4 left-3 rounded-ds-pill bg-ds-button px-3 py-1.5 text-small text-ds-on-button">New letter →</span>
    </div>
  );
}

/** A post on X: her name and handle, a line, a photo, the counts and the link back to the site. */
function PreviewXPost() {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col gap-ds-8 rounded-ds-lg border border-ds-border bg-ds-bg p-ds-16">
      <div className="flex items-center gap-ds-8">
        <span className="flex size-9 items-center justify-center rounded-full bg-ds-button text-small text-ds-on-button">IO</span>
        <div className="flex flex-col">
          <span className="text-p text-ds-fg">Ilo Odena</span>
          <span className="text-small text-ds-fg-muted">@iloodena · 2h</span>
        </div>
      </div>
      <p className="text-p text-ds-fg">Make the small version first. Everything I&apos;ve finished started bigger and got smaller.</p>
      <img src={`${PREVIEW_MEDIA}/ilo-black-sand.jpg`} alt="Black sand and a line of foam" className="aspect-[16/10] w-full rounded-ds-md object-cover" />
      <div className="flex items-center justify-between gap-ds-8">
        <span className="text-small text-ds-fg-muted">12 replies · 48 reposts · 310 likes</span>
        <DsPill>iloodena.com</DsPill>
      </div>
    </div>
  );
}

/** An email, as a reader's inbox opens one: who it's from, its subject, then the letter on the page colour. */
function PreviewEmail() {
  return (
    <div className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-16">
      <div className="flex flex-col gap-ds-4">
        <span className="text-small text-ds-fg-muted">Ilo Odena · The studio notebook</span>
        <span className="text-p text-ds-fg">A letter from the lake</span>
      </div>
      <div className="flex flex-col gap-ds-16 rounded-ds-md bg-ds-bg p-ds-20">
        <h3 className="text-h2 text-ds-fg" style={HEADING_FONT}>
          Keep fewer moments
        </h3>
        <p className="text-prose text-ds-fg-muted">
          This season I kept three. A dragonfly that waited, the lake at four in the morning, and a stone that holds one
          drop of it.
        </p>
        <div>
          <DsButton variant="primary">Read the letter</DsButton>
        </div>
        <p className="text-small text-ds-fg-subtle">You&apos;re getting this because you subscribed at iloodena.com. Unsubscribe.</p>
      </div>
    </div>
  );
}

/**
 * The taste feeder (taste.ts; Alex, 2026-10-29): common styles as pills,
 * Minimal, Editorial, Luxury, Tech, Warm, Bold, Playful, Wacky. Picking one
 * changes the look at once, drawn at random inside it (the mood, the dials,
 * a background, a button colour, a font pair); picking more draws inside
 * all of them; Shuffle draws again for another take, and with none picked
 * picks one and shows it picked. Unpicking the last brings back the look
 * from before the first was picked. A draw starts the look over: colours,
 * corners and buttons given their own go back to Auto. Default puts
 * Parabola's own back. Undo, in the top bar, takes a take back.
 */
function TasteChoice({ theme, onTheme }: { theme: DsThemeConfig; onTheme: (theme: DsThemeConfig) => void }) {
  const picked = theme.character.tastes;
  // The look before the first pill was picked, to come back to when the last is unpicked.
  const [before, setBefore] = React.useState<DsThemeConfig | null>(null);
  const draw = (ids: string[]) => {
    if (!before) setBefore(theme);
    const next = dsShuffleTaste(ids, theme.character);
    const colours = { ...DS_DEFAULT_COLOURS, accent: { light: next.button, dark: null } };
    onTheme(dsThemeWithFonts({ ...theme, character: next.character, colours, radius: null, pillRadius: null, buttons: null }, next.fonts));
  };
  const toggle = (id: string) => {
    const ids = picked.includes(id) ? picked.filter((t) => t !== id) : [...picked, id];
    if (ids.length) return draw(ids);
    onTheme(before ? { ...before, character: { ...before.character, tastes: [] } } : { ...theme, character: { ...theme.character, tastes: [] } });
    setBefore(null);
  };
  return (
    <div className="flex flex-col gap-ds-16">
      <div className="flex flex-wrap gap-ds-4" role="group" aria-label="Tastes">
        {DS_TASTES.map((t) => (
          <DsButton key={t.id} size="small" pressed={picked.includes(t.id)} onClick={() => toggle(t.id)}>
            {t.label}
          </DsButton>
        ))}
      </div>
      <div className="flex items-center gap-ds-8">
        <DsButton size="small" variant="primary" iconLeft={Shuffle} onClick={() => draw(picked)}>
          Shuffle
        </DsButton>
        <DsButton
          size="small"
          variant="text"
          iconLeft={RotateCcw}
          onClick={() => {
            setBefore(null);
            onTheme({
              ...dsThemeWithMood(theme, DS_DEFAULT_CHARACTER.mood),
              character: DS_DEFAULT_CHARACTER,
              colours: DS_DEFAULT_COLOURS,
              radius: null,
              pillRadius: null,
              buttons: null,
            });
          }}
        >
          Default
        </DsButton>
      </div>
    </div>
  );
}

/**
 * The theme's style (character.ts; Alex, 2026-10-29): the look as a whole,
 * set the way a photograph is edited, with everything under it worked out
 * from it until given its own. Two parts, folded in:
 *
 * - Mood: one bar from Serious to Playful. Moving it moves the Appearance
 *   dials and the fonts together (crisp corners and an editorial serif at
 *   one end, round corners, warmth, some depth and a rounded face at the
 *   other, Parabola's own in the middle), to fine-tune after.
 * - Appearance: the base colour (white to start), as Figma shows one, then
 *   Brightness, Warmth, Contrast, Roundness and Depth, each a bar drawn in
 *   what it does.
 */
function StyleChoice({
  theme,
  mode,
  onTheme,
}: {
  theme: DsThemeConfig;
  mode: "light" | "dark";
  onTheme: (theme: DsThemeConfig) => void;
}) {
  const character = theme.character;
  const set = (next: Partial<DsCharacter>) => onTheme({ ...theme, character: { ...character, ...next } });
  const at = (next: Partial<DsCharacter>) => dsCharacterBase({ ...character, ...next }) ?? "#FFFFFF";
  const tokensAt = (contrast: number) => dsThemeColourTokens({ ...theme, character: { ...character, contrast } }, mode);
  const base = dsThemeColourTokens(theme, mode).bg;
  // -50 to +50 from 0 in the middle, as the colours' numbers read.
  const signed = (n: number) => (n === 0 ? "0" : `${n > 0 ? "+" : "−"}${Math.abs(n)}`);
  const dial = (id: (typeof DS_CHARACTER_DIALS)[number]["id"], track: string, thumb: string) => {
    const { label, min, max, low, high } = DS_CHARACTER_DIALS.find((d) => d.id === id)!;
    const value = character[id];
    const centred = min < 0;
    const shown = centred ? Math.round(value * 50) : Math.round(value * 100);
    return (
      <DsColourBar
        key={id}
        label={label}
        readout={centred ? signed(shown) : String(shown)}
        value={(value - min) / (max - min)}
        onChange={(x) => set({ [id]: Math.round((min + x * (max - min)) * 100) / 100 })}
        valueText={`${shown}: ${value <= min + 0.02 ? low : value >= max - 0.02 ? high : `between ${low.toLowerCase()} and ${high.toLowerCase()}`}`}
        track={track}
        thumb={thumb}
      />
    );
  };
  return (
    <>
      <DsAccordion title="Mood" inset>
        <div className="flex flex-col gap-ds-4">
          {/* The mood's word above the bar ("Balanced", "Playful"); the section is already called Mood. */}
          <DsColourBar
            label="Mood"
            title={dsMoodLabel(character.mood)}
            readout=""
            value={character.mood}
            onChange={(mood) => onTheme(dsThemeWithMood(theme, Math.round(mood * 100) / 100))}
            valueText={dsMoodLabel(character.mood)}
            track="linear-gradient(to right, var(--ds-surface), var(--ds-surface-subtle), var(--ds-surface))"
            thumb="var(--ds-fg)"
          />
          <div className="flex justify-between text-small text-ds-fg-muted">
            <span>Serious</span>
            <span>Wacky</span>
          </div>
        </div>
      </DsAccordion>
      <DsAccordion title="Appearance" inset>
        <DsField size="small" label="Background colour">
          <DsColourField
            aria-label="Background colour"
            value={character.seed ?? "#FFFFFF"}
            // White is where it starts, so white is no seed at all.
            onChange={(hex) => set({ seed: hex === "#FFFFFF" ? null : hex })}
          />
        </DsField>
        {dial("brightness", `linear-gradient(to right, ${at({ brightness: 0 })}, ${at({ brightness: 0.5 })}, ${at({ brightness: 1 })})`, base)}
        {dial("warmth", `linear-gradient(to right, ${at({ warmth: -1 })}, ${at({ warmth: 0 })}, ${at({ warmth: 1 })})`, base)}
        {dial(
          "contrast",
          `linear-gradient(to right, ${tokensAt(-1)["fg-muted"]}, ${tokensAt(0)["fg-muted"]}, ${tokensAt(1)["fg-muted"]})`,
          tokensAt(character.contrast)["fg-muted"]
        )}
        {dial("roundness", "linear-gradient(to right, var(--ds-border), var(--ds-fg))", "var(--ds-fg)")}
        {dial("depth", "linear-gradient(to right, var(--ds-border), var(--ds-fg))", "var(--ds-fg)")}
      </DsAccordion>
    </>
  );
}

/**
 * An outline's settings, for buttons and fields alike: a switch, then its
 * thickness, 1px or 2px or any other typed in the field to their right (up
 * to 8), and its transparency, a bar from solid (0) to gone (100), drawn in
 * the outline's colour.
 */
function OutlineChoice({
  label,
  on,
  width,
  opacity,
  colour,
  onChange,
}: {
  /** Names the controls for assistive tech ("Field outline"). */
  label: string;
  on: boolean;
  width: number;
  opacity: number;
  /** The outline's colour, for the transparency bar. */
  colour: string;
  onChange: (next: { outline?: boolean; outlineWidth?: number; outlineOpacity?: number }) => void;
}) {
  const preset = (DS_OUTLINE_WIDTHS as readonly number[]).includes(width);
  const [text, setText] = React.useState(preset ? "" : String(width));
  const transparency = Math.round((1 - opacity) * 100);
  return (
    <div className="flex flex-col gap-ds-16">
      {/* The switch right after its label (decisions, 2026-10-28). */}
      <label className="inline-flex items-center gap-ds-8 self-start text-p text-ds-fg">
        Outline
        <DsSwitch aria-label={label} checked={on} onCheckedChange={(outline) => onChange({ outline })} />
      </label>
      {on && (
        <>
          <div className="flex items-center gap-ds-4" role="group" aria-label={`${label} thickness`}>
            {DS_OUTLINE_WIDTHS.map((w) => (
              <DsButton
                key={w}
                size="small"
                className="min-w-0 flex-1 px-0"
                pressed={width === w}
                onClick={() => {
                  setText("");
                  onChange({ outlineWidth: w });
                }}
              >
                {w}px
              </DsButton>
            ))}
            <DsInput
              size="small"
              aria-label={`${label} thickness in pixels`}
              inputMode="numeric"
              className="min-w-0 flex-1"
              value={text}
              placeholder="Custom"
              meta="px"
              onChange={(e) => {
                setText(e.target.value);
                const px = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(px)) onChange({ outlineWidth: Math.min(DS_OUTLINE_MAX, Math.max(1, px)) });
              }}
            />
          </div>
          <DsColourBar
            label={`${label} transparency`}
            title="Transparency"
            readout={String(transparency)}
            value={1 - opacity}
            onChange={(x) => onChange({ outlineOpacity: Math.round((1 - x) * 100) / 100 })}
            valueText={transparency === 0 ? "Solid" : `${transparency}% see-through`}
            track={`linear-gradient(to right, ${colour}, transparent)`}
            thumb={colour}
          />
        </>
      )}
    </div>
  );
}

/**
 * The theme's buttons (button-style.ts; Alex, 2026-10-29): their fill,
 * Solid or Gradient, and a gradient's contrast, a bar from -50 to +50 that
 * starts at 0 (flat) in the middle, drawn in the button colour, darker at
 * the top to the left of 0 and lighter at the top to the right; an outline
 * and its thickness; a text shadow on the label and the direction its
 * light comes from (a dial, as in Photoshop); and their roundness, which
 * rounds every corner of the theme, with the pills the same or their own.
 */
function ButtonChoice({
  style,
  button,
  radius,
  pillRadius,
  onStyle,
  onRadius,
  onPillRadius,
}: {
  style: DsButtonStyle;
  /** The primary button colour in the mode shown, for the contrast bar. */
  button: string;
  radius: DsRadius;
  pillRadius: DsRadius | null;
  onStyle: (style: DsButtonStyle) => void;
  onRadius: (radius: DsRadius) => void;
  onPillRadius: (radius: DsRadius | null) => void;
}) {
  const set = (next: Partial<DsButtonStyle>) => onStyle({ ...style, ...next });
  const toggle = (label: string, on: boolean, change: (on: boolean) => void) => (
    // The switch right after its label (decisions, 2026-10-28).
    <label className="inline-flex items-center gap-ds-8 self-start text-p text-ds-fg">
      {label}
      <DsSwitch checked={on} onCheckedChange={change} />
    </label>
  );
  const contrast = Math.round(style.contrast * 50);
  return (
    <div className="flex flex-col gap-ds-16">
      <div className="flex items-center gap-ds-4" role="group" aria-label="Fill">
        {(["solid", "gradient"] as const).map((fill) => (
          <DsButton key={fill} size="small" className="min-w-0 flex-1 px-0" pressed={style.fill === fill} onClick={() => set({ fill })}>
            {fill === "solid" ? "Solid" : "Gradient"}
          </DsButton>
        ))}
      </div>
      {style.fill === "gradient" && (
        <DsColourBar
          label="Gradient contrast"
          title="Contrast"
          // -50 to +50 from a flat 0 in the middle, as the colours' brightness reads.
          readout={contrast === 0 ? "0" : `${contrast > 0 ? "+" : "−"}${Math.abs(contrast)}`}
          value={(style.contrast + 1) / 2}
          onChange={(x) => set({ contrast: Math.round((x * 2 - 1) * 50) / 50 })}
          valueText={contrast === 0 ? "Flat" : contrast > 0 ? `${contrast}, lighter at the top` : `${-contrast}, darker at the top`}
          // The top of the button across the range: darker on the left, the colour itself at 0, lighter on the right.
          track={`linear-gradient(to right, ${dsShift(button, -0.2)}, ${button}, ${dsShift(button, 0.2)})`}
          thumb={button}
        />
      )}
      <OutlineChoice
        label="Button outline"
        on={style.outline}
        width={style.outlineWidth}
        opacity={style.outlineOpacity}
        colour={dsShift(button, dsHexToHsl(button)[2] < 0.25 ? 0.2 : -0.15)}
        onChange={(next) => set(next)}
      />
      {toggle("Text shadow", style.shadow, (shadow) => set({ shadow }))}
      {style.shadow && (
        <DsField label="Direction">
          <DsAngleDial label="Text shadow direction" value={style.shadowAngle} onChange={(shadowAngle) => set({ shadowAngle })} />
        </DsField>
      )}
      <DsField label="Roundness">
        <RadiusChoice label="Roundness" radius={radius} onChange={onRadius} />
      </DsField>
      <label className="inline-flex items-center gap-ds-8 self-start text-p text-ds-fg">
        <DsCheckbox
          checked={pillRadius === null}
          // Unticked, the pills start from the buttons' corner, so nothing jumps until it's changed.
          onCheckedChange={(on) => onPillRadius(on ? null : radius)}
        />
        Same for buttons and pills
      </label>
      {pillRadius !== null && (
        <DsField label="Pill roundness">
          <RadiusChoice label="Pill roundness" radius={pillRadius} onChange={onPillRadius} />
        </DsField>
      )}
    </div>
  );
}

/**
 * The theme's roundness: None, Small (a crisp 2px), Medium, Large and
 * Custom in one row, the five sharing its width; Custom opens a field for
 * the pixels (the cards' and buttons' corner, the smaller ones scaled from
 * it). It rounds every corner, buttons first.
 */
function RadiusChoice({ label, radius, onChange }: { label: string; radius: DsRadius; onChange: (radius: DsRadius) => void }) {
  const custom = typeof radius === "number";
  const [text, setText] = React.useState(custom ? String(radius) : "");
  return (
    <div className="flex flex-col gap-ds-8">
      <div className="flex items-center gap-ds-4" role="group" aria-label={label}>
        {DS_RADII.map((r) => (
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
          aria-label={`${label} in pixels`}
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
    // The brand, not just the UI (Alex, 2026-10-29): first the site at a glance at the CMS's reading width
    // (600px), a post, an image with its caption, the subscribe card; then the same look out in the world, a
    // story, a post on X and an email, with Ilo's own photos.
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

      <figure className="flex flex-col gap-ds-8">
        <img src={`${PREVIEW_MEDIA}/ilo-lake.jpg`} alt="A still lake at dawn" className="aspect-[3/2] w-full rounded-ds-lg object-cover" />
        <figcaption className="text-small text-ds-fg-muted">Three summers at the lake, and one drop of it kept.</figcaption>
      </figure>

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
        <p className="text-small text-ds-fg-muted">Out in the world</p>
        <div className="flex flex-wrap items-start gap-ds-20">
          <PreviewStory />
          <PreviewXPost />
        </div>
        <PreviewEmail />
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

        {/* The taste feeder first: push the whole look somewhere, then tune it below (Alex, 2026-10-29). */}
        <PanelSection title="Taste">
          <TasteChoice theme={theme} onTheme={setTheme} />
        </PanelSection>

        <PanelSection
          title="Style"
          actions={
            <SectionRestore
              section="Style"
              theme={theme}
              setTheme={setTheme}
              // The mood back in the middle (Parabola's fonts with it), and every dial at rest.
              restore={(t) => ({ ...dsThemeWithMood(t, DS_DEFAULT_CHARACTER.mood), character: DS_DEFAULT_CHARACTER })}
            />
          }
        >
          <StyleChoice theme={theme} mode={mode} onTheme={setTheme} />
        </PanelSection>

        {/* The wheel, for a colour of its own over the style: folded, so the style comes first (Alex, 2026-10-29). */}
        <PanelSection
          title="Colours"
          defaultOpen={false}
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
          <ColourWheelChoice
            colours={theme.colours}
            mode={mode}
            options={dsCharacterColourOptions(theme.character)}
            onChange={(colours) => setTheme({ ...theme, colours })}
          />
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
          title="Buttons"
          actions={
            <SectionRestore
              section="Buttons"
              theme={theme}
              setTheme={setTheme}
              // Back to the character's: its roundness and depth.
              restore={(t) => ({ ...t, radius: null, pillRadius: null, buttons: null })}
            />
          }
        >
          <ButtonChoice
            style={dsThemeButtons(theme)}
            button={dsThemeColourTokens(theme, mode).button}
            radius={dsThemeRadius(theme)}
            pillRadius={theme.pillRadius}
            onStyle={(buttons) => setTheme({ ...theme, buttons })}
            onRadius={(radius) => setTheme({ ...theme, radius })}
            onPillRadius={(pillRadius) => setTheme({ ...theme, pillRadius })}
          />
        </PanelSection>

        <PanelSection
          title="Fields"
          actions={
            <SectionRestore section="Fields" theme={theme} setTheme={setTheme} restore={(t) => ({ ...t, fields: DS_DEFAULT_FIELD_STYLE })} />
          }
        >
          <OutlineChoice
            label="Field outline"
            on={theme.fields.outline}
            width={theme.fields.outlineWidth}
            opacity={theme.fields.outlineOpacity}
            colour={dsThemeColourTokens(theme, mode)["field-border"]}
            onChange={(next) => setTheme({ ...theme, fields: { ...theme.fields, ...next } })}
          />
        </PanelSection>

        <PanelSection
          title="Icons"
          actions={<SectionRestore section="Icons" theme={theme} setTheme={setTheme} restore={(t) => ({ ...t, icons: DS_DEFAULT_THEME.icons })} />}
        >
          <DsField label="Icon library">
            <DsSelect
              // Only the libraries that work: Lucide, for now.
              options={DS_ICON_LIBRARIES.filter((l) => l.ready).map((l) => ({ value: l.id, label: l.label }))}
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
