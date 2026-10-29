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
  Ruler,
  Send,
  RotateCcw,
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
import {
  DsConfirmDialog,
  DsDialog,
  DsDialogActions,
} from "../primitives/dialog";
import {
  DsDropdown,
  DsDropdownContent,
  DsDropdownItem,
  DsDropdownSeparator,
  DsDropdownTrigger,
} from "../primitives/dropdown";
import { DsNavItem } from "../primitives/nav-item";
import { DsField, DsInput, DsTextarea } from "../primitives/field";
import { DsDivider } from "../primitives/divider";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { dsToast } from "../primitives/toast";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsInfoCard } from "../components/info-card";
import { dsFontOptions } from "../components/font-pairing";
import {
  DS_DEFAULT_COLOURS,
  DS_ICON_LIBRARIES,
  dsColourShown,
  dsHexToHsl,
  dsNormalizeHex,
  dsShift,
  type DsColourOptions,
  type DsColourKind,
  type DsThemeColour,
  type DsThemeColours,
} from "../colours";
import { cn } from "../cn";
import { DsScrollRow } from "../primitives/scroll-row";
import { DsColourWheel } from "../components/colour-wheel";
import { DsColourBar } from "../components/colour-picker";
import { DsSwitch } from "../primitives/switch";
import {
  DS_DEFAULT_FIELD_STYLE,
  DS_OUTLINE_MAX,
  DS_OUTLINE_WIDTHS,
  type DsButtonStyle,
} from "../button-style";
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
  dsPickTaste,
  dsRandomTastes,
  dsShuffleTaste,
  dsTasteBackground,
  dsTasteButtons,
  dsTasteField,
  dsTasteFonts,
  dsTastePeople,
  dsTasteStory,
  dsTasteTilt,
  dsTasteVoice,
  type DsTone,
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
import {
  InPanel,
  InPanelFooter,
  PanelSection,
  RESTORE,
  useThemeEditor,
} from "./theme-editor";

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
  const set = (kind: DsColourKind, next: Partial<DsThemeColour>) =>
    onChange({ ...colours, [kind]: { ...colours[kind], ...next } });
  const basis = (kind: DsColourKind) =>
    mode === "dark" ? "light theme" : LIGHT_BASIS[kind];
  const own = (kind: DsColourKind) => colours[kind][pick] !== null;
  const based = (kind: DsColourKind) => !own(kind) && basis(kind) !== null;
  const shown = (kind: DsColourKind) =>
    dsColourShown(colours, kind, mode, options);
  const label = (kind: DsColourKind) =>
    WHEEL.find((w) => w.kind === kind)?.label ?? kind;
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
          floor:
            w.kind === "text" || w.kind === "muted"
              ? 0.45
              : w.kind === "accent"
                ? 0.7
                : 0,
        }))}
        selected={selected}
        onSelect={(id) => setSelected(id as DsColourKind)}
        onChange={(id, hex) => set(id as DsColourKind, { [pick]: hex })}
        onRemove={(id) => remove(id as DsColourKind)}
      />
      {/* Named for the colour it is, its hex inside. */}
      <DsField
        size="small"
        label={`Colour: ${chosen.label}`}
        className="w-full"
      >
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
                    <DsButton
                      size="small"
                      variant="text"
                      iconLeft={MoreVertical}
                      aria-label={`More for ${w.label}`}
                    />
                  </DsDropdownTrigger>
                  <DsDropdownContent align="end">
                    <DsDropdownItem
                      iconLeft={Copy}
                      onSelect={() =>
                        navigator.clipboard
                          .writeText(shown(w.kind))
                          .then(() =>
                            dsToast.success(`${shown(w.kind)} copied`),
                          )
                      }
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
                    <DsDropdownItem
                      iconLeft={RotateCcw}
                      disabled={!own(w.kind)}
                      onSelect={() => remove(w.kind)}
                    >
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
        dsToast(`${section} restored`, {
          action: { label: "Undo", onClick: () => setTheme(before) },
        });
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
function ThemeCode({
  theme,
  name,
  setTheme,
}: {
  theme: DsThemeConfig;
  name: string;
  setTheme: (theme: DsThemeConfig) => void;
}) {
  const code = React.useMemo(
    () => JSON.stringify(dsThemeExport(theme, name), null, 2),
    [theme, name],
  );
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
          onClick={() =>
            navigator.clipboard
              .writeText(code)
              .then(() => dsToast.success("Theme copied"))
          }
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

/** What Ilo says in one place or another: her post on X, her story's three bits, a carousel's cover, a letter. */
type PreviewCopy = {
  x: string;
  story: [title: string, note: string, sticker: string];
  carousel: string;
  email: { subject: string; title: string; body: string; action: string };
};

/**
 * The same news in each voice a taste can have (taste.ts, DsTone; Alex,
 * 2026-10-29: "the text doesn't change in the tweet; it obviously ought
 * to"). Ilo is a maker, Y3K's kind (craft, art, sound, writing): she has
 * finished Dragonfly, the silver glasses she wears, made over three summers
 * at the lake, with recordings of the water. Told calm, exact, warm, sold,
 * shouted, confessed, argued, joked, screamed, logged, styled or felt.
 */
const VOICE_COPY: Record<DsTone, PreviewCopy> = {
  calm: {
    x: "Make the small version first. Everything I've finished started bigger and got smaller.",
    story: [
      "Dragonfly, finished",
      "Three summers at the lake, one pair of glasses.",
      "New letter →",
    ],
    carousel: "5 things I learned making Dragonfly",
    email: {
      subject: "A letter from the lake",
      title: "Dragonfly, finished",
      body: "Three summers, one pair of glasses, and a few songs I recorded at the water while the silver set. Here's how it came together.",
      action: "Read the letter",
    },
  },
  precise: {
    x: "Dragonfly is finished: hand-formed silver, 38 g, three summers of work. Process notes and the recordings are on the site.",
    story: ["Dragonfly", "Silver, 38 g. 2024–2026.", "See the process →"],
    carousel: "5 steps from sketch to silver",
    email: {
      subject: "Dragonfly is finished",
      title: "How Dragonfly was made",
      body: "Sketches, moulds, eleven failed casts and the one that worked. The whole process, with notes and recordings, is on the site.",
      action: "See the process",
    },
  },
  warm: {
    x: "Finally finished the dragonfly glasses! Three summers of mornings at the lake went into these. I can't wait for you to see them.",
    story: [
      "They're done!",
      "Three summers of mornings at the lake.",
      "Say hi →",
    ],
    carousel: "5 reasons I nearly gave up (and didn't)",
    email: {
      subject: "Hi, it's Ilo",
      title: "Come see what I made",
      body: "I've worked on these by the lake for three summers, and I wanted you to see them first. Pour a coffee.",
      action: "Read my letter",
    },
  },
  elegant: {
    x: "Dragonfly. Silver, glass, three summers.",
    story: ["Dragonfly", "One of one.", "Discover"],
    carousel: "5 details, one piece",
    email: {
      subject: "Dragonfly",
      title: "One of one",
      body: "Silver formed by hand over three summers at the lake. A single piece, signed.",
      action: "View the piece",
    },
  },
  loud: {
    x: "Stop starting. Finish one thing. I did: Dragonfly.",
    story: [
      "Finish the thing.",
      "Three summers. One piece. Done.",
      "Read it →",
    ],
    carousel: "5 rules for finishing",
    email: {
      subject: "Finish one thing.",
      title: "Done beats perfect.",
      body: "Three summers, one piece, finished. Here's what it took, and why your next one should be finished too.",
      action: "Read the letter",
    },
  },
  candid: {
    x: "Three summers and eleven failed casts to finish these glasses. Cried twice. Worth it.",
    story: [
      "ok, they're finally done",
      "eleven failed casts. not joking.",
      "the letter →",
    ],
    carousel: "5 mistakes I made on Dragonfly",
    email: {
      subject: "Eleven failed casts",
      title: "What finishing actually looked like",
      body: "It wasn't tidy and it wasn't quick. Here's the whole mess, and the one cast that worked.",
      action: "Read the letter",
    },
  },
  considered: {
    x: "Taste is mostly subtraction. The work people remember me by is what was left once I stopped adding.",
    story: [
      "Keep fewer things",
      "On finishing, after three summers at the lake.",
      "Read the essay →",
    ],
    carousel: "5 ideas on making less",
    email: {
      subject: "On finishing",
      title: "Keep fewer things",
      body: "Three summers on one piece taught me that choosing is the work. This letter is about what it costs, and what it gives back.",
      action: "Read the essay",
    },
  },
  playful: {
    x: "Made myself dragonfly glasses 🕶️ The real dragonflies at the lake seem to approve.",
    story: ["new face, who dis 🕶️", "the dragonflies approve", "new letter ✨"],
    carousel: "5 reasons dragonflies are my muse",
    email: {
      subject: "I made dragonfly glasses 🕶️",
      title: "Notes from the 4am club",
      body: "Three summers, a lot of cold coffee and some very patient dragonflies. Here's what came out of it.",
      action: "Come see",
    },
  },
  wild: {
    x: "I MADE DRAGONFLY GLASSES!!! Three summers. Zero regrets. LOOK AT THEM!!!",
    story: ["DRAGONFLY!!!", "three summers. ZERO regrets.", "LOOK →"],
    carousel: "5 things the lake made me do",
    email: {
      subject: "I MADE DRAGONFLY GLASSES",
      title: "It's another planet",
      body: "Silver, glass, three summers and no explanations. Open at your own risk.",
      action: "OPEN IT",
    },
  },
  futurist: {
    x: "Log, 04:00. Lake surface still. Dragonfly unit complete: silver, glass, 38 g. Field recordings attached.",
    story: ["Dragonfly / 03", "Status: complete. Signal: still.", "Open log →"],
    carousel: "5 frames from the build",
    email: {
      subject: "Transmission 03: Dragonfly",
      title: "Unit complete",
      body: "Built at the lake over three summers, in 04:00 sessions. Schematics, field recordings and the finished piece.",
      action: "Open transmission",
    },
  },
  chic: {
    x: "Dragonfly. Silver eyewear, one of one. Out now.",
    story: ["Dragonfly", "SS27. Silver, by hand.", "Shop the piece"],
    carousel: "5 ways to wear Dragonfly",
    email: {
      subject: "Dragonfly",
      title: "The silver series",
      body: "Hand-formed eyewear, made at the water's edge. One of one, now online.",
      action: "Shop the piece",
    },
  },
  grounded: {
    x: "Mist on the water, silver on the bench, a dragonfly on a reed. Three summers of mornings like that, and now the piece is done.",
    story: ["Slow mornings", "Mist, reeds, cold silver.", "Read the letter →"],
    carousel: "5 sounds from the lake at dawn",
    email: {
      subject: "From the water's edge",
      title: "Slow mornings, a finished piece",
      body: "The mist lifts around five. I worked at a bench by the reeds for three summers, and recorded the water while the silver set.",
      action: "Read the letter",
    },
  },
};

/** How the preview shows Ilo: her photo (a friendly look) or her initials in the button colour (a branded one). */
type People = "photo" | "initials";

/** Ilo's avatar, a circle: her photo, or "ILO" small on the button colour. */
function PreviewAvatar({
  people,
  className,
}: {
  people: People;
  className: string;
}) {
  if (people === "photo") {
    return (
      <img
        src={`${PREVIEW_MEDIA}/ilo-portrait.jpg`}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-ds-button text-[9px] tracking-wider text-ds-on-button",
        className,
      )}
    >
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
function StoryText({
  story,
  size,
  className,
  children,
}: {
  story: Story;
  size: "h3" | "small";
  className?: string;
  children: React.ReactNode;
}) {
  const boxed = story !== "plain";
  return (
    <p
      className={cn(
        "absolute leading-[1.3]",
        size === "h3" ? "text-h3" : "text-small",
        className,
      )}
    >
      <span
        className={cn(
          "[-webkit-box-decoration-break:clone] [box-decoration-break:clone]",
          boxed && "rounded-ds-sm px-[0.4em] py-[0.1em]",
          story === "boxed" && "bg-ds-bg text-ds-fg",
          story === "loud" && "bg-ds-button text-ds-on-button",
        )}
        style={
          story === "plain"
            ? { color: "white", textShadow: "0 1px 12px rgb(0 0 0 / 0.45)" }
            : undefined
        }
      >
        {children}
      </span>
    </p>
  );
}

/**
 * A story, as Instagram shows one: Ilo's portrait full bleed, the progress
 * bars and her name at the top, and three bits of text in the theme's main
 * font, a line, a small note and a sticker, in the taste's voice, set the
 * way the taste asks (StoryText). They sit square, except in a playful or
 * wacky taste, which lets them sit loose and tilted, as a person would place
 * them (dsTasteTilt; Alex, 2026-10-29).
 */
function PreviewStory({
  people,
  story,
  tilt,
  copy,
}: {
  people: People;
  story: Story;
  tilt: boolean;
  copy: PreviewCopy;
}) {
  const [title, note, sticker] = copy.story;
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-ds-lg bg-ds-surface">
      <img
        src={`${PREVIEW_MEDIA}/ilo-portrait.jpg`}
        alt="Ilo, by the water"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-x-3 top-3 flex flex-col gap-ds-8">
        <div className="flex gap-1">
          {[1, 0.4, 0.4].map((o, i) => (
            <span
              key={i}
              className="h-0.5 flex-1 rounded-full"
              style={{ backgroundColor: "white", opacity: o }}
            />
          ))}
        </div>
        <div className="flex items-center gap-ds-8">
          <PreviewAvatar people={people} className="size-6" />
          <span
            className="text-small"
            style={{
              color: "white",
              textShadow: "0 1px 12px rgb(0 0 0 / 0.45)",
            }}
          >
            iloodena
          </span>
        </div>
      </div>
      <StoryText
        story={story}
        size="h3"
        className={cn("top-[32%] left-4 max-w-[78%]", tilt && "-rotate-3")}
      >
        {title}
      </StoryText>
      <StoryText
        story={story}
        size="small"
        className={cn(
          "top-[52%] max-w-[55%]",
          tilt ? "right-5 rotate-2" : "left-4",
        )}
      >
        {note}
      </StoryText>
      <span
        className={cn(
          "absolute bottom-4 left-4 rounded-ds-pill px-3 py-1.5 text-small",
          tilt && "-rotate-2",
          story === "loud"
            ? "bg-ds-bg text-ds-fg"
            : "bg-ds-button text-ds-on-button",
        )}
      >
        {sticker}
      </span>
    </div>
  );
}

/**
 * A post in the feed, beside the story (Alex, 2026-10-29): a carousel's
 * cover, square, another of Ilo's photos with its title on it ("5 …") the
 * way her story sets words, "1/5" in the corner, the actions under it and
 * the carousel's dots.
 */
function PreviewCarouselPost({
  people,
  story,
  copy,
}: {
  people: People;
  story: Story;
  copy: PreviewCopy;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-ds-8 rounded-ds-lg border border-ds-border bg-ds-bg p-ds-16">
      <div className="flex items-center gap-ds-8">
        <PreviewAvatar people={people} className="size-6" />
        <span className="text-small text-ds-fg">iloodena</span>
        <MoreHorizontal
          aria-hidden
          className="ml-auto size-4 text-ds-fg-muted"
        />
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-ds-md bg-ds-surface">
        <img
          src={`${PREVIEW_MEDIA}/ilo-lake.jpg`}
          alt="A still lake at dawn"
          className="absolute inset-0 size-full object-cover"
        />
        <span
          className="absolute top-3 right-3 rounded-ds-pill px-2 py-0.5 text-small"
          style={{ color: "white", backgroundColor: "rgb(0 0 0 / 0.45)" }}
        >
          1/5
        </span>
        <StoryText
          story={story}
          size="h3"
          className="bottom-4 left-4 max-w-[80%]"
        >
          {copy.carousel}
        </StoryText>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center text-ds-fg">
        <span className="flex items-center gap-ds-8">
          <Heart aria-label="Like" className="size-5" />
          <MessageCircle aria-label="Comment" className="size-5" />
          <Send aria-label="Share" className="size-5" />
        </span>
        <span className="flex gap-1" aria-label="1 of 5">
          {[1, 0, 0, 0, 0].map((on, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full",
                on ? "bg-ds-highlight" : "bg-ds-border",
              )}
            />
          ))}
        </span>
        <Bookmark aria-label="Save" className="size-5 justify-self-end" />
      </div>
    </div>
  );
}

/**
 * A post on X, laid out as X lays one out: her avatar beside the post, her
 * name, a check and her handle and time on one line, the ⋯, the text, the
 * photo (cropped square, her head in), then the counts with their icons (replies,
 * reposts, likes, views) and bookmark and share at the end.
 */
function PreviewXPost({ people, copy }: { people: People; copy: PreviewCopy }) {
  const count = (Icon: LucideIcon, n: string, label: string) => (
    <span
      className="flex items-center gap-1 text-small text-ds-fg-muted"
      aria-label={`${n} ${label}`}
    >
      <Icon aria-hidden className="size-4" />
      {n}
    </span>
  );
  return (
    <div className="flex w-full gap-3 rounded-ds-lg border border-ds-border bg-ds-bg p-ds-16">
      <PreviewAvatar people={people} className="size-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-ds-8">
        <div className="flex items-center gap-1 text-p">
          <span className="truncate font-semibold text-ds-fg">Ilo Odena</span>
          <BadgeCheck
            aria-label="Verified"
            className="size-4 shrink-0 text-ds-highlight"
          />
          <span className="truncate text-ds-fg-muted">@iloodena · 2h</span>
          <MoreHorizontal
            aria-hidden
            className="ml-auto size-4 shrink-0 text-ds-fg-muted"
          />
        </div>
        <p className="text-p text-ds-fg">{copy.x}</p>
        <img
          src={`${PREVIEW_MEDIA}/ilo-black-sand.jpg`}
          alt="Black sand and a line of foam"
          className="aspect-square w-full rounded-ds-lg object-cover object-[50%_30%]"
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

/** An email, as a reader's inbox opens one: who it's from, its subject, then the letter on the page colour, in the taste's voice. */
function PreviewEmail({ copy }: { copy: PreviewCopy }) {
  return (
    <div className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-16">
      <div className="flex flex-col gap-ds-4">
        <span className="text-small text-ds-fg-muted">
          Ilo Odena · The studio notebook
        </span>
        <span className="text-p text-ds-fg">{copy.email.subject}</span>
      </div>
      <div className="flex flex-col gap-ds-16 rounded-ds-md bg-ds-bg p-ds-20">
        <h3 className="text-h2 text-ds-fg">{copy.email.title}</h3>
        <p className="text-prose text-ds-fg-muted">{copy.email.body}</p>
        <div>
          <DsButton variant="primary">{copy.email.action}</DsButton>
        </div>
        <p className="text-small text-ds-fg-subtle">
          You&apos;re getting this because you subscribed at iloodena.com.
          Unsubscribe.
        </p>
      </div>
    </div>
  );
}

/** A part of the preview: a divider, its name as the panel's sections show theirs, then what it shows (Alex, 2026-10-29). */
function PreviewPart({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-ds-20" aria-label={title}>
      <div className="flex flex-col gap-ds-16">
        <DsDivider />
        <p className="text-p text-ds-fg-muted">{title}</p>
      </div>
      <div className={cn("flex flex-col gap-ds-20", className)}>{children}</div>
    </section>
  );
}

/**
 * The brand in words (Alex, 2026-10-29, "taste rules, brand rules"): a
 * style statement from the pills and the bars (the tastes, then the mood,
 * the expression and the temperature, and the fonts it's set in), then the
 * voice, a rule from each taste picked. What the preview's words follow,
 * and what an agent writing for the brand would read.
 */
function PreviewBrand({
  theme,
  rules,
}: {
  theme: DsThemeConfig;
  rules: string[];
}) {
  const c = theme.character;
  const tastes = DS_TASTES.filter((t) => c.tastes.includes(t.id)).map(
    (t) => t.label,
  );
  const named = tastes.length ? `${tastes.join(" and ")}. ` : "";
  const feel = [
    dsMoodLabel(c.mood),
    dsExpressionLabel(c.expression),
    dsTemperatureLabel(c.warmth),
  ].map((w) => w.toLowerCase());
  const names = new Map(dsFontOptions(theme).map((o) => [o.value, o.label]));
  const fonts = [
    ...new Set(theme.families.map((f) => names.get(f.font) ?? f.font)),
  ];
  return (
    <PreviewPart title="Brand">
      <p className="text-h3 text-ds-fg">
        {named}
        {`${feel[0][0].toUpperCase()}${feel[0].slice(1)}, ${feel[1]} and ${feel[2]}, set in ${fonts.join(" and ")}.`}
      </p>
      <div className="flex flex-col gap-ds-8">
        <span className="text-p text-ds-fg">Voice</span>
        <ul className="flex list-disc flex-col gap-ds-4 pl-5 text-p text-ds-fg-muted">
          {(rules.length
            ? rules
            : ["Plain words and short sentences; nothing shouted."]
          ).map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    </PreviewPart>
  );
}

/** Each taste's icon, by id (taste.ts holds the data, the panel the pictures). */
const TASTE_ICONS: Record<string, LucideIcon> = {
  approachable: Smile,
  restrained: Minus,
  technical: Ruler,
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

/**
 * The taste pills in their tracks, Feel then World, each a row that slides
 * sideways (DsScrollRow) and takes one pick, as tabs do. The pills are the
 * light kind (text buttons): no fill at rest, a soft one when picked, with
 * an icon each. `compact` leaves the tracks' names off, inside a section.
 */
function TastePills({
  picked,
  onToggle,
  compact = false,
}: {
  picked: string[];
  onToggle: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-ds-8">
      {(["feel", "world"] as const).map((id) => (
        <div key={id} className="flex flex-col gap-ds-4">
          {!compact && (
            <span className="text-small text-ds-fg-muted">
              {id === "feel" ? "Feel" : "World"}
            </span>
          )}
          <DsScrollRow
            role="group"
            aria-label={id === "feel" ? "Feel" : "World"}
            className="-mx-2 px-2"
          >
            {DS_TASTES.filter((t) => t.group === id).map((t) => (
              <DsButton
                key={t.id}
                size="small"
                variant="text"
                iconLeft={TASTE_ICONS[t.id]}
                pressed={picked.includes(t.id)}
                onClick={() => onToggle(t.id)}
              >
                {t.label}
              </DsButton>
            ))}
          </DsScrollRow>
        </div>
      ))}
    </div>
  );
}

/**
 * The takes (Alex, 2026-10-29): every draw is a take, kept in order with
 * the one showing. Back returns to the one before; forward replays an
 * undone one, or draws a new variation inside the pills picked (the same
 * Feel and World, another place in their ranges); the dice picks new pills
 * at random and draws wide. A draw starts the look over: colours, corners and buttons
 * given their own go back to Auto. Unpicking the last pill brings back the
 * look from before the first was picked.
 */
function useTakes(
  theme: DsThemeConfig,
  onTheme: (theme: DsThemeConfig) => void,
) {
  const [before, setBefore] = React.useState<DsThemeConfig | null>(null);
  // The last look had with each pick of pills, tweaks and all (Alex, 2026-10-29: back to Approachable should be
  // the Approachable he saw). Forward and the dice are for new ones; picking another theme forgets them (reset).
  const seen = React.useRef(new Map<string, DsThemeConfig>());
  const keyOf = (ids: string[]) => [...ids].sort().join();
  const current = keyOf(theme.character.tastes);
  React.useEffect(() => {
    seen.current.set(current, theme);
  }, [current, theme]);
  const [takes, setTakes] = React.useState<{
    list: DsThemeConfig[];
    at: number;
  }>({ list: [], at: -1 });
  const drawn = (ids: string[], wide = false) => {
    const next = dsShuffleTaste(ids, theme.character, wide);
    const colours = {
      ...DS_DEFAULT_COLOURS,
      accent: { light: next.button, dark: null },
    };
    const drawnTheme = dsThemeWithFonts(
      {
        ...theme,
        character: next.character,
        colours,
        radius: null,
        pillRadius: null,
        buttons: null,
      },
      next.fonts,
    );
    return dsThemeWithExpression(drawnTheme, next.character.expression);
  };
  const show = (next: DsThemeConfig) => {
    if (!before) setBefore(theme);
    setTakes(({ list, at }) => ({
      list: [...list.slice(0, at + 1), next],
      at: at + 1,
    }));
    onTheme(next);
  };
  const picked = theme.character.tastes;
  // Another variation of the look locked in: the pills picked (one at random with none).
  const fresh = () => show(drawn(picked.length ? picked : dsRandomTastes()));
  return {
    canBack: takes.at > 0,
    dice: () => show(drawn(dsRandomTastes(picked), true)),
    draw: (ids: string[]) => show(seen.current.get(keyOf(ids)) ?? drawn(ids)),
    clear: () => {
      onTheme(
        before
          ? { ...before, character: { ...before.character, tastes: [] } }
          : { ...theme, character: { ...theme.character, tastes: [] } },
      );
      setBefore(null);
    },
    reset: () => {
      seen.current.clear();
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
 * Back, forward and the dice, at the Theme section's top right beside its
 * menu (Alex, 2026-10-29): back and forward step through variations of the
 * look locked in (the pills picked), forward drawing a new one at the end;
 * the dice starts over with other pills. A variation worth keeping is saved
 * as a new theme, at the panel's foot.
 */
function TakeControls({ takes }: { takes: Takes }) {
  return (
    <>
      <DsButton
        size="small"
        variant="text"
        iconLeft={ChevronLeft}
        aria-label="Previous variation"
        title="Previous variation"
        disabled={!takes.canBack}
        onClick={takes.back}
      />
      <DsButton
        size="small"
        variant="text"
        iconLeft={ChevronRight}
        aria-label="Next variation"
        title="Next variation"
        onClick={takes.forward}
      />
      <DsButton
        size="small"
        variant="text"
        iconLeft={Dices}
        aria-label="Random look"
        title="Random look"
        onClick={takes.dice}
      />
    </>
  );
}

/** The bars' tracks, in tastes' colours: a serious ink to a wacky pink; a quiet stone to a loud orange; ice to paper. */
const MOOD_TRACK =
  "linear-gradient(to right, #1C1B19, var(--ds-surface), #FF3EA5)";
const EXPRESSION_TRACK =
  "linear-gradient(to right, #DCDCD7, var(--ds-surface), #FF4F00)";
const TEMPERATURE_TRACK =
  "linear-gradient(to right, #DCEBFF, var(--ds-surface), #FFE2B8)";

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
function TasteChoice({
  theme,
  onTheme,
  takes,
}: {
  theme: DsThemeConfig;
  onTheme: (theme: DsThemeConfig) => void;
  takes: Takes;
}) {
  const character = theme.character;
  const picked = character.tastes;
  // One pick per track: picking replaces the track's other pick, picking it again takes it off.
  const toggle = (id: string) => {
    const ids = dsPickTaste(picked, id);
    if (ids.length) takes.draw(ids);
    else takes.clear();
  };
  return (
    <div className="flex flex-col gap-ds-16">
      <DsColourBar
        label="Mood"
        readout={dsMoodLabel(character.mood)}
        value={character.mood}
        onChange={(x) =>
          onTheme(dsThemeWithMood(theme, Math.round(x * 100) / 100))
        }
        valueText={dsMoodLabel(character.mood)}
        track={MOOD_TRACK}
        ends={["Serious", "Wacky"]}
      />
      <DsColourBar
        label="Expression"
        readout={dsExpressionLabel(character.expression)}
        value={character.expression}
        onChange={(x) =>
          onTheme(dsThemeWithExpression(theme, Math.round(x * 100) / 100))
        }
        valueText={dsExpressionLabel(character.expression)}
        track={EXPRESSION_TRACK}
        ends={["Quiet", "Loud"]}
      />
      <DsColourBar
        label="Temperature"
        readout={dsTemperatureLabel(character.warmth)}
        value={(character.warmth + 1) / 2}
        onChange={(x) =>
          onTheme({
            ...theme,
            character: {
              ...character,
              warmth: Math.round((x * 2 - 1) * 100) / 100,
            },
          })
        }
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
        const ids = dsPickTaste(picked, id);
        const scoped = { ...theme.character.scoped };
        if (ids.length) scoped[scope] = ids;
        else delete scoped[scope];
        onTheme(
          apply(ids, { ...theme, character: { ...theme.character, scoped } }),
        );
      }}
    />
  );
}

/**
 * A section's fine-tuning, folded (Alex, 2026-10-29): the pills come first,
 * and "Show advanced options" opens the sliders and fields under them.
 */
function AdvancedOptions({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <DsButton
        variant="text"
        size="small"
        iconRight={open ? ChevronUp : ChevronDown}
        className="-ml-2 self-start"
        onClick={() => setOpen((on) => !on)}
      >
        {open ? "Hide advanced options" : "Show advanced options"}
      </DsButton>
      {open && <div className="flex flex-col gap-ds-16">{children}</div>}
    </>
  );
}

/**
 * The theme's appearance (character.ts; Alex, 2026-10-29): the background
 * as dials, Brightness first (dark to light), then Hue (a hue dragged onto a
 * white gives it a tint; a pill or Colours sets more), then Contrast.
 * Warmth is the Temperature bar in Taste, roundness lives with the
 * buttons, and depth under Expression.
 * Each bar is drawn in what it does. Taste pills at the top draw a
 * background; "Show advanced options" opens the dials and the colours
 * themselves (the wheel, for the mode picked under the theme), for a
 * colour of its own.
 */
function AppearanceChoice({
  theme,
  mode,
  onTheme,
}: {
  theme: DsThemeConfig;
  mode: "light" | "dark";
  onTheme: (theme: DsThemeConfig) => void;
}) {
  const character = theme.character;
  const set = (next: Partial<DsCharacter>) =>
    onTheme({ ...theme, character: { ...character, ...next } });
  const at = (next: Partial<DsCharacter>) =>
    dsCharacterBase({ ...character, ...next }) ?? "#FFFFFF";
  const tokensAt = (contrast: number) =>
    dsThemeColourTokens(
      { ...theme, character: { ...character, contrast } },
      mode,
    );
  const base = dsThemeColourTokens(theme, mode).bg;
  // -50 to +50 from 0 in the middle, as the colours' numbers read.
  const signed = (n: number) =>
    n === 0 ? "0" : `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
  const dial = (
    id: (typeof DS_CHARACTER_DIALS)[number]["id"],
    track: string,
    thumb: string,
  ) => {
    const { label, min, max, low, high } = DS_CHARACTER_DIALS.find(
      (d) => d.id === id,
    )!;
    const value = character[id];
    const centred = min < 0;
    const shown =
      id === "hue"
        ? Math.round(value)
        : centred
          ? Math.round(value * 50)
          : Math.round(value * 100);
    return (
      <DsColourBar
        key={id}
        label={label}
        readout={
          id === "hue" ? `${shown}°` : centred ? signed(shown) : String(shown)
        }
        value={(value - min) / (max - min)}
        // A hue dragged onto a background with no colour gives it a tint, so the drag shows.
        onChange={(x) =>
          id === "hue"
            ? set({
                hue: Math.round(x * 360) % 360,
                colour: Math.max(character.colour, 0.25),
              })
            : set({ [id]: Math.round((min + x * (max - min)) * 100) / 100 })
        }
        valueText={
          id === "hue"
            ? `${shown}°`
            : `${shown}: ${value <= min + 0.02 ? low : value >= max - 0.02 ? high : `between ${low.toLowerCase()} and ${high.toLowerCase()}`}`
        }
        track={track}
        thumb={thumb}
      />
    );
  };
  // The hue bar shows each hue at a strength that reads, even while the background has little colour.
  const strong = {
    colour: Math.max(character.colour, 0.6),
    brightness: Math.max(character.brightness, 0.7),
    warmth: 0,
  };
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
            ...(ids.length
              ? dsTasteBackground(ids, t.character)
              : { hue: 40, colour: 0, brightness: 1 }),
          },
        })}
      />
      <AdvancedOptions>
        {dial(
          "brightness",
          `linear-gradient(to right, ${at({ brightness: 0 })}, ${at({ brightness: 0.5 })}, ${at({ brightness: 1 })})`,
          base,
        )}
        {dial(
          "hue",
          `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => at({ ...strong, hue: h % 360 })).join(", ")})`,
          at({ ...strong }),
        )}
        {dial(
          "contrast",
          `linear-gradient(to right, ${tokensAt(-1)["fg-muted"]}, ${tokensAt(0)["fg-muted"]}, ${tokensAt(1)["fg-muted"]})`,
          tokensAt(character.contrast)["fg-muted"],
        )}
        <ColourWheelChoice
          colours={theme.colours}
          mode={mode}
          options={dsCharacterColourOptions(theme.character)}
          onChange={(c) => onTheme({ ...theme, colours: c })}
        />
      </AdvancedOptions>
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
  onChange: (next: {
    outline?: boolean;
    outlineWidth?: number;
    outlineOpacity?: number;
  }) => void;
}) {
  const preset = (DS_OUTLINE_WIDTHS as readonly number[]).includes(width);
  const [text, setText] = React.useState(preset ? "" : String(width));
  const transparency = Math.round((1 - opacity) * 100);
  return (
    <div className="flex flex-col gap-ds-16">
      {/* The switch right after its label (decisions, 2026-10-28). */}
      <label className="inline-flex items-center gap-ds-8 self-start text-p text-ds-fg">
        Outline
        <DsSwitch
          aria-label={label}
          checked={on}
          onCheckedChange={(outline) => onChange({ outline })}
        />
      </label>
      {on && (
        <>
          <div
            className="flex items-center gap-ds-4"
            role="group"
            aria-label={`${label} thickness`}
          >
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
                if (Number.isFinite(px))
                  onChange({
                    outlineWidth: Math.min(DS_OUTLINE_MAX, Math.max(1, px)),
                  });
              }}
            />
          </div>
          <DsColourBar
            label={`${label} transparency`}
            title="Transparency"
            readout={String(transparency)}
            value={1 - opacity}
            onChange={(x) =>
              onChange({ outlineOpacity: Math.round((1 - x) * 100) / 100 })
            }
            valueText={
              transparency === 0 ? "Solid" : `${transparency}% see-through`
            }
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
  const toggle = (
    label: string,
    on: boolean,
    change: (on: boolean) => void,
  ) => (
    // The switch right after its label (decisions, 2026-10-28).
    <label className="inline-flex items-center gap-ds-8 self-start text-p text-ds-fg">
      {label}
      <DsSwitch checked={on} onCheckedChange={change} />
    </label>
  );
  const contrast = Math.round(style.contrast * 50);
  return (
    <div className="flex flex-col gap-ds-16">
      <div
        className="flex items-center gap-ds-4"
        role="group"
        aria-label="Fill"
      >
        {(["solid", "gradient"] as const).map((fill) => (
          <DsButton
            key={fill}
            size="small"
            className="min-w-0 flex-1 px-0"
            pressed={style.fill === fill}
            onClick={() => set({ fill })}
          >
            {fill === "solid" ? "Solid" : "Gradient"}
          </DsButton>
        ))}
      </div>
      {style.fill === "gradient" && (
        <DsColourBar
          label="Gradient contrast"
          title="Contrast"
          // -50 to +50 from a flat 0 in the middle, as the colours' brightness reads.
          readout={
            contrast === 0
              ? "0"
              : `${contrast > 0 ? "+" : "−"}${Math.abs(contrast)}`
          }
          value={(style.contrast + 1) / 2}
          onChange={(x) => set({ contrast: Math.round((x * 2 - 1) * 50) / 50 })}
          valueText={
            contrast === 0
              ? "Flat"
              : contrast > 0
                ? `${contrast}, lighter at the top`
                : `${-contrast}, darker at the top`
          }
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
          <DsAngleDial
            label="Text shadow direction"
            value={style.shadowAngle}
            onChange={(shadowAngle) => set({ shadowAngle })}
          />
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
          <RadiusChoice
            label="Pill roundness"
            radius={pillRadius}
            onChange={onPillRadius}
          />
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
function RadiusChoice({
  label,
  radius,
  onChange,
}: {
  label: string;
  radius: DsRadius;
  onChange: (radius: DsRadius) => void;
}) {
  const custom = typeof radius === "number";
  const [text, setText] = React.useState(custom ? String(radius) : "");
  return (
    <div className="flex flex-col gap-ds-8">
      <div
        className="flex items-center gap-ds-4"
        role="group"
        aria-label={label}
      >
        {DS_RADII.map((r) => (
          <DsButton
            key={r.id}
            size="small"
            className="min-w-0 flex-1 px-0"
            pressed={radius === r.id}
            onClick={() => onChange(r.id)}
          >
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
            if (Number.isFinite(px))
              onChange(Math.min(DS_RADIUS_MAX, Math.max(0, px)));
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
    <DsDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={description}
    >
      <form
        className="flex flex-col gap-ds-20"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim());
        }}
      >
        <DsField label="Name">
          <DsInput
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="Evening"
          />
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
 * rest is on Typography. Save as new theme or Save theme sits at the panel's
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
  const [naming, setNaming] = React.useState<
    "add" | "rename" | "create" | null
  >(null);
  const [restoring, setRestoring] = React.useState(false);

  const setFamilyFont = (familyId: string, font: string) =>
    setTheme({
      ...theme,
      families: theme.families.map((f) =>
        f.id === familyId ? { ...f, font } : f,
      ),
    });
  // Plain names, as any select shows them (the "Aa" previews drew twice in the closed field).
  const fontOptions = dsFontOptions(theme).map(({ value, label }) => ({
    value,
    label,
  }));
  // Ilo shows as her photo in a friendly look, her initials in a branded one; her story's words boxed, plain or
  // loud (taste.ts).
  const people = dsTastePeople(theme.character.tastes, theme.character.mood);
  const story = dsTasteStory(theme.character.tastes, theme.character.mood);
  const tilt = dsTasteTilt(theme.character.tastes, theme.character.mood);
  const voice = dsTasteVoice(theme.character.tastes, theme.character.mood);
  const copy = VOICE_COPY[voice.tone];
  const takes = useTakes(theme, setTheme);
  const heading = theme.families.find((f) => f.id === DS_HEADING_FAMILY);
  const body =
    theme.families.find((f) => f.id === DS_BODY_FAMILY) ?? theme.families[0];

  return (
    // The brand, not just the UI (Alex, 2026-10-29): the look in each place, at the CMS's reading width (600px),
    // the site (Web), a story, a feed post and a post on X (Social), a letter (Email) and the admin's own card
    // (App), with Ilo's own photos and words in the taste's voice; then what it says and how (Brand).
    <div className="flex w-full max-w-[600px] flex-col gap-ds-80">
      <PreviewPart title="Web" className="gap-ds-40">
        <div className="flex items-center justify-between gap-ds-16">
          <span className="text-p text-ds-fg">Ilo Odena</span>
          <nav className="flex items-center gap-ds-4" aria-label="Preview nav">
            <DsButton variant="text">Work</DsButton>
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
          <h1 className="text-display text-ds-fg">
            Creating tasteful AI in an AI-infested world
          </h1>
          <h2 className="text-h2 text-ds-fg">
            Where to let it decide, and where to keep the choice
          </h2>
          <p className="text-prose text-ds-fg-muted">
            The hard part isn&apos;t what AI can do. It&apos;s knowing which
            decisions to hand over and which ones have to stay mine, because the
            ones I keep are the ones people recognise me by.
          </p>
          <p className="text-small text-ds-fg-muted">
            2026 · 4 min · Taste, the floor
          </p>
          {/* The one big marketing button on the page, in its context: on to the essay. */}
          <div>
            <DsButton variant="primary" size="large" iconRight={ArrowRight}>
              Read the essay
            </DsButton>
          </div>
        </article>

        <figure className="flex flex-col gap-ds-8">
          <img
            src={`${PREVIEW_MEDIA}/ilo-lake.jpg`}
            alt="A still lake at dawn"
            className="aspect-[3/2] w-full rounded-ds-lg object-cover"
          />
          <figcaption className="text-small text-ds-fg-muted">
            Three summers at the lake, and one drop of it kept.
          </figcaption>
        </figure>

        {/* A card above the fold, on the surface, with the big marketing buttons. */}
        <section className="@container flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-20">
          <div className="flex flex-col gap-ds-4">
            <h3 className="text-h3 text-ds-fg">Keep up with my thoughts</h3>
            <p className="text-p text-ds-fg-muted">
              One letter in your inbox a week.
            </p>
          </div>
          <div className="@max-2xl:ds-fields-fill">
            <DsInput aria-label="Email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-wrap items-center gap-ds-8">
            <DsButton variant="primary">Subscribe</DsButton>
            <DsButton>Learn more</DsButton>
          </div>
        </section>
      </PreviewPart>

      <PreviewPart title="Social">
        {/* Two columns sized so the story comes out about 9:16 beside the card at the preview's width; the story
            stretches to the card's height, so the two line up top and bottom. */}
        <div className="grid grid-cols-[23fr_35fr] gap-ds-20">
          <PreviewStory people={people} story={story} tilt={tilt} copy={copy} />
          <PreviewCarouselPost people={people} story={story} copy={copy} />
        </div>
        <PreviewXPost people={people} copy={copy} />
      </PreviewPart>

      <PreviewPart title="Email">
        <PreviewEmail copy={copy} />
      </PreviewPart>

      <PreviewPart title="App">
        {/* Her project, as the admin shows a draft: its name and state, a note, its actions. */}
        <section className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-surface-subtle p-ds-20">
          <div className="flex items-start justify-between gap-ds-16">
            <div className="flex flex-col gap-ds-4">
              <h3 className="text-h3 text-ds-fg">Dragonfly</h3>
              <p className="text-small text-ds-fg-muted">
                Project · Craft, sound, writing · 14 images, 3 recordings
              </p>
            </div>
            <DsPill>Draft</DsPill>
          </div>
          <DsInfoCard title="Not live yet">
            <p>
              The process notes and the recordings go out with it when you
              publish.
            </p>
          </DsInfoCard>
          <div className="flex flex-wrap items-center gap-ds-8">
            <DsButton variant="primary">Publish</DsButton>
            <DsButton>Save</DsButton>
            <DsButton variant="text">Preview</DsButton>
          </div>
        </section>
      </PreviewPart>

      <PreviewBrand theme={theme} rules={voice.rules} />

      <InPanel>
        <PanelSection
          title="Theme"
          actions={
            <div className="flex items-center gap-ds-4">
              <TakeControls takes={takes} />
              <DsDropdown>
                <DsDropdownTrigger asChild>
                  <DsButton
                    size="small"
                    variant="text"
                    iconLeft={MoreVertical}
                    aria-label={`More for ${entry.name}`}
                  />
                </DsDropdownTrigger>
                <DsDropdownContent align="end">
                  <DsDropdownItem
                    iconLeft={Pencil}
                    disabled={entry.id === DS_DEFAULT_THEME_ID}
                    onSelect={() => setNaming("rename")}
                  >
                    Rename
                  </DsDropdownItem>
                  <DsDropdownItem
                    iconLeft={Copy}
                    onSelect={() => addTheme(`${entry.name} copy`)}
                  >
                    Duplicate
                  </DsDropdownItem>
                  <DsDropdownItem
                    iconLeft={RotateCcw}
                    onSelect={() => setRestoring(true)}
                  >
                    Restore
                  </DsDropdownItem>
                  <DsDropdownItem
                    tone="danger"
                    iconLeft={Trash2}
                    disabled={
                      entry.id === DS_DEFAULT_THEME_ID ||
                      entry.id === library.active
                    }
                    onSelect={() => removeTheme(entry.id)}
                  >
                    Delete
                  </DsDropdownItem>
                </DsDropdownContent>
              </DsDropdown>
            </div>
          }
        >
          <DsSelect
            aria-label="Theme"
            key={library.themes.map((t) => t.id).join()}
            // Parabola, Parabola's own, is the default every theme starts from and restores to; Add theme is the last option.
            options={[
              ...library.themes.map((t) => ({
                value: t.id,
                label:
                  t.id === DS_DEFAULT_THEME_ID ? `${t.name} (default)` : t.name,
              })),
              {
                value: ADD_THEME,
                label: "Add theme",
                indicator: <Plus aria-hidden className="size-4" />,
              },
            ]}
            value={entry.id}
            onValueChange={(value) =>
              value === ADD_THEME
                ? setNaming("add")
                : (takes.reset(), select(value))
            }
          />
          {/* The preview's mode, right under the theme (Alex, 2026-10-29); the UI's is the sidebar's toggle. */}
          <div
            className="flex items-center gap-ds-8"
            role="group"
            aria-label="Mode"
          >
            <DsButton
              size="small"
              iconLeft={Sun}
              pressed={mode === "light"}
              onClick={() => setPreviewMode("light")}
            >
              Light
            </DsButton>
            <DsButton
              size="small"
              iconLeft={Moon}
              pressed={mode === "dark"}
              onClick={() => setPreviewMode("dark")}
            >
              Dark
            </DsButton>
          </div>
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
                return dsThemeWithExpression(
                  dsThemeWithFonts(
                    {
                      ...t,
                      character: DS_DEFAULT_CHARACTER,
                      colours: DS_DEFAULT_COLOURS,
                      type: DS_DEFAULT_THEME.type,
                      radius: null,
                      pillRadius: null,
                      buttons: null,
                    },
                    null,
                  ),
                  DS_DEFAULT_CHARACTER.expression,
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
                  contrast: 0,
                },
                colours: DS_DEFAULT_COLOURS,
              })}
            />
          }
        >
          <AppearanceChoice theme={theme} mode={mode} onTheme={setTheme} />
        </PanelSection>

        <PanelSection
          title="Typography"
          actions={
            <SectionRestore
              section="Typography"
              theme={theme}
              setTheme={setTheme}
              restore={(t) =>
                parseDsThemeConfig({
                  ...t,
                  families: DS_DEFAULT_THEME.families,
                  hiddenFonts: [],
                })
              }
            />
          }
        >
          <ScopedTastes
            scope="type"
            theme={theme}
            onTheme={setTheme}
            apply={(ids, t) => dsThemeWithFonts(t, dsTasteFonts(ids))}
          />
          <AdvancedOptions>
            {heading && (
              <DsField label={heading.label}>
                <DsSelect
                  options={fontOptions}
                  value={heading.font}
                  onValueChange={(font) => setFamilyFont(heading.id, font)}
                />
              </DsField>
            )}
            <DsField label={body.label}>
              <DsSelect
                options={fontOptions}
                value={body.font}
                onValueChange={(font) => setFamilyFont(body.id, font)}
              />
            </DsField>
            {/* In-app, so the unpublished draft comes along. */}
            <DsButton
              href="/parabola/typography/font-families"
              variant="text"
              size="small"
              iconRight={ChevronRight}
              className="-ml-2 self-start"
            >
              Font families and type scale
            </DsButton>
          </AdvancedOptions>
        </PanelSection>

        <PanelSection
          title="Buttons"
          actions={
            <SectionRestore
              section="Buttons"
              theme={theme}
              setTheme={setTheme}
              // Back to the character's: its roundness and depth.
              restore={(t) => ({
                ...t,
                radius: null,
                pillRadius: null,
                buttons: null,
              })}
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
                  character: {
                    ...t.character,
                    roundness: dsMoodDials(t.character.mood).roundness,
                    depth: dsExpressionDials(t.character.expression).depth,
                  },
                  colours: {
                    ...t.colours,
                    accent: { light: null, dark: null },
                  },
                  radius: null,
                  pillRadius: null,
                  buttons: null,
                };
              }
              const { roundness, depth, button } = dsTasteButtons(
                ids,
                dsThemeColourTokens(t, "light").bg,
              );
              return {
                ...t,
                character: { ...t.character, roundness, depth },
                colours: {
                  ...t.colours,
                  accent: { light: button, dark: null },
                },
                radius: null,
                pillRadius: null,
                buttons: null,
              };
            }}
          />
          <AdvancedOptions>
            {/* Roundness is the UI's, so it sits with the buttons (Alex, 2026-10-29); Custom below overrides it. */}
            <DsColourBar
              label="Roundness"
              readout={String(Math.round(theme.character.roundness * 100))}
              value={theme.character.roundness}
              onChange={(x) =>
                setTheme({
                  ...theme,
                  character: {
                    ...theme.character,
                    roundness: Math.round(x * 100) / 100,
                  },
                })
              }
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
          </AdvancedOptions>
        </PanelSection>

        <PanelSection
          title="Fields"
          actions={
            <SectionRestore
              section="Fields"
              theme={theme}
              setTheme={setTheme}
              restore={(t) => ({ ...t, fields: DS_DEFAULT_FIELD_STYLE })}
            />
          }
        >
          <ScopedTastes
            scope="fields"
            theme={theme}
            onTheme={setTheme}
            apply={(ids, t) => ({
              ...t,
              fields: ids.length ? dsTasteField(ids) : DS_DEFAULT_FIELD_STYLE,
            })}
          />
          <AdvancedOptions>
            <OutlineChoice
              label="Field outline"
              on={theme.fields.outline}
              width={theme.fields.outlineWidth}
              opacity={theme.fields.outlineOpacity}
              colour={dsThemeColourTokens(theme, mode)["field-border"]}
              onChange={(next) =>
                setTheme({ ...theme, fields: { ...theme.fields, ...next } })
              }
            />
          </AdvancedOptions>
        </PanelSection>

        <PanelSection
          title="Icons"
          actions={
            <SectionRestore
              section="Icons"
              theme={theme}
              setTheme={setTheme}
              restore={(t) => ({ ...t, icons: DS_DEFAULT_THEME.icons })}
            />
          }
        >
          <DsField label="Icon library">
            <DsSelect
              // Only the libraries that work: Lucide, for now.
              options={DS_ICON_LIBRARIES.filter((l) => l.ready).map((l) => ({
                value: l.id,
                label: l.label,
              }))}
              value={theme.icons}
              onValueChange={(icons) => setTheme({ ...theme, icons })}
            />
          </DsField>
        </PanelSection>

        <ThemeCode theme={theme} name={entry.name} setTheme={setTheme} />
      </InPanel>

      {/* At the panel's foot while Custom, the working copy, is open (a variation, say): save it as a theme of its own. */}
      {status === "custom" && (
        <InPanelFooter>
          <DsButton
            variant="primary"
            className="w-full"
            loading={saving}
            onClick={() => setNaming("create")}
          >
            Save as new theme
          </DsButton>
        </InPanelFooter>
      )}

      {naming === "create" && (
        <ThemeNameDialog
          title="Save as a new theme"
          description="Parabola stays as it is; this is a theme of its own, for a site to pick in Settings › Design."
          initial={entry.name}
          action="Save theme"
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
          dsToast(RESTORE.all.done, {
            action: { label: "Undo", onClick: undoIt },
          });
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
