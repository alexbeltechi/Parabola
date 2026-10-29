"use client";

import * as React from "react";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  Dices,
  ChevronRight,
  ChevronUp,
  ClipboardPaste,
  Copy,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bookmark,
  Gem,
  Heart,
  Leaf,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Upload,
  Minus,
  Moon,
  MoreVertical,
  Newspaper,
  PartyPopper,
  Pencil,
  Plus,
  Rocket,
  RotateCcw,
  Wand2,
  Shirt,
  Smile,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";
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
import { cn } from "../cn";
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
  dsExpressionDials,
  dsExpressionLabel,
  dsMoodDials,
  dsMoodLabel,
  dsTemperatureLabel,
  type DsCharacter,
  type DsTasteScope,
} from "../character";
import {
  DS_TASTES,
  dsNudgeTaste,
  dsRandomTastes,
  dsShuffleTaste,
  dsTasteBackground,
  dsTasteButtons,
  dsTasteField,
  dsTasteFonts,
  dsTastePeople,
  dsTasteStory,
  type DsTasteGroup,
} from "../taste";
import {
  DS_BODY_FAMILY,
  DS_DEFAULT_THEME,
  DS_DEFAULT_THEME_ID,
  DS_HEADING_FAMILY,
  dsThemeButtons,
  dsThemeColourTokens,
  dsThemeExport,
  dsThemeRadius,
  dsThemeWithExpression,
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
 * A panel section's Restore, the icon at its header's right (every section
 * has one; Alex, 2026-10-29): puts that part of the open theme back to
 * Parabola's, with Undo in the toast.
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
    <DsButton
      size="small"
      variant="text"
      iconLeft={RotateCcw}
      aria-label={`Restore ${section}`}
      title="Restore"
      onClick={() => {
        const before = theme;
        setTheme(restore(theme));
        dsToast(`${section} restored`, { action: { label: "Undo", onClick: () => setTheme(before) } });
      }}
    />
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

/** How the preview shows Ilo: her photo (a friendly look) or her initials in the button colour (a branded one). */
type People = "photo" | "initials";

/** Ilo's avatar, a circle: her photo, or "ILO" small on the button colour. */
function PreviewAvatar({ people, className }: { people: People; className: string }) {
  if (people === "photo") {
    return <img src={`${PREVIEW_MEDIA}/ilo-portrait.jpg`} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-ds-button text-[9px] tracking-wider text-ds-on-button", className)}>
      ILO
    </span>
  );
}

/** How a story's words sit on the photo (taste.ts): boxed in the page colour, plain in white, or loud on the button colour. */
type Story = "boxed" | "plain" | "loud";

/**
 * Words on a story's photo, as Instagram sets them: each line in its own
 * box, tight, the boxes following the lines (`box-decoration-break:
 * clone`), in the page colour, the button colour, or none at all with the
 * words in white held by a soft shadow.
 */
function StoryText({ story, size, className, children }: { story: Story; size: "h3" | "small"; className?: string; children: React.ReactNode }) {
  const boxed = story !== "plain";
  return (
    <p className={cn("absolute leading-[1.3]", size === "h3" ? "text-h3" : "text-small", className)}>
      <span
        className={cn(
          "[-webkit-box-decoration-break:clone] [box-decoration-break:clone]",
          boxed && "rounded-ds-sm px-[0.4em] py-[0.1em]",
          story === "boxed" && "bg-ds-bg text-ds-fg",
          story === "loud" && "bg-ds-button text-ds-on-button"
        )}
        style={story === "plain" ? { color: "white", textShadow: "0 1px 12px rgb(0 0 0 / 0.45)" } : undefined}
      >
        {children}
      </span>
    </p>
  );
}

/**
 * A story, as Instagram shows one: Ilo's portrait full bleed, the progress
 * bars and her name at the top, and three bits of text in the theme's main
 * font, a line, a small note and a sticker, walking a little narrative,
 * set the way the taste asks (StoryText). A branded look sets them
 * squarely; a friendly one (her photo for an avatar) lets them sit loose and
 * tilted, as a person would place them.
 */
function PreviewStory({ people, story }: { people: People; story: Story }) {
  const loose = people === "photo";
  return (
    <div className="relative aspect-[9/16] w-[220px] shrink-0 overflow-hidden rounded-ds-lg bg-ds-surface">
      <img src={`${PREVIEW_MEDIA}/ilo-portrait.jpg`} alt="Ilo, by the water" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-3 top-3 flex flex-col gap-ds-8">
        <div className="flex gap-1">
          {[1, 0.4, 0.4].map((o, i) => (
            <span key={i} className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: "white", opacity: o }} />
          ))}
        </div>
        <div className="flex items-center gap-ds-8">
          <PreviewAvatar people={people} className="size-6" />
          <span className="text-small" style={{ color: "white", textShadow: "0 1px 12px rgb(0 0 0 / 0.45)" }}>
            iloodena
          </span>
        </div>
      </div>
      <StoryText story={story} size="h3" className={cn("top-[32%] left-4 max-w-[78%]", loose && "-rotate-3")}>
        Keep fewer moments
      </StoryText>
      <StoryText story={story} size="small" className={cn("top-[52%] max-w-[55%]", loose ? "right-5 rotate-2" : "left-4")}>
        {loose ? "the lake, 4am. three summers in." : "The lake, 4am. Three summers in."}
      </StoryText>
      <span
        className={cn(
          "absolute bottom-4 left-4 rounded-ds-pill px-3 py-1.5 text-small",
          loose && "-rotate-2",
          story === "loud" ? "bg-ds-bg text-ds-fg" : "bg-ds-button text-ds-on-button"
        )}
      >
        {loose ? "new letter →" : "New letter →"}
      </span>
    </div>
  );
}

/**
 * A post on X, laid out as X lays one out: her avatar beside the post, her
 * name, a check and her handle and time on one line, the ⋯, the text, the
 * photo with a hairline edge, then the counts with their icons (replies,
 * reposts, likes, views) and bookmark and share at the end.
 */
function PreviewXPost({ people }: { people: People }) {
  const count = (Icon: LucideIcon, n: string, label: string) => (
    <span className="flex items-center gap-1 text-small text-ds-fg-muted" aria-label={`${n} ${label}`}>
      <Icon aria-hidden className="size-4" />
      {n}
    </span>
  );
  return (
    <div className="flex min-w-[260px] flex-1 gap-3 rounded-ds-lg border border-ds-border bg-ds-bg p-ds-16">
      <PreviewAvatar people={people} className="size-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-ds-8">
        <div className="flex items-center gap-1 text-p">
          <span className="truncate font-semibold text-ds-fg">Ilo Odena</span>
          <BadgeCheck aria-label="Verified" className="size-4 shrink-0 text-ds-highlight" />
          <span className="truncate text-ds-fg-muted">@iloodena · 2h</span>
          <MoreHorizontal aria-hidden className="ml-auto size-4 shrink-0 text-ds-fg-muted" />
        </div>
        <p className="text-p text-ds-fg">Make the small version first. Everything I&apos;ve finished started bigger and got smaller.</p>
        <img
          src={`${PREVIEW_MEDIA}/ilo-black-sand.jpg`}
          alt="Black sand and a line of foam"
          className="aspect-[16/10] w-full rounded-ds-lg border border-ds-border object-cover"
        />
        <div className="flex items-center justify-between gap-ds-8 pr-1">
          {count(MessageCircle, "12", "replies")}
          {count(Repeat2, "48", "reposts")}
          {count(Heart, "310", "likes")}
          {count(BarChart3, "4.1K", "views")}
          <span className="flex items-center gap-ds-8 text-ds-fg-muted">
            <Bookmark aria-label="Bookmark" className="size-4" />
            <Upload aria-label="Share" className="size-4" />
          </span>
        </div>
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
        <h3 className="text-h2 text-ds-fg">Keep fewer moments</h3>
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

/** Each taste's icon, by id (taste.ts holds the data, the panel the pictures). */
const TASTE_ICONS: Record<string, LucideIcon> = {
  approachable: Smile,
  restrained: Minus,
  editorial: Newspaper,
  luxurious: Gem,
  bold: Zap,
  candid: Camera,
  playful: PartyPopper,
  wacky: Sparkles,
  tech: Terminal,
  scifi: Rocket,
  fashion: Shirt,
  natural: Leaf,
};

/** The taste pills, Feel then World, the picked ones pressed; `compact` runs them in one row for inside a section. */
function TastePills({ picked, onToggle, compact = false }: { picked: string[]; onToggle: (id: string) => void; compact?: boolean }) {
  const pills = (id: DsTasteGroup) =>
    DS_TASTES.filter((t) => t.group === id).map((t) => (
      <DsButton key={t.id} size="small" iconLeft={TASTE_ICONS[t.id]} pressed={picked.includes(t.id)} onClick={() => onToggle(t.id)}>
        {t.label}
      </DsButton>
    ));
  if (compact) {
    return (
      <div className="flex flex-wrap gap-ds-4" role="group" aria-label="Tastes">
        {pills("feel")}
        {pills("world")}
      </div>
    );
  }
  return (
    <>
      {(["feel", "world"] as const).map((id) => (
        <div key={id} className="flex flex-col gap-ds-8">
          <span className="text-small text-ds-fg-muted">{id === "feel" ? "Feel" : "World"}</span>
          <div className="flex flex-wrap gap-ds-4" role="group" aria-label={id === "feel" ? "Feel" : "World"}>
            {pills(id)}
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * The takes (Alex, 2026-10-29, "like Spotify"): every draw is a take,
 * kept in order with the one showing. Back returns to the one before,
 * forward replays an undone one or draws anew, retry draws anew from the
 * pills picked, and with Shuffle on a draw picks one or two pills at
 * random first. A draw starts the look over: colours, corners and buttons
 * given their own go back to Auto. Unpicking the last pill brings back the
 * look from before the first was picked.
 */
function useTakes(theme: DsThemeConfig, onTheme: (theme: DsThemeConfig) => void) {
  const [before, setBefore] = React.useState<DsThemeConfig | null>(null);
  const [takes, setTakes] = React.useState<{ list: DsThemeConfig[]; at: number }>({ list: [], at: -1 });
  const drawn = (ids: string[]) => {
    const next = dsShuffleTaste(ids, theme.character);
    const colours = { ...DS_DEFAULT_COLOURS, accent: { light: next.button, dark: null } };
    const drawnTheme = dsThemeWithFonts({ ...theme, character: next.character, colours, radius: null, pillRadius: null, buttons: null }, next.fonts);
    return dsThemeWithExpression(drawnTheme, next.character.expression);
  };
  // A small change, not a new look: the levers and the background nudged, now and then another font pair.
  const nudged = () => {
    const next = dsNudgeTaste(theme.character.tastes, theme.character);
    const nudgedTheme = next.fonts ? dsThemeWithFonts({ ...theme, character: next.character }, next.fonts) : { ...theme, character: next.character };
    return dsThemeWithExpression(nudgedTheme, next.character.expression);
  };
  const show = (next: DsThemeConfig) => {
    if (!before) setBefore(theme);
    setTakes(({ list, at }) => ({ list: [...list.slice(0, at + 1), next], at: at + 1 }));
    onTheme(next);
  };
  const picked = theme.character.tastes;
  // Another variation of the look locked in: the pills picked (one at random with none).
  const fresh = () => show(drawn(picked.length ? picked : dsRandomTastes()));
  return {
    canBack: takes.at > 0,
    nudge: () => show(nudged()),
    dice: () => show(drawn(dsRandomTastes(picked))),
    draw: (ids: string[]) => show(drawn(ids)),
    clear: () => {
      onTheme(before ? { ...before, character: { ...before.character, tastes: [] } } : { ...theme, character: { ...theme.character, tastes: [] } });
      setBefore(null);
    },
    reset: () => {
      setBefore(null);
      setTakes({ list: [], at: -1 });
    },
    back: () => {
      if (takes.at <= 0) return;
      setTakes({ ...takes, at: takes.at - 1 });
      onTheme(takes.list[takes.at - 1]);
    },
    forward: () => {
      if (takes.at < takes.list.length - 1) {
        setTakes({ ...takes, at: takes.at + 1 });
        return onTheme(takes.list[takes.at + 1]);
      }
      fresh();
    },
  };
}

type Takes = ReturnType<typeof useTakes>;

/**
 * The player, at the top of the panel under the theme (Alex, 2026-10-29,
 * "like Spotify"): centred, back and forward through variations of the look
 * locked in (the pills picked), with the wand between them for a small
 * nudge, not a new look; and at the right end, the dice, which starts over
 * with pills picked at random.
 */
function TakePlayer({ takes }: { takes: Takes }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
      <span />
      <div className="flex items-center gap-ds-4">
        <DsButton variant="text" iconLeft={ChevronLeft} aria-label="Previous variation" disabled={!takes.canBack} onClick={takes.back} />
        <DsButton variant="text" iconLeft={Wand2} aria-label="Nudge it a little" title="Nudge it a little" onClick={takes.nudge} />
        <DsButton variant="text" iconLeft={ChevronRight} aria-label="Next variation" title="Next variation" onClick={takes.forward} />
      </div>
      <DsButton variant="text" iconLeft={Dices} aria-label="Random look" title="Random look" className="justify-self-end" onClick={takes.dice} />
    </div>
  );
}

/** The bars' tracks, in tastes' colours: a serious ink to a wacky pink; a quiet stone to a loud orange; ice to paper. */
const MOOD_TRACK = "linear-gradient(to right, #1C1B19, var(--ds-surface), #FF3EA5)";
const EXPRESSION_TRACK = "linear-gradient(to right, #DCDCD7, var(--ds-surface), #FF4F00)";
const TEMPERATURE_TRACK = "linear-gradient(to right, #DCEBFF, var(--ds-surface), #FFE2B8)";

/**
 * The taste feeder (taste.ts; Alex, 2026-10-29): three bars, the levers a
 * taste is defined by, Mood (Serious to Wacky: roundness and the fonts),
 * Expression (Quiet to Loud: contrast, the headlines' weight, the buttons'
 * depth) and Temperature (Cool to Warm: the background's warmth and the
 * greys from it), then the style pills with icons in two
 * groups, Feel (how the brand comes across) and World (where it belongs);
 * the bars and the pills work together, a pill drawing inside its ranges on
 * both. Parabola's own is a mix of pills too (Restrained and Editorial), so
 * that's what shows picked at the start. Picking a pill changes the look at
 * once (a take, in the player at the top); unpicking the last brings back
 * the look from before the first. Restore, at the section's top right, is
 * Parabola's own again.
 */
function TasteChoice({ theme, onTheme, takes }: { theme: DsThemeConfig; onTheme: (theme: DsThemeConfig) => void; takes: Takes }) {
  const character = theme.character;
  const picked = character.tastes;
  const toggle = (id: string) => {
    const ids = picked.includes(id) ? picked.filter((t) => t !== id) : [...picked, id];
    if (ids.length) takes.draw(ids);
    else takes.clear();
  };
  return (
    <div className="flex flex-col gap-ds-16">
      <DsColourBar
        label="Mood"
        readout={dsMoodLabel(character.mood)}
        value={character.mood}
        onChange={(x) => onTheme(dsThemeWithMood(theme, Math.round(x * 100) / 100))}
        valueText={dsMoodLabel(character.mood)}
        track={MOOD_TRACK}
        ends={["Serious", "Wacky"]}
      />
      <DsColourBar
        label="Expression"
        readout={dsExpressionLabel(character.expression)}
        value={character.expression}
        onChange={(x) => onTheme(dsThemeWithExpression(theme, Math.round(x * 100) / 100))}
        valueText={dsExpressionLabel(character.expression)}
        track={EXPRESSION_TRACK}
        ends={["Quiet", "Loud"]}
      />
      <DsColourBar
        label="Temperature"
        readout={dsTemperatureLabel(character.warmth)}
        value={(character.warmth + 1) / 2}
        onChange={(x) => onTheme({ ...theme, character: { ...character, warmth: Math.round((x * 2 - 1) * 100) / 100 } })}
        valueText={dsTemperatureLabel(character.warmth)}
        track={TEMPERATURE_TRACK}
        ends={["Cool", "Warm"]}
      />
      <TastePills picked={picked} onToggle={toggle} />
    </div>
  );
}

/**
 * Taste pills inside one section (Typography, Buttons, Fields, Appearance;
 * Alex, 2026-10-29): the same pills, compact, deciding only that section's
 * values when picked (a font pair; a roundness, depth and button colour; a
 * field outline; a background), and leaving them as Parabola's own when the
 * last is unpicked. Kept on the theme (`character.scoped`).
 */
function ScopedTastes({
  scope,
  theme,
  onTheme,
  apply,
}: {
  scope: DsTasteScope;
  theme: DsThemeConfig;
  onTheme: (theme: DsThemeConfig) => void;
  /** The theme with this section's values drawn from the pills (none: Parabola's own). */
  apply: (ids: string[], theme: DsThemeConfig) => DsThemeConfig;
}) {
  const picked = theme.character.scoped[scope] ?? [];
  return (
    <TastePills
      compact
      picked={picked}
      onToggle={(id) => {
        const ids = picked.includes(id) ? picked.filter((t) => t !== id) : [...picked, id];
        const scoped = { ...theme.character.scoped };
        if (ids.length) scoped[scope] = ids;
        else delete scoped[scope];
        onTheme(apply(ids, { ...theme, character: { ...theme.character, scoped } }));
      }}
    />
  );
}

/**
 * The theme's appearance (character.ts; Alex, 2026-10-29): the background
 * as dials, Brightness first (dark to light), then Hue (a hue dragged onto a
 * white gives it a tint; a pill or Colours sets more), then Contrast.
 * Warmth is the Temperature bar in Taste, roundness lives with the
 * buttons, and depth under Expression.
 * Each bar is drawn in what it does. Taste pills at the top draw a
 * background. "Show colour controls" slides open the colours themselves
 * (the wheel, Light and Dark), for a colour of its own over the dials.
 */
function AppearanceChoice({
  theme,
  mode,
  setPreviewMode,
  onTheme,
}: {
  theme: DsThemeConfig;
  mode: "light" | "dark";
  setPreviewMode: (mode: "light" | "dark") => void;
  onTheme: (theme: DsThemeConfig) => void;
}) {
  const character = theme.character;
  const [colours, setColours] = React.useState(false);
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
    const shown = id === "hue" ? Math.round(value) : centred ? Math.round(value * 50) : Math.round(value * 100);
    return (
      <DsColourBar
        key={id}
        label={label}
        readout={id === "hue" ? `${shown}°` : centred ? signed(shown) : String(shown)}
        value={(value - min) / (max - min)}
        // A hue dragged onto a background with no colour gives it a tint, so the drag shows.
        onChange={(x) =>
          id === "hue"
            ? set({ hue: Math.round(x * 360) % 360, colour: Math.max(character.colour, 0.25) })
            : set({ [id]: Math.round((min + x * (max - min)) * 100) / 100 })
        }
        valueText={id === "hue" ? `${shown}°` : `${shown}: ${value <= min + 0.02 ? low : value >= max - 0.02 ? high : `between ${low.toLowerCase()} and ${high.toLowerCase()}`}`}
        track={track}
        thumb={thumb}
      />
    );
  };
  // The hue bar shows each hue at a strength that reads, even while the background has little colour.
  const strong = { colour: Math.max(character.colour, 0.6), brightness: Math.max(character.brightness, 0.7), warmth: 0 };
  return (
    <div className="flex flex-col gap-ds-16">
      <ScopedTastes
        scope="appearance"
        theme={theme}
        onTheme={onTheme}
        apply={(ids, t) => ({
          ...t,
          character: {
            ...t.character,
            ...(ids.length ? dsTasteBackground(ids, t.character) : { hue: 40, colour: 0, brightness: 1 }),
          },
        })}
      />
      {dial("brightness", `linear-gradient(to right, ${at({ brightness: 0 })}, ${at({ brightness: 0.5 })}, ${at({ brightness: 1 })})`, base)}
      {dial(
        "hue",
        `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => at({ ...strong, hue: h % 360 })).join(", ")})`,
        at({ ...strong })
      )}
      {dial(
        "contrast",
        `linear-gradient(to right, ${tokensAt(-1)["fg-muted"]}, ${tokensAt(0)["fg-muted"]}, ${tokensAt(1)["fg-muted"]})`,
        tokensAt(character.contrast)["fg-muted"]
      )}
      <DsButton variant="text" size="small" iconRight={colours ? ChevronUp : ChevronDown} className="-ml-2 self-start" onClick={() => setColours((on) => !on)}>
        {colours ? "Hide colour controls" : "Show colour controls"}
      </DsButton>
      {colours && (
        <>
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
            onChange={(c) => onTheme({ ...theme, colours: c })}
          />
        </>
      )}
    </div>
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
  // Ilo shows as her photo in a friendly look, her initials in a branded one; her story's words boxed, plain or
  // loud (taste.ts).
  const people = dsTastePeople(theme.character.tastes, theme.character.mood);
  const story = dsTasteStory(theme.character.tastes, theme.character.mood);
  const takes = useTakes(theme, setTheme);
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
        <h1 className="text-display text-ds-fg">Creating tasteful AI in an AI-infested world</h1>
        <h2 className="text-h2 text-ds-fg">Where to let it decide, and where to keep the choice</h2>
        <p className="text-prose text-ds-fg-muted">
          The hard part isn&apos;t what AI can do. It&apos;s knowing which decisions to hand over and which ones have to stay
          mine, because the ones I keep are the ones people recognise me by.
        </p>
        <p className="text-small text-ds-fg-muted">2026 · 4 min · Taste, the floor</p>
        {/* The one big marketing button on the page, in its context: on to the essay. */}
        <div>
          <DsButton variant="primary" size="large" iconRight={ArrowRight}>
            Read the essay
          </DsButton>
        </div>
      </article>

      <figure className="flex flex-col gap-ds-8">
        <img src={`${PREVIEW_MEDIA}/ilo-lake.jpg`} alt="A still lake at dawn" className="aspect-[3/2] w-full rounded-ds-lg object-cover" />
        <figcaption className="text-small text-ds-fg-muted">Three summers at the lake, and one drop of it kept.</figcaption>
      </figure>

      {/* A card above the fold, on the surface, with the big marketing buttons. */}
      <section className="@container flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-20">
        <div className="flex flex-col gap-ds-4">
          <h3 className="text-h3 text-ds-fg">Keep up with my thoughts</h3>
          <p className="text-p text-ds-fg-muted">One letter in your inbox a week.</p>
        </div>
        <div className="@max-2xl:ds-fields-fill">
          <DsInput aria-label="Email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-wrap items-center gap-ds-8">
          <DsButton variant="primary">Subscribe</DsButton>
          <DsButton>Learn more</DsButton>
        </div>
      </section>

      <section className="flex flex-col gap-ds-20">
        <p className="text-small text-ds-fg-muted">Out in the world</p>
        <div className="flex flex-wrap items-start gap-ds-20">
          <PreviewStory people={people} story={story} />
          <PreviewXPost people={people} />
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
          <TakePlayer takes={takes} />
        </PanelSection>

        {/* The taste feeder first: push the whole look somewhere, then tune it below (Alex, 2026-10-29). */}
        <PanelSection
          title="Taste"
          actions={
            <SectionRestore
              section="Taste"
              theme={theme}
              setTheme={setTheme}
              // Parabola's own again: its pills, the bars at rest, its fonts, every value Auto.
              restore={(t) => {
                takes.reset();
                return dsThemeWithFonts(
                  { ...t, character: DS_DEFAULT_CHARACTER, colours: DS_DEFAULT_COLOURS, radius: null, pillRadius: null, buttons: null },
                  null
                );
              }}
            />
          }
        >
          <TasteChoice theme={theme} onTheme={setTheme} takes={takes} />
        </PanelSection>

        <PanelSection
          title="Appearance"
          actions={
            <SectionRestore
              section="Appearance"
              theme={theme}
              setTheme={setTheme}
              // The dials back where the bars put them, the pills off, every colour Auto.
              restore={(t) => ({
                ...t,
                character: {
                  ...t.character,
                  scoped: { ...t.character.scoped, appearance: undefined },
                  hue: 40,
                  colour: 0,
                  brightness: 1,
                  ...dsExpressionDials(t.character.expression),
                },
                colours: DS_DEFAULT_COLOURS,
              })}
            />
          }
        >
          <AppearanceChoice theme={theme} mode={mode} setPreviewMode={setPreviewMode} onTheme={setTheme} />
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
          <ScopedTastes scope="type" theme={theme} onTheme={setTheme} apply={(ids, t) => dsThemeWithFonts(t, dsTasteFonts(ids))} />
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
          <ScopedTastes
            scope="buttons"
            theme={theme}
            onTheme={setTheme}
            apply={(ids, t) => {
              if (!ids.length) {
                return {
                  ...t,
                  character: { ...t.character, roundness: dsMoodDials(t.character.mood).roundness, depth: dsExpressionDials(t.character.expression).depth },
                  colours: { ...t.colours, accent: { light: null, dark: null } },
                  radius: null,
                  pillRadius: null,
                  buttons: null,
                };
              }
              const { roundness, depth, button } = dsTasteButtons(ids, dsThemeColourTokens(t, "light").bg);
              return {
                ...t,
                character: { ...t.character, roundness, depth },
                colours: { ...t.colours, accent: { light: button, dark: null } },
                radius: null,
                pillRadius: null,
                buttons: null,
              };
            }}
          />
          {/* Roundness is the UI's, so it sits with the buttons (Alex, 2026-10-29); Custom below overrides it. */}
          <DsColourBar
            label="Roundness"
            readout={String(Math.round(theme.character.roundness * 100))}
            value={theme.character.roundness}
            onChange={(x) => setTheme({ ...theme, character: { ...theme.character, roundness: Math.round(x * 100) / 100 } })}
            valueText={`${Math.round(theme.character.roundness * 100)}: ${theme.character.roundness < 0.08 ? "sharp" : theme.character.roundness >= 0.92 ? "round" : "between"}`}
            track="linear-gradient(to right, var(--ds-border), var(--ds-fg))"
            thumb="var(--ds-fg)"
          />
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
          <ScopedTastes
            scope="fields"
            theme={theme}
            onTheme={setTheme}
            apply={(ids, t) => ({ ...t, fields: ids.length ? dsTasteField(ids) : DS_DEFAULT_FIELD_STYLE })}
          />
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
