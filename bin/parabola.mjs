#!/usr/bin/env node

// cli/main.ts
import { dirname as dirname4, join as join4 } from "node:path";
import { fileURLToPath } from "node:url";

// cli/core.ts
import { existsSync as existsSync3, mkdirSync as mkdirSync2, readFileSync as readFileSync3, readdirSync, writeFileSync as writeFileSync2 } from "node:fs";
import { dirname as dirname3, join as join3, relative as relative2, resolve as resolve2 } from "node:path";

// colours.ts
var darkInverse = "rgb(255 255 255 / 0.8)";
var DS_BASE_COLOURS = [
  {
    id: "stone",
    label: "Stone",
    swatch: "#78716C",
    // A white page, its cards a warm off-white the same step darker (−4) a picked primary colour's are.
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#595959",
      "fg-subtle": "#78716C",
      border: "#D6D3D1",
      "surface-subtle": "#F7F5F2",
      field: "#FFFFFF",
      surface: "#E2DFD9",
      "surface-inverse": "rgb(48 46 44 / 0.7)"
    },
    dark: {
      bg: "#121110",
      "fg-muted": "#A0A0A0",
      "fg-subtle": "#A8A29E",
      border: "#44403C",
      "surface-subtle": "#1A1918",
      field: "#121110",
      surface: "#302E2C",
      "surface-inverse": darkInverse
    }
  },
  {
    id: "neutral",
    label: "Neutral",
    swatch: "#737373",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#525252",
      "fg-subtle": "#737373",
      border: "#D4D4D4",
      "surface-subtle": "#FAFAFA",
      field: "#F5F5F5",
      surface: "#E5E5E5",
      "surface-inverse": "rgb(38 38 38 / 0.7)"
    },
    dark: {
      bg: "#0A0A0A",
      "fg-muted": "#A3A3A3",
      "fg-subtle": "#A3A3A3",
      border: "#404040",
      "surface-subtle": "#171717",
      field: "#1C1C1C",
      surface: "#262626",
      "surface-inverse": darkInverse
    }
  },
  {
    id: "zinc",
    label: "Zinc",
    swatch: "#71717A",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#52525B",
      "fg-subtle": "#71717A",
      border: "#D4D4D8",
      "surface-subtle": "#FAFAFA",
      field: "#F4F4F5",
      surface: "#E4E4E7",
      "surface-inverse": "rgb(39 39 42 / 0.7)"
    },
    dark: {
      bg: "#09090B",
      "fg-muted": "#A1A1AA",
      "fg-subtle": "#A1A1AA",
      border: "#3F3F46",
      "surface-subtle": "#18181B",
      field: "#1F1F23",
      surface: "#27272A",
      "surface-inverse": darkInverse
    }
  },
  {
    id: "slate",
    label: "Slate",
    swatch: "#64748B",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#475569",
      "fg-subtle": "#64748B",
      border: "#CBD5E1",
      "surface-subtle": "#F8FAFC",
      field: "#F1F5F9",
      surface: "#E2E8F0",
      "surface-inverse": "rgb(30 41 59 / 0.7)"
    },
    dark: {
      bg: "#020617",
      "fg-muted": "#94A3B8",
      "fg-subtle": "#94A3B8",
      border: "#334155",
      "surface-subtle": "#0F172A",
      field: "#131C31",
      surface: "#1E293B",
      "surface-inverse": darkInverse
    }
  },
  {
    id: "gray",
    label: "Gray",
    swatch: "#6B7280",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#4B5563",
      "fg-subtle": "#6B7280",
      border: "#D1D5DB",
      "surface-subtle": "#F9FAFB",
      field: "#F3F4F6",
      surface: "#E5E7EB",
      "surface-inverse": "rgb(31 41 55 / 0.7)"
    },
    dark: {
      bg: "#030712",
      "fg-muted": "#9CA3AF",
      "fg-subtle": "#9CA3AF",
      border: "#374151",
      "surface-subtle": "#111827",
      field: "#161D2B",
      surface: "#1F2937",
      "surface-inverse": darkInverse
    }
  }
];
var DS_ACCENT_COLOURS = [
  { id: "purple", label: "Purple", light: { highlight: "#7E22CE", tint: "#F3E8FF" }, dark: { highlight: "#D8B4FE", tint: "#581C87" } },
  { id: "blue", label: "Blue", light: { highlight: "#1D4ED8", tint: "#DBEAFE" }, dark: { highlight: "#93C5FD", tint: "#1E3A8A" } },
  { id: "teal", label: "Teal", light: { highlight: "#0F766E", tint: "#CCFBF1" }, dark: { highlight: "#5EEAD4", tint: "#134E4A" } },
  { id: "green", label: "Green", light: { highlight: "#15803D", tint: "#DCFCE7" }, dark: { highlight: "#86EFAC", tint: "#14532D" } },
  { id: "orange", label: "Orange", light: { highlight: "#C2410C", tint: "#FFEDD5" }, dark: { highlight: "#FDBA74", tint: "#7C2D12" } },
  { id: "rose", label: "Rose", light: { highlight: "#BE123C", tint: "#FFE4E6" }, dark: { highlight: "#FDA4AF", tint: "#881337" } }
];
var DS_DEFAULT_BASE_COLOUR = "stone";
var DS_DEFAULT_ACCENT_COLOUR = "purple";
var DS_SHIFT_MAX = 0.5;
var DS_DEFAULT_COLOURS = {
  theme: { light: null, dark: null },
  surface: { light: null, dark: null },
  text: { light: null, dark: null },
  muted: { light: null, dark: null },
  accent: { light: null, dark: null },
  buttonSecondary: { light: null, dark: null },
  field: { light: null, dark: null }
};
var dsBaseColour = (id) => DS_BASE_COLOURS.find((c) => c.id === id) ?? DS_BASE_COLOURS[0];
var dsAccentColour = (id) => DS_ACCENT_COLOURS.find((c) => c.id === id) ?? DS_ACCENT_COLOURS[0];
var dsIsHex = (value) => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
var toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
var toHex = (rgb) => `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
function dsMix(a, b, amount) {
  const [x, y] = [toRgb(a), toRgb(b)];
  return toHex([0, 1, 2].map((i) => x[i] * amount + y[i] * (1 - amount)));
}
function dsHexToHsv(hex) {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
function dsHsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return toHex([f(5) * 255, f(3) * 255, f(1) * 255]);
}
var WHITE = "#FFFFFF";
var BLACK = "#000000";
function dsBaseTokens(base, mode) {
  if (!dsIsHex(base)) return dsBaseColour(base)[mode];
  const [r, g, b] = toRgb(dsMix(base, BLACK, 0.2));
  return mode === "light" ? {
    bg: WHITE,
    "fg-muted": dsMix(base, BLACK, 0.7),
    "fg-subtle": base,
    border: dsMix(base, WHITE, 0.32),
    "surface-subtle": dsMix(base, WHITE, 0.035),
    field: dsMix(base, WHITE, 0.07),
    surface: dsMix(base, WHITE, 0.2),
    "surface-inverse": `rgb(${r} ${g} ${b} / 0.7)`
  } : {
    bg: dsMix(base, BLACK, 0.12),
    "fg-muted": dsMix(base, WHITE, 0.45),
    "fg-subtle": dsMix(base, WHITE, 0.7),
    border: dsMix(base, BLACK, 0.45),
    "surface-subtle": dsMix(base, BLACK, 0.16),
    field: dsMix(base, BLACK, 0.2),
    surface: dsMix(base, BLACK, 0.3),
    "surface-inverse": "rgb(255 255 255 / 0.8)"
  };
}
function dsAccentTokens(accent, mode) {
  if (!dsIsHex(accent)) return dsAccentColour(accent)[mode];
  return mode === "light" ? { highlight: accent, tint: dsMix(accent, WHITE, 0.14) } : { highlight: dsMix(accent, WHITE, 0.55), tint: dsMix(accent, BLACK, 0.4) };
}
function dsContrast(a, b) {
  const [x, y] = [dsLuminance(a), dsLuminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
function dsLuminance(hex) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function dsHexToHsl(hex) {
  return toHsl(hex);
}
function dsHslToHex(h, s, l) {
  return fromHsl(h, s, Math.min(1, Math.max(0, l)));
}
function dsShift(hex, amount) {
  const [h, s, l] = toHsl(hex);
  return dsHslToHex(h, s, l + amount);
}
function toHsl(hex) {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function fromHsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}
var DARK_PAGE = 0.13;
var DARK_CARD = 0.165;
function dsCounterpart(hex, most = DARK_PAGE) {
  const { h, s: own, v } = dsHexToHsv(hex);
  const s = Math.min(0.92, Math.sqrt(own) * 1.35);
  const look = dsLuminance(dsHsvToHex(h, 0, most));
  let value = Math.min(v, most);
  let out = dsHsvToHex(h, s, value);
  while (dsLuminance(out) > look * 1.8 && value > 0.02) {
    value -= 5e-3;
    out = dsHsvToHex(h, s, value);
  }
  return out;
}
function dsInkCounterpart(hex, page, contrast = 4.5) {
  const [h, s, l] = toHsl(hex);
  const toLight = dsLuminance(page) <= 0.18;
  let lightness = l;
  let out = hex;
  for (let step = 0; step < 50 && dsContrast(out, page) < contrast; step++) {
    lightness = toLight ? Math.min(0.98, lightness + 0.02) : Math.max(0.02, lightness - 0.02);
    out = fromHsl(h, s, lightness);
  }
  return out;
}
function hexIn(colour, mode, auto, counterpart = dsCounterpart) {
  const light = dsIsHex(colour.light) ? colour.light : null;
  if (mode === "light" && light) return light;
  if (mode === "dark" && colour.dark) return colour.dark;
  const based = mode === "dark" && light ? counterpart(light) : null;
  const shift = (mode === "light" ? colour.lightShift : colour.darkShift) ?? 0;
  return shift ? dsShift(based ?? auto(), shift) : based;
}
function dsColourTokens(colours, mode, options = {}) {
  const base = dsIsHex(colours.text.light) || !colours.text.light ? DS_DEFAULT_BASE_COLOUR : colours.text.light;
  const tokens = { ...dsBaseTokens(base, mode), fg: mode === "light" ? BLACK : WHITE };
  const contrast = options.contrast ?? 0;
  const page = hexIn(colours.theme, mode, () => tokens.bg) ?? (options.base ? mode === "light" ? options.base : dsCounterpart(options.base) : null);
  const text = hexIn(
    colours.text,
    mode,
    () => dsLuminance(page ?? tokens.bg) > 0.18 ? BLACK : WHITE,
    // Text in dark reads well clear of the page (7:1), so its quieter steps, mixed toward the page, still read.
    (hex) => dsInkCounterpart(hex, page ?? tokens.bg, 7)
  );
  if (page || text || contrast !== 0) {
    const bg = page ?? tokens.bg;
    const readable = dsLuminance(bg) > 0.18 ? BLACK : WHITE;
    const picked = mode === "light" ? dsIsHex(colours.text.light) : Boolean(colours.text.dark);
    const fg = text && (picked || dsContrast(text, bg) >= 3) ? text : readable;
    const k = 1 + 0.8 * contrast;
    const card2 = dsMix(fg, bg, 0.045 * k);
    Object.assign(tokens, {
      bg,
      fg,
      // The quieter text: in dark a little closer to the strong text, where it reads fainter.
      "fg-muted": dsMix(fg, bg, Math.min(0.92, (mode === "dark" ? 0.8 : 0.7) + 0.12 * contrast)),
      "fg-subtle": dsMix(fg, bg, Math.min(0.8, (mode === "dark" ? 0.64 : 0.52) + 0.12 * contrast)),
      border: dsMix(fg, bg, 0.12 * k),
      "surface-subtle": card2,
      // Fields are the page itself, solid: a place to type that shows on a card.
      field: bg,
      // The secondary buttons and pills: further from the cards as contrast rises, so primary and secondary differ.
      surface: dsMix(fg, card2, 0.11 * k),
      // Toasts and tooltips in the text colour, solid.
      "surface-inverse": fg
    });
  }
  const ink = options.ink ?? 1;
  const textPicked = mode === "light" ? dsIsHex(colours.text.light) : Boolean(colours.text.dark);
  if (ink < 1 && !textPicked) {
    const soft = 1 - ink;
    const hue = options.inkHue ?? 40;
    const light = dsLuminance(tokens.bg) > 0.18;
    const inked = dsHslToHex(hue, 0.55 * soft, light ? 0.3 * soft : 1 - 0.22 * soft);
    tokens.fg = inked;
    tokens["fg-muted"] = dsMix(inked, tokens.bg, mode === "dark" ? 0.8 : 0.7);
    tokens["fg-subtle"] = dsMix(inked, tokens.bg, mode === "dark" ? 0.64 : 0.52);
    tokens["surface-inverse"] = inked;
  }
  const muted = hexIn(colours.muted, mode, () => tokens["fg-muted"], (hex) => dsInkCounterpart(hex, tokens.bg));
  if (muted) {
    tokens["fg-muted"] = muted;
    tokens["fg-subtle"] = dsMix(muted, tokens.bg, 0.75);
  }
  const surface = colours.surface;
  const lightCard = dsIsHex(surface.light) ? surface.light : null;
  const cardShift = mode === "light" ? surface.lightShift : surface.darkShift;
  const cardBase = mode === "dark" && lightCard ? dsCounterpart(lightCard, DARK_CARD) : tokens.bg;
  const card = (mode === "light" ? lightCard : surface.dark) ?? (cardShift !== void 0 ? dsShift(cardBase, cardShift) : mode === "dark" && lightCard ? cardBase : null);
  if (card) tokens["surface-subtle"] = card;
  const field = hexIn(colours.field, mode, () => tokens.bg);
  if (field) tokens.field = field;
  tokens["field-border"] = field ? dsMix(dsLuminance(field) > 0.18 ? BLACK : WHITE, field, 0.16) : tokens.border;
  const preset = colours.accent.light && !dsIsHex(colours.accent.light) && !(mode === "dark" && colours.accent.dark);
  const accent = preset ? null : hexIn(colours.accent, mode, () => tokens.fg, (hex) => dsInkCounterpart(hex, tokens.bg));
  if (preset) {
    const old = dsAccentTokens(colours.accent.light, mode);
    tokens.highlight = old.highlight;
    tokens["highlight-tint"] = old.tint;
  } else {
    tokens.highlight = accent ?? tokens.fg;
    tokens["highlight-tint"] = dsMix(tokens.highlight, tokens.bg, 0.14);
  }
  tokens.button = accent ?? tokens.fg;
  tokens["on-button"] = accent ? dsLuminance(accent) > 0.18 ? BLACK : WHITE : tokens.bg;
  const secondary = hexIn(
    colours.buttonSecondary,
    mode,
    () => accent ? dsMix(accent, tokens.bg, 0.16) : tokens.surface,
    (hex) => dsCounterpart(hex, DARK_CARD + 0.06)
  );
  if (secondary) tokens.surface = secondary;
  else if (accent) tokens.surface = dsMix(accent, tokens.bg, 0.16 * (1 + 0.8 * contrast));
  const darkSurface = dsLuminance(tokens.surface) <= 0.18;
  const lightText = dsLuminance(tokens.fg) > 0.18;
  tokens["on-surface"] = darkSurface === lightText ? tokens.fg : darkSurface ? WHITE : BLACK;
  return tokens;
}
var DS_ICON_LIBRARIES = [
  { id: "lucide", label: "Lucide", ready: true },
  { id: "tabler", label: "Tabler", ready: false },
  { id: "hugeicons", label: "Hugeicons", ready: false },
  { id: "phosphor", label: "Phosphor", ready: false },
  { id: "remix", label: "Remix", ready: false }
];

// button-style.ts
var DS_DEFAULT_BUTTON_STYLE = {
  fill: "solid",
  contrast: 0,
  outline: false,
  outlineWidth: 1,
  outlineOpacity: 1,
  shadow: false,
  shadowAngle: 90
};
var DS_OUTLINE_MAX = 8;
var DS_DEFAULT_FIELD_STYLE = { outline: true, outlineWidth: 2, outlineOpacity: 1 };
var num = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function parseDsButtonStyle(value) {
  const raw = value && typeof value === "object" ? value : {};
  const contrast = num(raw.contrast);
  const angle = num(raw.shadowAngle);
  return {
    fill: raw.fill === "gradient" || raw.fill === "none" ? raw.fill : "solid",
    contrast: contrast === null ? DS_DEFAULT_BUTTON_STYLE.contrast : Math.min(1, Math.max(-1, contrast)),
    outline: raw.outline === true,
    ...parseOutline(raw, DS_DEFAULT_BUTTON_STYLE.outlineWidth),
    // The text shadow was `emboss` (a "3D label") for a day.
    shadow: raw.shadow === true || raw.emboss === true,
    shadowAngle: angle === null ? DS_DEFAULT_BUTTON_STYLE.shadowAngle : (Math.round(angle) % 360 + 360) % 360
  };
}
function parseOutline(raw, width) {
  const w = num(raw.outlineWidth);
  const o = num(raw.outlineOpacity);
  return {
    outlineWidth: w === null ? width : Math.min(DS_OUTLINE_MAX, Math.max(1, Math.round(w))),
    outlineOpacity: o === null ? 1 : Math.min(1, Math.max(0, o))
  };
}
function parseDsFieldStyle(value) {
  const raw = value && typeof value === "object" ? value : {};
  return { outline: raw.outline !== false, ...parseOutline(raw, DS_DEFAULT_FIELD_STYLE.outlineWidth) };
}
var faded = (colour, opacity) => opacity >= 1 ? colour : `color-mix(in srgb, ${colour} ${Math.round(opacity * 100)}%, transparent)`;
function dsFieldStyleVars(style, border) {
  return {
    "--ds-field-border-width": style.outline ? `${style.outlineWidth}px` : "0px",
    "--ds-field-border": faded(border, style.outlineOpacity)
  };
}
var SPREAD = 0.2;
function dsButtonStyleVars(style, button) {
  const [h, s, l] = dsHexToHsl(button);
  const spread = Math.abs(style.contrast) * SPREAD;
  const middle = Math.min(1 - spread, Math.max(spread, l));
  const [top, bottom] = style.contrast >= 0 ? [middle + spread, middle - spread] : [middle - spread, middle + spread];
  const dark = l < 0.25;
  const away = style.shadowAngle * Math.PI / 180;
  const x = Math.round(-Math.cos(away) * 100) / 100;
  const y = Math.round(Math.sin(away) * 100) / 100;
  return {
    "--ds-button-image": style.fill === "gradient" && style.contrast !== 0 ? `linear-gradient(to bottom, ${dsHslToHex(h, s, top)}, ${dsHslToHex(h, s, bottom)})` : "none",
    "--ds-button-ring": style.outline ? `inset 0 0 0 ${style.outlineWidth}px ${faded(dsShift(button, dark ? 0.2 : -0.15), style.outlineOpacity)}` : "none",
    "--ds-button-text-shadow": style.shadow ? `${x}px ${y}px 0 ${dsShift(button, dark ? 0.28 : -0.22)}` : "none",
    "--ds-button-fill": style.fill === "none" ? "transparent" : "initial",
    "--ds-button-label": style.fill === "none" ? button : "initial"
  };
}

// character.ts
var DS_DEFAULT_TASTES = ["classic"];
var RETIRED_TASTES = ["restrained", "technical", "approachable", "luxurious", "bold", "candid", "playful", "wacky", "modern", "contemporary", "futuristic"];
var RENAMED_TASTES = { fashion: "elegant", luxury: "elegant", scifi: "tech", default: "classic", editorial: "classic" };
var DS_DEFAULT_CHARACTER = {
  tastes: DS_DEFAULT_TASTES,
  // Parabola's own chips: its colours, its fonts, its round buttons.
  scoped: { colour: "classic", type: "classic", buttons: "soft" },
  mood: 0.5,
  ink: 1,
  warmth: 0,
  hue: 40,
  colour: 0,
  brightness: 1,
  contrast: 0,
  roundness: 1,
  depth: 0
};
var pair = (heading, headingAxes, body, bodyAxes) => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` }
});
var DS_MOODS = [
  { at: 0, label: "Serious", dials: { roundness: 0.12 }, fonts: pair("Newsreader", ":wght@400..700", "IBM Plex Sans", ":wght@400;500;600;700"), reach: 0.2 },
  { at: 0.5, label: "Balanced", dials: { roundness: 1 }, fonts: null, reach: 0 },
  { at: 0.75, label: "Playful", dials: { roundness: 1 }, fonts: pair("Fredoka", ":wght@400..700", "Nunito", ":wght@400..700"), reach: 0.13 },
  { at: 1, label: "Wacky", dials: { roundness: 1 }, fonts: pair("Shrikhand", "", "DM Sans", ":wght@400..700"), reach: 0.12 }
];
function dsMoodLabel(mood) {
  if (mood < 0.2) return "Serious";
  if (mood < 0.45) return "Composed";
  if (mood < 0.55) return "Balanced";
  if (mood < 0.7) return "Lively";
  if (mood < 0.95) return "Playful";
  return "Wacky";
}
var DS_CHARACTER_DIALS = [
  { id: "warmth", label: "Temperature", min: -1, max: 1, low: "Cool", high: "Warm" },
  { id: "ink", label: "Type contrast", min: 0, max: 1, low: "Soft", high: "Full" },
  { id: "hue", label: "Hue", min: 0, max: 360, low: "Red", high: "Red" },
  { id: "colour", label: "Saturation", min: 0, max: 1, low: "None", high: "Full" },
  { id: "brightness", label: "Brightness", min: 0, max: 1, low: "Dark", high: "Light" },
  { id: "contrast", label: "Contrast", min: -1, max: 1, low: "Soft", high: "Hard" },
  { id: "roundness", label: "Roundness", min: 0, max: 1, low: "Sharp", high: "Round" },
  { id: "depth", label: "Depth", min: 0, max: 1, low: "Flat", high: "Deep" }
];
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
function parseScoped(value) {
  const raw = value && typeof value === "object" ? value : {};
  const out = {};
  for (const scope of ["colour", "type", "buttons"]) {
    const id = Array.isArray(raw[scope]) ? raw[scope][0] : raw[scope];
    if (typeof id === "string") out[scope] = id;
  }
  return out;
}
function parseDsCharacter(value) {
  const raw = value && typeof value === "object" ? value : {};
  const dial = (id) => {
    const { min, max } = DS_CHARACTER_DIALS.find((d) => d.id === id);
    const n = raw[id];
    return typeof n === "number" && Number.isFinite(n) ? clamp(n, min, max) : DS_DEFAULT_CHARACTER[id];
  };
  const mood = typeof raw.mood === "number" && Number.isFinite(raw.mood) ? clamp(raw.mood, 0, 1) : DS_DEFAULT_CHARACTER.mood;
  const tastes = Array.isArray(raw.tastes) ? raw.tastes.filter((t) => typeof t === "string" && !RETIRED_TASTES.includes(t)).map((t) => RENAMED_TASTES[t] ?? t).slice(0, 1) : [];
  const num2 = (k) => typeof raw[k] === "number" && Number.isFinite(raw[k]) ? raw[k] : null;
  const hsvDay = typeof raw.warmth !== "number" && (num2("colour") !== null || num2("brightness") !== null);
  const hex = dsIsHex(raw.seed) ? raw.seed : hsvDay && !(num2("colour") === 0 && num2("brightness") === 1) ? dsHsvToHex(num2("hue") ?? 40, num2("colour") ?? 0, num2("brightness") ?? 1) : null;
  const seed = hex ? dsHexToHsl(hex) : null;
  return {
    tastes: Array.isArray(raw.tastes) ? tastes : DS_DEFAULT_TASTES,
    scoped: parseScoped(raw.scoped),
    mood,
    ink: dial("ink"),
    warmth: seed ? 0 : dial("warmth"),
    hue: seed && seed[1] > 0 ? Math.round(seed[0]) : dial("hue"),
    colour: seed ? Math.round(seed[1] * 100) / 100 : dial("colour"),
    brightness: seed ? Math.round(seed[2] * 100) / 100 : dial("brightness"),
    contrast: dial("contrast"),
    roundness: dial("roundness"),
    depth: dial("depth")
  };
}
var dsCharacterIsDefault = (c) => [...c.tastes].sort().join() === [...DS_DEFAULT_TASTES].sort().join() && JSON.stringify(c.scoped) === JSON.stringify(DS_DEFAULT_CHARACTER.scoped) && c.mood === 0.5 && c.ink === 1 && c.warmth === 0 && c.colour === 0 && c.brightness === 1 && c.contrast === 0 && c.roundness === 1 && c.depth === 0;
function dsCharacterBase(c) {
  if (c.colour === 0 && c.brightness === 1 && c.warmth === 0) return null;
  if (c.colour < 0.02) return dsHsvToHex(c.warmth > 0 ? 40 : 210, Math.abs(c.warmth) * 0.12, c.brightness);
  if (c.warmth === 0) return dsHslToHex(c.hue, c.colour, c.brightness);
  const toward = c.warmth > 0 ? 30 : 220;
  const gap = (toward - c.hue + 540) % 360 - 180;
  const lean = Math.sign(gap) * Math.min(Math.abs(gap), 25 * Math.abs(c.warmth));
  return dsHslToHex((c.hue + lean + 360) % 360, c.colour, c.brightness);
}
function dsCharacterColourOptions(c) {
  const base = dsCharacterBase(c);
  const inkHue = base && c.colour >= 0.02 ? dsHexToHsl(base)[0] : c.warmth < 0 ? 210 : 40;
  return { base, contrast: c.contrast, ink: c.ink, inkHue };
}
function dsCharacterRadius(c) {
  if (c.roundness < 0.08) return "none";
  if (c.roundness >= 0.92) return "large";
  return Math.round(2 + (c.roundness - 0.08) / 0.84 * 18);
}
function dsCharacterButtons(c) {
  if (c.depth < 0.05) return DS_DEFAULT_BUTTON_STYLE;
  return {
    fill: "gradient",
    contrast: Math.round(c.depth * 0.6 * 50) / 50,
    outline: c.depth >= 0.4,
    outlineWidth: 1,
    outlineOpacity: Math.round(clamp(c.depth, 0, 1) * 100) / 100,
    shadow: c.depth >= 0.7,
    shadowAngle: 90
  };
}

// composition.ts
var DS_DEFAULT_COMPOSITION = {
  layout: "inline",
  align: "centre",
  scale: "regular",
  density: "airy",
  structure: "plain",
  labels: "none",
  numbered: false,
  hero: "statement"
};
var DS_DEFAULT_BRIEF = { reference: "", moves: [] };
var DS_COMPOSITION_CHOICES = [
  {
    key: "layout",
    label: "Layout",
    options: [
      { id: "inline", label: "Inline", says: "Everything sits in one reading column, about 640px wide, whatever the page." },
      {
        id: "hybrid",
        label: "Hybrid",
        says: "Pages that present (a home page, a shop) use the width, up to about 1200px. Anything meant to be read (an article) sits in a column about 640px wide."
      },
      {
        id: "full",
        label: "Full width",
        says: "Pages run edge to edge on a 12-column grid. Text takes some of the columns; it is never a centred column with empty sides."
      }
    ]
  },
  {
    key: "align",
    label: "Alignment",
    options: [
      { id: "centre", label: "Centred", says: "Headlines and openings are centred." },
      { id: "left", label: "Left", says: "Everything hangs from the left edge; nothing is centred." }
    ]
  },
  {
    key: "scale",
    label: "Scale",
    options: [
      { id: "small", label: "Small", says: "Type stays small everywhere, headlines included. Pictures and space do the talking." },
      { id: "regular", label: "Regular", says: "Type is at a normal reading scale, with clear steps between headline, heading and text." },
      {
        id: "loud",
        label: "Loud",
        says: "Type is very large. A headline is about a tenth of the screen's width tall, and running text is well above normal, around 24 to 40px on a desktop."
      }
    ]
  },
  {
    key: "density",
    label: "Density",
    options: [
      { id: "tight", label: "Tight", says: "Sections sit close together; the page is dense." },
      { id: "regular", label: "Regular", says: "Sections have ordinary room between them." },
      { id: "airy", label: "Airy", says: "Sections are far apart. Empty space is part of the design; leave it empty." }
    ]
  },
  {
    key: "structure",
    label: "Structure",
    options: [
      { id: "plain", label: "Plain", says: "Space alone separates things: no rules, boxes or cards." },
      { id: "ruled", label: "Ruled", says: "A hairline rule opens every section and sits above every item in a list." },
      { id: "cards", label: "Cards", says: "Groups of things sit on cards, on the cards-and-panels colour." },
      { id: "boxed", label: "Boxed", says: "Content sits in bordered cells that share their edges, like a table or a dashboard." }
    ]
  },
  {
    key: "labels",
    label: "Labels",
    options: [
      { id: "none", label: "None", says: "Sections aren't labelled; their headings are enough." },
      { id: "eyebrow", label: "Eyebrow", says: "A small uppercase label sits above each section's heading." },
      { id: "bracket", label: "Brackets", says: "Each section is named by a small label in brackets, like (Work)." },
      { id: "tag", label: "Tags", says: "Sections and items carry pill-shaped tags." }
    ]
  },
  {
    key: "hero",
    label: "Opening",
    options: [
      { id: "statement", label: "Statement", says: "A page opens with words alone: one headline, no picture." },
      { id: "split", label: "Split", says: "A page opens with words on one side and a picture on the other." },
      { id: "poster", label: "Poster", says: "A page opens with a picture across the full width and the headline over it." }
    ]
  }
];
var NUMBERED_SAYS = "Parts are counted: 01, 02, 03.";
function parseDsComposition(value) {
  const raw = value && typeof value === "object" ? value : {};
  const out = { ...DS_DEFAULT_COMPOSITION };
  for (const choice of DS_COMPOSITION_CHOICES) {
    if (choice.options.some((o) => o.id === raw[choice.key])) out[choice.key] = raw[choice.key];
  }
  out.numbered = raw.numbered === true;
  return out;
}
function parseDsBrief(value) {
  const raw = value && typeof value === "object" ? value : {};
  const line = (v, max) => typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
  return {
    reference: line(raw.reference, 400),
    moves: Array.isArray(raw.moves) ? raw.moves.map((m) => line(m, 200)).filter(Boolean).slice(0, 8) : []
  };
}
function dsCompositionWords(c) {
  const lines = DS_COMPOSITION_CHOICES.map((choice) => {
    const option = choice.options.find((o) => o.id === c[choice.key]);
    return option ? `${choice.label}: ${option.says}` : "";
  }).filter(Boolean);
  return c.numbered ? [...lines, `Numbering: ${NUMBERED_SAYS}`] : lines;
}

// spacing.ts
var DS_SPACES = [4, 8, 16, 20, 32, 40, 80, 160];

// taste.ts
var pair2 = (heading, headingAxes, body, bodyAxes) => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` }
});
var AXES = ":wght@400..700";
var DS_PALETTES = [
  // Parabola's own: white, black buttons.
  { id: "classic", label: "Classic", backgrounds: [null], buttons: [null], contrast: [0, 0] },
  // A startup's: whites and zinc greys, near-black or one clear blue.
  { id: "neutral", label: "Neutral", backgrounds: [null, "#FAFAFA", "#F4F4F5", "#09090B"], buttons: ["#18181B", null, "#2563EB"], contrast: [0.05, 0.3] },
  { id: "earthy", label: "Earthy", backgrounds: ["#F3EFE4", "#E7EDDF", "#D9C9A8", "#2E5E3A"], buttons: ["#2E5E3A", "#8A5A2B", "#B5532E"], contrast: [-0.15, 0.15] },
  { id: "pastel", label: "Pastel", backgrounds: ["#FFF4E8", "#F2F0FF", "#EEF6F1", "#FDEFF4"], buttons: ["#2F6FEB", "#00A37A", "#7C5CFF", "#FF7A59"], contrast: [-0.25, 0] },
  { id: "vibrant", label: "Vibrant", backgrounds: ["#FFE600", "#FF4F00", "#0F766E", "#FF3EA5", "#3D5AFE"], buttons: ["#111111", "#2F2BFF", "#FFFFFF"], contrast: [0.3, 0.7] },
  // A team's: white or black, one loud primary, hard contrast.
  // A team's and a track's: volt, black, electric blue, blaze orange, a court green; one loud colour on it.
  {
    id: "sport",
    label: "Sport",
    backgrounds: ["#C6FF3D", "#0B0B0B", "#1F3BFF", "#FF5A1F", "#00C46A", "#FF2E63", null],
    buttons: ["#0B0B0B", "#FFFFFF", "#C6FF3D", "#FF5A1F", "#1F3BFF"],
    contrast: [0.4, 0.8]
  },
  { id: "rich", label: "Rich", backgrounds: ["#F5F1EA", "#121212", "#1E2A24", "#3B2F2A", "#7A1F2B"], buttons: ["#111111", "#8C6A43", "#C9A96E"], contrast: [0.1, 0.4] },
  { id: "vintage", label: "Vintage", backgrounds: ["#F4E9D8", "#F2D7A6", "#E9C46A", "#3B2A20"], buttons: ["#3B2A20", "#2A9D8F", "#D1495B", "#E76F51"], contrast: [-0.1, 0.25] },
  { id: "neon", label: "Neon", backgrounds: ["#05070D", "#0E1A2B", "#2A1B4D", "#1B1035"], buttons: ["#00E5FF", "#B388FF", "#39FF88", "#FF5F1F"], contrast: [0.3, 0.7] }
];
var DS_TYPE_STYLES = [
  {
    id: "classic",
    label: "Classic",
    fonts: [
      pair2("Newsreader", AXES, "Instrument Sans", AXES),
      null,
      pair2("Bricolage Grotesque", AXES, "Instrument Sans", AXES),
      pair2("Shrikhand", "", "Instrument Sans", AXES)
    ]
  },
  {
    id: "editorial",
    label: "Editorial",
    fonts: [
      pair2("Newsreader", AXES, "Inter", AXES),
      pair2("Instrument Serif", "", "Instrument Sans", AXES),
      pair2("Young Serif", "", "Work Sans", AXES),
      pair2("Alfa Slab One", "", "Work Sans", AXES)
    ]
  },
  {
    id: "startup",
    label: "Startup",
    fonts: [
      pair2("Inter Tight", AXES, "Inter", AXES),
      pair2("Geist", AXES, "Geist", AXES),
      pair2("Bricolage Grotesque", AXES, "Inter", AXES),
      pair2("Righteous", "", "Inter", AXES)
    ]
  },
  {
    id: "elegant",
    label: "Elegant",
    fonts: [
      pair2("EB Garamond", AXES, "Inter", AXES),
      pair2("Cormorant Garamond", AXES, "Jost", AXES),
      pair2("Marcellus", "", "Jost", AXES),
      pair2("Cinzel Decorative", ":wght@400;700", "Jost", AXES)
    ]
  },
  {
    id: "friendly",
    label: "Friendly",
    fonts: [
      pair2("Work Sans", AXES, "Work Sans", AXES),
      pair2("DM Sans", AXES, "DM Sans", AXES),
      pair2("Fredoka", AXES, "Nunito", AXES),
      pair2("Bagel Fat One", "", "Nunito", AXES)
    ]
  },
  {
    id: "funky",
    label: "Funky",
    fonts: [
      pair2("Archivo Black", "", "Archivo", AXES),
      pair2("Syne", AXES, "Inter", AXES),
      pair2("Bricolage Grotesque", AXES, "Inter", AXES),
      pair2("Bungee", "", "Work Sans", AXES)
    ]
  },
  {
    id: "quirky",
    label: "Quirky",
    fonts: [
      pair2("Bungee", "", "Work Sans", AXES),
      pair2("Fredoka", AXES, "Nunito", AXES),
      pair2("Shrikhand", "", "DM Sans", AXES),
      pair2("Chango", "", "Nunito", AXES)
    ]
  },
  {
    id: "retro",
    label: "Retro",
    fonts: [
      pair2("DM Serif Display", "", "DM Sans", AXES),
      pair2("Alfa Slab One", "", "Work Sans", AXES),
      pair2("Righteous", "", "Nunito", AXES),
      pair2("Bagel Fat One", "", "Nunito", AXES)
    ]
  },
  {
    id: "futurist",
    label: "Futurist",
    fonts: [
      pair2("Michroma", "", "Rajdhani", ":wght@400;500;600;700"),
      pair2("Space Grotesk", AXES, "Space Grotesk", AXES),
      pair2("Audiowide", "", "Exo 2", AXES),
      pair2("Orbitron", AXES, "Exo 2", AXES)
    ]
  }
];
var DS_BUTTON_LOOKS = [
  // A product's, as shadcn's are: a small radius, flat.
  { id: "product", label: "Product", roundness: [0.15, 0.5], depth: [0, 0] },
  // Parabola's own: fully round, flat.
  { id: "soft", label: "Soft", roundness: [1, 1], depth: [0, 0] },
  { id: "sharp", label: "Sharp", roundness: [0, 0.1], depth: [0, 0] },
  { id: "outline", label: "Outline", roundness: [0, 1], depth: [0, 0], style: { fill: "none", outline: true, outlineWidth: 1 } },
  { id: "text", label: "Text", roundness: [0.5, 1], depth: [0, 0], style: { fill: "none" } },
  // Something to press: the one with a gradient, to pick by hand (no gradients in the styles).
  { id: "tactile", label: "Tactile", roundness: [0.3, 0.7], depth: [0.5, 0.95] },
  // Solid with a thick edge, no gradient.
  { id: "chunky", label: "Chunky", roundness: [0.45, 0.9], depth: [0, 0], style: { outline: true, outlineWidth: 2 } }
];
var DS_TASTES = [
  {
    id: "classic",
    label: "Classic",
    ink: [1, 1],
    // Parabola's own first (its white, its fonts, its round buttons), then an editorial paper, serif and square.
    palettes: ["classic", "earthy"],
    types: ["classic", "editorial"],
    buttons: ["soft", "product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "considered", rule: "A point of view, argued: essay-like, specific, unhurried." }
  },
  {
    id: "minimal",
    label: "Minimal",
    ink: [0.9, 1],
    // As little as it takes: white or grey, one grotesque, square buttons (Text is there to pick by hand).
    palettes: ["classic", "neutral"],
    types: ["startup"],
    buttons: ["sharp", "outline"],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "As few words as it takes; let the space speak." }
  },
  {
    id: "elegant",
    label: "Elegant",
    ink: [0.55, 0.85],
    // A refined serif, rich colour, square buttons (briefly called Fashion, which it isn't).
    palettes: ["rich", "classic"],
    types: ["elegant"],
    buttons: ["sharp", "outline"],
    people: "photo",
    story: "plain",
    voice: { tone: "elegant", rule: "Few words, chosen slowly; never a hard sell." }
  },
  {
    id: "tech",
    label: "Tech",
    ink: [0.9, 1],
    // A product's look, as shadcn's is, and now and then a further-out, sci-fi one.
    palettes: ["neutral", "neutral", "neon"],
    types: ["startup", "startup", "futurist"],
    // Fully round, now and then a product's small radius (square is Minimal's).
    buttons: ["soft", "soft", "product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Say what it does, how, and stop. No hype." }
  },
  {
    id: "natural",
    label: "Natural",
    ink: [0.45, 0.75],
    palettes: ["earthy"],
    types: ["editorial", "friendly"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "grounded", rule: "Slow and sensory, close to the ground." }
  },
  {
    id: "retro",
    label: "Retro",
    ink: [0.4, 0.7],
    // Seventies print and old packaging.
    palettes: ["vintage"],
    types: ["retro"],
    buttons: ["chunky", "soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "warm", rule: "Nostalgic and a bit of a showman, like an old ad that means it." }
  },
  {
    id: "sport",
    label: "Sport",
    ink: [1, 1],
    // Vibrant, athletic: volt, black, electric blue; neon on dark now and then.
    palettes: ["sport", "sport", "neon", "vibrant"],
    types: ["funky"],
    buttons: ["sharp", "chunky"],
    people: "initials",
    story: "loud",
    voice: { tone: "loud", rule: "Short, strong statements, verbs first." }
  }
];
var PERSONALITY = [
  { from: 0, tone: "calm", rule: "Plain words and short sentences; nothing shouted." },
  { from: 0.2, tone: null, rule: null },
  { from: 0.68, tone: "playful", rule: "Light and a little cheeky; an emoji where it helps." },
  { from: 0.88, tone: "wild", rule: "Odd, loud, unexpected; capitals and exclamation marks welcome." }
];
var personality = (mood) => [...PERSONALITY].reverse().find((p) => mood >= p.from) ?? PERSONALITY[0];
var styleOf = (ids) => DS_TASTES.find((t) => ids.includes(t.id));
function dsTasteNames(ids) {
  return DS_TASTES.filter((t) => ids.includes(t.id)).map((t) => t.label);
}
function dsTasteVoice(ids, mood) {
  const style = styleOf(ids);
  const p = personality(mood);
  const tone = p.tone ?? style?.voice.tone ?? "calm";
  return { tone, rules: [style?.voice.rule, p.rule].filter((r) => Boolean(r)) };
}

// fonts.ts
var SYSTEM_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';
var DS_FONTS = [
  {
    id: "instrument-sans",
    label: "Instrument Sans",
    family: `var(--ds-font-instrument-sans, "Instrument Sans"), ${SYSTEM_STACK}`,
    weights: [400, 500, 600, 700],
    google: "Instrument+Sans:wght@400..700"
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: `var(--ds-font-instrument-serif, "Instrument Serif"), Georgia, serif`,
    // One weight only: anything heavier would be faked.
    weights: [400],
    google: "Instrument+Serif"
  },
  { id: "system", label: "System", family: SYSTEM_STACK, weights: [300, 400, 500, 600, 700] }
];
var DS_DEFAULT_FONT = "instrument-sans";
var DS_DEFAULT_HEADING_FONT = "instrument-serif";
function dsNearestWeight(font, weight) {
  return font.weights.reduce((best, w) => Math.abs(w - weight) < Math.abs(best - weight) ? w : best, font.weights[0] ?? 400);
}
var DS_GOOGLE_WEIGHT_MAX = 1e3;
function dsGoogleWeights(google) {
  const spec = google.split(":")[1] ?? "";
  const values = spec.includes("@") ? spec.split("@")[1] : "";
  if (!/wght/.test(spec) || !values) return [400];
  const clampW = (n) => Math.min(DS_GOOGLE_WEIGHT_MAX, Math.max(1, Math.round(n)));
  const weights = /* @__PURE__ */ new Set();
  for (const part of values.split(";").slice(0, 40)) {
    const value = part.split(",").pop() ?? "";
    const [from, to] = value.split("..").map(Number);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      const end = clampW(to);
      for (let w = Math.ceil(clampW(from) / 100) * 100, steps = 0; w <= end && steps < 12; w += 100, steps += 1) weights.add(w);
    } else if (Number.isFinite(from)) {
      weights.add(clampW(from));
    }
  }
  return weights.size > 0 ? [...weights].sort((a, b) => a - b) : [400];
}
var dsSafeFontLabel = (label) => label.replace(/[^\p{L}\p{N} ._'-]/gu, "").trim().slice(0, 60) || "Font";
var DS_GOOGLE_FONT_RE = /^[A-Za-z0-9+]+(:[A-Za-z0-9,;@.:+-]*)?$/;
var DS_CUSTOM_FONT_ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
function dsGoogleWeightsValid(google) {
  const spec = google.split(":")[1];
  if (!spec || !spec.includes("@")) return true;
  const [axisList, values] = spec.split("@");
  const axes = axisList.split(",");
  if (!values) return true;
  return values.split(";").every(
    (tuple) => tuple.split(",").every((value, i) => {
      if (axes[i] === "ital") return value === "0" || value === "1";
      if (axes[i] !== "wght") return true;
      const range = value.split("..");
      if (range.length > 2) return false;
      const nums = range.map((n) => /^\d{1,4}$/.test(n) ? Number(n) : NaN);
      return nums.every((n) => n >= 1 && n <= DS_GOOGLE_WEIGHT_MAX) && (nums.length < 2 || nums[0] <= nums[1]);
    })
  );
}
function dsCustomFont(font) {
  return {
    id: font.id,
    label: font.label,
    // The name sits inside quotes in CSS: only safe characters, so it can't close them or the <style>.
    family: `"${dsSafeFontLabel(font.label)}", ${SYSTEM_STACK}`,
    weights: dsGoogleWeights(font.google),
    google: font.google,
    custom: true
  };
}
function dsGoogleFontsUrl(fonts) {
  const families = [...new Map(fonts.filter((f) => f.google).map((f) => [f.id, `family=${f.google}`])).values()];
  return families.length > 0 ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}

// radius.ts
var DS_RADIUS_TOKENS = ["sm", "control", "md", "lg", "pill"];
var DS_RADII = [
  { id: "none", label: "None", px: { sm: 0, control: 0, md: 0, lg: 0, pill: 0 } },
  // Small: a crisp 2px corner on everything, buttons included.
  { id: "small", label: "Small", px: { sm: 2, control: 2, md: 2, lg: 2, pill: 2 } },
  { id: "medium", label: "Medium", px: { sm: 4, control: 6, md: 8, lg: 12, pill: 12 } },
  { id: "large", label: "Large", px: { sm: 4, control: 8, md: 12, lg: 16, pill: 9999 } }
];
var DS_RADIUS_MAX = 64;
function dsRadiusPx(radius) {
  if (typeof radius === "number") {
    const px2 = Math.min(DS_RADIUS_MAX, Math.max(0, Math.round(radius)));
    return { sm: Math.round(px2 / 4), control: Math.round(px2 / 2), md: Math.round(px2 * 3 / 4), lg: px2, pill: px2 };
  }
  return (DS_RADII.find((r) => r.id === radius) ?? DS_RADII[DS_RADII.length - 1]).px;
}

// nav-style.ts
var DS_NAV_SURFACES = [
  { id: "transparent", label: "None" },
  { id: "blur", label: "Blur" },
  { id: "solid", label: "Solid" }
];
var DS_DEFAULT_NAV_STYLE = { surface: "blur" };
function parseDsNavStyle(value) {
  const raw = value && typeof value === "object" ? value : {};
  const surface = DS_NAV_SURFACES.find((s) => s.id === raw.surface)?.id ?? DS_DEFAULT_NAV_STYLE.surface;
  return { surface };
}

// theme.ts
var DS_TEXT_STYLES = ["display", "h1", "h2", "h3", "p", "prose", "small"];
var DS_BODY_FAMILY = "body";
var DS_HEADING_FAMILY = "heading";
var DS_TEXT_STYLE_DEFAULTS = {
  display: { label: "Display", family: "heading", weight: 400, size: 60, lineHeight: 64, use: "Editorial headlines on large screens" },
  h1: { label: "H1", family: "heading", weight: 400, size: 36, lineHeight: 48, use: "Page and post titles" },
  h2: { label: "H2", family: "heading", weight: 400, size: 24, lineHeight: 30, use: "Sections" },
  h3: { label: "H3", family: "body", weight: 500, size: 18, lineHeight: 26, use: "Small headings, the site's name" },
  p: { label: "P", family: "body", weight: 500, size: 16, lineHeight: 22, use: "Interface text: buttons, fields, lists" },
  prose: { label: "Prose", family: "body", weight: 500, size: 18, lineHeight: 28, use: "Paragraphs people read" },
  small: { label: "Small", family: "body", weight: 500, size: 14, lineHeight: 18, use: "Meta and descriptions; the floor" }
};
var DS_DEFAULT_THEME = {
  character: DS_DEFAULT_CHARACTER,
  colours: DS_DEFAULT_COLOURS,
  families: [
    { id: DS_BODY_FAMILY, label: "Font", font: DS_DEFAULT_FONT },
    { id: DS_HEADING_FAMILY, label: "Heading", font: DS_DEFAULT_HEADING_FONT }
  ],
  type: Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const { label, family, weight, size, lineHeight } = DS_TEXT_STYLE_DEFAULTS[s];
      return [s, { label, family, weight, size, lineHeight }];
    })
  ),
  customFonts: [],
  hiddenFonts: [],
  radius: null,
  pillRadius: null,
  buttons: null,
  fields: DS_DEFAULT_FIELD_STYLE,
  nav: DS_DEFAULT_NAV_STYLE,
  icons: "lucide",
  composition: DS_DEFAULT_COMPOSITION,
  brief: DS_DEFAULT_BRIEF
};
var DS_PERMANENT_FONT = "system";
function dsThemeFont(theme, id) {
  const fonts = [...DS_FONTS, ...theme.customFonts.map(dsCustomFont)];
  return fonts.find((f) => f.id === id) ?? fonts.find((f) => f.id === DS_DEFAULT_FONT) ?? fonts.find((f) => f.id === DS_PERMANENT_FONT);
}
function dsFamily(theme, id) {
  return theme.families.find((f) => f.id === id) ?? theme.families[0];
}
var currentFamilyId = (id) => id === "primary" ? DS_BODY_FAMILY : id === "secondary" || id === "display" ? DS_HEADING_FAMILY : id;
var OLD_LABELS = { Primary: "Font", Secondary: "Heading", Display: "Heading" };
var px = (value, fallback, min, max) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
function parseDsThemeConfig(value) {
  const raw = value && typeof value === "object" ? value : {};
  const customFonts = Array.isArray(raw.customFonts) ? raw.customFonts.flatMap((f) => {
    const font = f;
    return typeof font?.id === "string" && typeof font.label === "string" && typeof font.google === "string" && DS_CUSTOM_FONT_ID_RE.test(font.id) && DS_GOOGLE_FONT_RE.test(font.google) && dsGoogleWeightsValid(font.google) ? [{ id: font.id, label: dsSafeFontLabel(font.label), google: font.google }] : [];
  }) : [];
  const allFonts = [...DS_FONTS.map((f) => f.id), ...customFonts.map((f) => f.id)];
  const known = (id, fallback) => typeof id === "string" && allFonts.includes(id) ? id : fallback;
  const coloursRaw = raw.colours ?? {};
  const hex = (value2) => dsIsHex(value2) ? value2.toUpperCase() : null;
  const lightPick = (value2, presets, own) => hex(value2) ?? (typeof value2 === "string" && value2 !== own && presets.some((c) => c.id === value2) ? value2 : null);
  const shift = (value2) => typeof value2 === "number" && Number.isFinite(value2) ? { value: Math.min(DS_SHIFT_MAX, Math.max(-DS_SHIFT_MAX, value2)) } : null;
  const colour = (value2, presets = [], own = "") => {
    const v = value2 && typeof value2 === "object" ? value2 : {};
    const lightShift = shift(v.lightShift);
    const darkShift = shift(v.darkShift);
    return {
      light: lightPick(v.light, presets, own),
      dark: hex(v.dark),
      ...lightShift && { lightShift: lightShift.value },
      ...darkShift && { darkShift: darkShift.value }
    };
  };
  const legacyBackground = coloursRaw.background && typeof coloursRaw.background === "object" ? coloursRaw.background.light : coloursRaw.background;
  const accent = colour(coloursRaw.accent, DS_ACCENT_COLOURS, DS_DEFAULT_ACCENT_COLOUR);
  const buttons = colour(coloursRaw.button);
  const colours = coloursRaw.theme || coloursRaw.text || coloursRaw.ui ? {
    theme: colour(coloursRaw.theme),
    surface: colour(coloursRaw.surface),
    // Typography was "fonts and UI" for a day.
    text: colour(coloursRaw.text ?? coloursRaw.ui, DS_BASE_COLOURS, DS_DEFAULT_BASE_COLOUR),
    muted: colour(coloursRaw.muted),
    accent: accent.light === null && buttons.light ? buttons : accent,
    buttonSecondary: colour(coloursRaw.buttonSecondary),
    field: colour(coloursRaw.field)
  } : {
    theme: { light: hex(legacyBackground), dark: null },
    surface: { light: null, dark: null },
    text: { light: lightPick(coloursRaw.base, DS_BASE_COLOURS, DS_DEFAULT_BASE_COLOUR), dark: null },
    muted: { light: null, dark: null },
    accent: { light: lightPick(coloursRaw.accent ?? coloursRaw.secondary, DS_ACCENT_COLOURS, DS_DEFAULT_ACCENT_COLOUR), dark: null },
    buttonSecondary: { light: null, dark: null },
    field: { light: null, dark: null }
  };
  let families;
  let legacy = false;
  if (Array.isArray(raw.families)) {
    const seen = /* @__PURE__ */ new Set();
    families = raw.families.flatMap((f) => {
      const family = f;
      const id = currentFamilyId(family?.id);
      if (typeof id !== "string" || !/^[a-z][a-z0-9-]{0,40}$/.test(id) || seen.has(id)) return [];
      seen.add(id);
      const asked = typeof family.label === "string" && family.label.trim() ? family.label.trim().slice(0, 40) : id;
      return [{ id, label: OLD_LABELS[asked] ?? asked, font: known(family.font, DS_DEFAULT_FONT) }];
    });
  } else {
    const fonts = raw.fonts ?? {};
    legacy = fonts.text !== void 0 || fonts.headings !== void 0;
    families = [
      { id: DS_BODY_FAMILY, label: "Font", font: known(legacy ? fonts.text : fonts.primary, DS_DEFAULT_FONT) },
      {
        id: DS_HEADING_FAMILY,
        label: "Heading",
        font: known(legacy ? fonts.headings : fonts.secondary ?? fonts.display, DS_DEFAULT_HEADING_FONT)
      }
    ];
  }
  const body = families.find((f) => f.id === DS_BODY_FAMILY) ?? DS_DEFAULT_THEME.families[0];
  families = [body, ...families.filter((f) => f.id !== DS_BODY_FAMILY)];
  const familyIds = families.map((f) => f.id);
  const typeRaw = raw.type ?? {};
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const d = DS_TEXT_STYLE_DEFAULTS[s];
      const t = typeRaw[s];
      const asked = currentFamilyId(t?.family);
      const fallback = legacy && d.family === DS_HEADING_FAMILY && families[1]?.font === families[0].font ? DS_BODY_FAMILY : d.family;
      const family = typeof asked === "string" && familyIds.includes(asked) ? asked : familyIds.includes(fallback) ? fallback : DS_BODY_FAMILY;
      const label = typeof t?.label === "string" && t.label.trim() ? t.label.trim().slice(0, 40) : d.label;
      const weight = px(t?.weight, family === d.family ? d.weight : family === DS_BODY_FAMILY ? 500 : 400, 100, 900);
      return [
        s,
        {
          label,
          family,
          weight: Math.round(weight / 100) * 100,
          size: px(t?.size, d.size, 10, 200),
          lineHeight: px(t?.lineHeight, d.lineHeight, 10, 240)
        }
      ];
    })
  );
  const used = new Set(families.map((f) => f.font));
  const hiddenFonts = Array.isArray(raw.hiddenFonts) ? [...new Set(raw.hiddenFonts.filter((id) => typeof id === "string"))].filter(
    (id) => id !== DS_PERMANENT_FONT && DS_FONTS.some((f) => f.id === id) && !used.has(id)
  ) : [];
  const parseRadius = (value2) => typeof value2 === "number" && Number.isFinite(value2) ? Math.min(DS_RADIUS_MAX, Math.max(0, Math.round(value2))) : DS_RADII.some((r) => r.id === value2) ? value2 : null;
  const older = !(raw.character && typeof raw.character === "object");
  const storedRadius = parseRadius(raw.radius);
  const radius = older && storedRadius === "large" ? null : storedRadius;
  const pillRadius = parseRadius(raw.pillRadius);
  const storedButtons = raw.buttons && typeof raw.buttons === "object" ? parseDsButtonStyle(raw.buttons) : null;
  const parsed = parseDsCharacter(raw.character);
  const stored = raw.character && typeof raw.character === "object" ? raw.character.scoped : void 0;
  const chips = { ...parsed.scoped };
  if (!stored || typeof stored !== "object" || Array.isArray(stored) || Object.values(stored).every(Array.isArray)) {
    const c = parsed;
    if (!chips.colour && c.colour === 0 && c.brightness === 1 && c.contrast === 0 && Object.values(colours).every((v) => !v.light && !v.dark)) chips.colour = "classic";
    if (!chips.type && families.find((f) => f.id === DS_BODY_FAMILY)?.font === DS_DEFAULT_FONT && families.find((f) => f.id === DS_HEADING_FAMILY)?.font === DS_DEFAULT_HEADING_FONT) chips.type = "classic";
    if (!chips.buttons && c.roundness === 1 && c.depth === 0 && radius === null && !storedButtons) chips.buttons = "soft";
  }
  const character = { ...parsed, scoped: chips };
  const icons = DS_ICON_LIBRARIES.some((l) => l.id === raw.icons && l.ready) ? raw.icons : "lucide";
  const buttonStyle = older && storedButtons && JSON.stringify(storedButtons) === JSON.stringify(DS_DEFAULT_BUTTON_STYLE) ? null : storedButtons;
  return {
    character,
    colours,
    families,
    type,
    customFonts,
    hiddenFonts,
    radius,
    pillRadius,
    buttons: buttonStyle,
    fields: parseDsFieldStyle(raw.fields),
    nav: parseDsNavStyle(raw.nav),
    icons,
    composition: parseDsComposition(raw.composition),
    brief: parseDsBrief(raw.brief)
  };
}
var dsThemeRadius = (theme) => theme.radius ?? dsCharacterRadius(theme.character);
var dsThemeButtons = (theme) => theme.buttons ?? dsCharacterButtons(theme.character);
function dsThemeColourTokens(theme, mode) {
  return dsColourTokens(theme.colours, mode, dsCharacterColourOptions(theme.character));
}
function colourVars(theme, mode) {
  const tokens = dsThemeColourTokens(theme, mode);
  return {
    ...Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--ds-${name}`, value])),
    ...dsButtonStyleVars(dsThemeButtons(theme), tokens.button),
    ...dsFieldStyleVars(theme.fields, tokens["field-border"])
  };
}
function dsThemeVars(theme) {
  const vars = colourVars(theme, "light");
  for (const family of theme.families) vars[`--ds-family-${family.id}`] = dsThemeFont(theme, family.font).family;
  for (const s of DS_TEXT_STYLES) {
    const t = theme.type[s];
    const family = dsFamily(theme, t.family);
    vars[`--ds-font-${s}`] = `var(--ds-family-${family.id})`;
    vars[`--ds-text-${s}`] = `${t.size}px`;
    vars[`--ds-text-${s}-leading`] = `${t.lineHeight}px`;
    vars[`--ds-weight-${s}`] = String(dsNearestWeight(dsThemeFont(theme, family.font), t.weight));
  }
  const radius = dsThemeRadius(theme);
  const px2 = dsRadiusPx(radius);
  for (const token of DS_RADIUS_TOKENS) vars[`--ds-radius-${token}`] = `${px2[token]}px`;
  vars["--ds-radius-chip"] = `${dsRadiusPx(theme.pillRadius ?? radius).pill}px`;
  return vars;
}
function dsThemeDarkVars(theme) {
  return colourVars(theme, "dark");
}
var rule = (selector, vars) => `${selector} { ${Object.entries(vars).map(([name, value]) => `${name}: ${value};`).join(" ")} }`;
var SCOPE_DERIVED = {
  "--ds-font": "var(--ds-family-body)",
  "--ds-hover": "color-mix(in srgb, var(--ds-fg) 12%, transparent)",
  "--ds-hover-inverse": "color-mix(in srgb, var(--ds-bg) 18%, transparent)",
  "--ds-focus": "var(--ds-fg)"
};
var COLOUR_ROLES = [
  ["bg", "background: the page"],
  ["fg", "primary: the text"],
  ["fg-muted", "secondary: quieter text"],
  ["fg-subtle", "faintest text (captions, placeholders)"],
  ["border", "borders and field outlines"],
  ["surface-subtle", "surface: cards and panels"],
  ["field", "field: input backgrounds"],
  ["field-border", "field outlines"],
  ["surface", "button: secondary, the quiet buttons and pills, and image placeholders"],
  ["on-surface", "text on secondary buttons and pills"],
  ["surface-inverse", "toasts and tooltips"],
  ["button", "button: primary, the solid buttons and selected states"],
  ["on-button", "text on primary buttons"],
  ["highlight", "button colour as an accent (highlight pills, what needs attention)"],
  ["highlight-tint", "accent background"]
];
function dsThemeExport(theme, name = "Parabola theme") {
  const colours = (mode) => {
    const tokens = dsThemeColourTokens(theme, mode);
    return Object.fromEntries(COLOUR_ROLES.map(([token, role]) => [role, tokens[token]]));
  };
  const familyFont = (id) => dsThemeFont(theme, dsFamily(theme, id).font);
  const radius = dsThemeRadius(theme);
  const buttons = dsThemeButtons(theme);
  const px2 = dsRadiusPx(radius);
  const c = theme.character;
  const pct = (n) => Math.round(n * 100);
  const overrides = [
    ...Object.keys(theme.colours).filter((k) => theme.colours[k].light !== null || theme.colours[k].dark !== null).map((k) => `colour: ${k}`),
    ...theme.radius !== null ? ["corners"] : [],
    ...theme.pillRadius !== null ? ["pill corners"] : [],
    ...theme.buttons !== null ? ["buttons"] : []
  ];
  const round = (n) => n >= 9999 ? "fully round" : `${n}px`;
  return {
    about: `"${name}", a website theme made with Parabola. "character" is the look as a whole, dials an agent moves rather than picking colours: hue (0 to 360), temperature ("warmth", cool -50 to warm +50), how much colour ("colour"), the type's contrast ("typeContrast", 100 full, lower an ink of the hue), brightness (0 black, 50 the colour at its strongest, 100 white), contrast, roundness and depth, each 0 to 100 (contrast -50 to +50), plus the base colour they make and the chips picked in each section ("scoped"); every value under them is worked out from the dials unless listed in "overrides". Colours are given for a light and a dark mode, each by what it's for; fonts by name, with a Google Fonts link; type styles by name, largest first; corners in pixels. Use it to build or restyle a website in this look. "settings" is the theme itself, for Parabola to read back.`,
    name,
    character: {
      tastes: c.tastes,
      scoped: c.scoped,
      background: dsCharacterBase(c) ?? "white",
      hue: Math.round(c.hue),
      warmth: Math.round(c.warmth * 50),
      typeContrast: pct(c.ink),
      colour: pct(c.colour),
      brightness: pct(c.brightness),
      contrast: Math.round(c.contrast * 50),
      roundness: pct(c.roundness),
      depth: pct(c.depth),
      ...dsCharacterIsDefault(c) ? { note: "Parabola's own: every dial at rest" } : {}
    },
    overrides,
    colours: { light: colours("light"), dark: colours("dark") },
    typography: {
      fonts: Object.fromEntries(theme.families.map((f) => [f.label, familyFont(f.id).label])),
      googleFonts: dsGoogleFontsUrl(theme.families.map((f) => familyFont(f.id))),
      styles: Object.fromEntries(
        DS_TEXT_STYLES.map((s) => {
          const t = theme.type[s];
          return [t.label, { font: familyFont(t.family).label, size: `${t.size}px`, lineHeight: `${t.lineHeight}px`, weight: t.weight }];
        })
      )
    },
    corners: {
      "cards and panels": round(px2.lg),
      "fields and menus": round(px2.md),
      "small buttons and pills": round(px2.control),
      "smallest (tags, swatches)": round(px2.sm),
      buttons: round(px2.pill),
      pills: round(dsRadiusPx(theme.pillRadius ?? radius).pill)
    },
    buttons: {
      fill: buttons.fill === "gradient" && buttons.contrast !== 0 ? `a gradient of the button colour, ${buttons.contrast > 0 ? "lighter at the top and darker at the bottom" : "darker at the top and lighter at the bottom"} (contrast ${Math.round(Math.abs(buttons.contrast) * 50)} of 50)` : "solid, the button colour",
      outline: buttons.outline ? `a ${buttons.outlineWidth}px line inside the edge, the button colour a step darker` : "none",
      fieldOutline: theme.fields.outline ? `${theme.fields.outlineWidth}px${theme.fields.outlineOpacity < 1 ? `, ${Math.round(theme.fields.outlineOpacity * 100)}% opaque` : ""}` : "none",
      label: buttons.shadow ? `a 1px text shadow on the label only, falling away from a light at ${buttons.shadowAngle}\xB0 (90 is from above)` : "flat"
    },
    settings: theme
  };
}
var SCOPE_MODE = {
  light: {
    "--ds-error": "oklch(0.577 0.245 27.325)",
    "--ds-shadow-raised": "0 12px 32px -8px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.06)"
  },
  dark: {
    "--ds-error": "oklch(0.704 0.191 22.216)",
    "--ds-shadow-raised": "0 12px 32px -8px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4)"
  }
};
function dsThemeCss(theme, scope) {
  if (!scope) return `${rule(":root", dsThemeVars(theme))} ${rule(".dark", dsThemeDarkVars(theme))}`;
  const at = `.${scope}`;
  return [
    rule(at, { ...dsThemeVars(theme), ...SCOPE_DERIVED, ...SCOPE_MODE.light }),
    // Dark by its own data-ds-mode, or, with none set, by the page's `.dark`
    // (already there before the first paint, so the scope never flashes light).
    rule(`${at}[data-ds-mode="dark"], .dark ${at}:not([data-ds-mode="light"])`, { ...dsThemeDarkVars(theme), ...SCOPE_MODE.dark }),
    `${at} { font-family: var(--ds-font); color: var(--ds-fg); }`
  ].join(" ");
}

// brand-kit.ts
var KIT_COLOURS = [
  ["bg", "Page background."],
  ["fg", "Text, and headings."],
  ["fg-muted", "Quieter text: descriptions, secondary lines."],
  ["fg-subtle", "Faintest text: captions, placeholders, meta."],
  ["border", "Dividers and borders."],
  ["surface-subtle", "Cards and panels on the page."],
  ["surface", "Secondary buttons, pills and image placeholders."],
  ["on-surface", "Text on secondary buttons and pills."],
  ["button", "Primary buttons and the one accent: links that act, selected states."],
  ["on-button", "Text on primary buttons."],
  ["highlight", "What needs attention: a highlight pill, a key number."],
  ["highlight-tint", "A soft background behind highlighted things."],
  ["field", "Input backgrounds."],
  ["field-border", "Input outlines."],
  ["surface-inverse", "Toasts and tooltips."]
];
var styleName = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
var HOW_TO_USE = [
  "Keep the values as they are: the colours and what each is for, the fonts, the spacing steps and the corners. Follow the composition and the signature moves: they are what makes this style this style, and not another with the same colours.",
  "Everything else is yours: what goes on a page, the sections it needs, imagery, motion, and things nobody has made before. Experiment there, and build it from these values."
];
var MADE_WITH = "Created with parabolasystem.com";
function pageInWords(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "the page";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const light = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const grey = Math.max(r, g, b) - Math.min(r, g, b) < 0.06;
  if (light > 0.97 && grey) return "a white page";
  if (light < 0.12) return "a dark page";
  if (grey) return light > 0.6 ? "a light grey page" : "a grey page";
  return light > 0.8 ? "a pale, tinted page" : light > 0.35 ? "a page in full colour" : "a deep-coloured page";
}
function dsBrandKit(theme, name) {
  const exported = dsThemeExport(theme, name);
  const light = dsThemeColourTokens(theme, "light");
  const dark = dsThemeColourTokens(theme, "dark");
  const c = theme.character;
  const voice = dsTasteVoice(c.tastes, c.mood);
  const tastes = dsTasteNames(c.tastes);
  const fonts = exported.typography.fonts;
  const heading = fonts.Heading ?? Object.values(fonts)[0];
  const body = fonts.Font ?? Object.values(fonts)[0];
  const styles = Object.entries(exported.typography.styles);
  const corners = exported.corners;
  const themeCss = dsThemeCss(theme);
  const stack = (family, font) => (themeCss.match(new RegExp(`--ds-family-${family}: ([^;]+);`))?.[1] ?? `"${font}", sans-serif`).replace(
    /var\(--ds-font-[\w-]+, ("[^"]+")\)/g,
    "$1"
  );
  const tokens = {
    name,
    version: 1,
    // The theme itself rides along, so a design system made from this kit comes back into Parabola exactly.
    meta: { source: "Parabola", parabola: theme },
    color: {
      themes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" }
      ],
      tokens: KIT_COLOURS.map(([token, usage]) => ({
        name: token,
        value: { light: light[token], dark: dark[token] },
        usage
      }))
    },
    type: {
      families: { body: stack("body", body), heading: stack("heading", heading) },
      groups: [
        {
          name: "Text",
          family: "body",
          styles: styles.map(([label, s]) => ({
            name: styleName(label),
            family: s.font === heading && heading !== body ? "heading" : "body",
            fontSize: s.size,
            lineHeight: s.lineHeight,
            fontWeight: s.weight
          }))
        }
      ]
    },
    spacing: {
      tokens: DS_SPACES.map((px2) => ({ name: `space-${px2}`, value: `${px2}px`, usage: SPACE_USAGE[px2] ?? "" }))
    },
    radius: {
      tokens: Object.entries(corners).map(([use, value]) => ({
        name: `radius-${styleName(use).split("-")[0]}`,
        value: value === "fully round" ? "9999px" : value,
        usage: `${use[0].toUpperCase()}${use.slice(1)}.`
      }))
    }
  };
  const googleFontsUrl = exported.typography.googleFonts;
  const googleFonts = googleFontsUrl;
  const row = (cells) => `| ${cells.join(" | ")} |`;
  const describe = [
    tastes.length ? tastes.join(" and ") : "Parabola",
    dsMoodLabel(c.mood).toLowerCase()
  ].join(", ");
  const readme = [
    `# ${name}: brand guide`,
    "",
    `Made with Parabola. ${describe[0].toUpperCase()}${describe.slice(1)}, set in ${[.../* @__PURE__ */ new Set([heading, body])].join(" and ")}.`,
    "",
    "**For agents.** Read this before making anything in this brand: a page, a document, a deck, a social post, an email. For HTML, link `tokens.css` (or copy its variables) and the fonts.",
    "",
    ...HOW_TO_USE,
    "",
    "## Voice",
    "",
    `Tone: ${voice.tone}.`,
    "",
    ...(voice.rules.length ? voice.rules : ["Plain words and short sentences; nothing shouted."]).map((r) => `- ${r}`),
    "",
    "## Colour",
    "",
    "Light is the default; dark is the same brand at night. Use colours only for the jobs listed: text on the page is `fg`, quieter text `fg-muted`, the one accent is `button`.",
    "",
    row(["Token", "Light", "Dark", "Use"]),
    row(["---", "---", "---", "---"]),
    ...KIT_COLOURS.map(([token, usage]) => row([`\`${token}\``, light[token], dark[token], usage])),
    "",
    "## Type",
    "",
    `Headings in **${heading}**, everything else in **${body}**.${exported.typography.googleFonts ? ` Fonts: ${exported.typography.googleFonts}` : ""}`,
    "",
    row(["Style", "Font", "Size", "Line height", "Weight"]),
    row(["---", "---", "---", "---", "---"]),
    ...styles.map(([label, s]) => row([label, s.font, s.size, s.lineHeight, String(s.weight)])),
    "",
    "Text never goes below Small. Paragraphs people read use Prose, about 600px wide at most.",
    "",
    "## Space",
    "",
    `Spacing steps: ${DS_SPACES.map((px2) => `${px2}px`).join(", ")}. Use only these. Generous space between sections; never crowd.`,
    "",
    "## Corners",
    "",
    ...Object.entries(corners).map(([use, value]) => `- ${use[0].toUpperCase()}${use.slice(1)}: ${value}`),
    "",
    "## Buttons",
    "",
    `- Primary: \`button\` fill, \`on-button\` text; ${exported.buttons.fill}.`,
    `- Outline: ${exported.buttons.outline}. Label: ${exported.buttons.label}.`,
    "- Secondary: `surface` fill, `on-surface` text.",
    `- Fields: \`field\` background; outline ${exported.buttons.fieldOutline}, in \`field-border\`.`,
    "",
    "## Making things",
    "",
    "- **Pages and documents:** `bg` page, `fg` text, headings in the heading font, one accent (`button`). Cards on `surface-subtle` with the cards-and-panels corner.",
    "- **Decks and slides:** the same colours and fonts; Display or H1 for titles, Prose for body; one idea per slide.",
    "- **Social posts and cards:** the brand's background and one accent; the heading font, large; few words, in the voice above.",
    "- **Email:** the body font on white or `bg`, `fg` text, the primary button for the one link that matters.",
    "",
    MADE_WITH,
    ""
  ].join("\n");
  const chip = (list, id) => list.find((o) => o.id === id)?.label;
  const look = [
    [chip(DS_PALETTES, c.scoped.colour), "colour"],
    [chip(DS_TYPE_STYLES, c.scoped.type), "type"],
    [chip(DS_BUTTON_LOOKS, c.scoped.buttons), "buttons"]
  ].filter(([label]) => label).map(([label, what]) => `${label} ${what}`).join(", ");
  const both = (token) => `${light[token]} (dark mode ${dark[token]})`;
  const size = (label, s) => `${label} ${parseInt(s.size)}/${parseInt(s.lineHeight)}`;
  const shape = corners.buttons === "fully round" ? "pill-shaped" : `with ${corners.buttons} corners`;
  const brief = { ...theme.brief, moves: theme.brief.moves.map((m) => m.trim()).filter(Boolean) };
  const style = [
    `Use the "${name}" style for everything you make.`,
    "",
    ...brief.reference ? [brief.reference, ""] : [],
    `The look: ${look ? `${look}. ` : ""}${pageInWords(light.bg)[0].toUpperCase()}${pageInWords(light.bg).slice(1)}, headings in ${heading}${heading === body ? "" : ` and everything else in ${body}`}, buttons ${shape}.`,
    "",
    "Colours",
    `- Page: ${both("bg")}`,
    `- Text: ${both("fg")}; quieter text ${both("fg-muted")}`,
    `- Accent and primary button: ${both("button")}, its text ${both("on-button")}`,
    `- Cards and panels: ${both("surface-subtle")}; secondary buttons and pills ${both("surface")}`,
    `- Borders: ${both("border")}`,
    "",
    "Type",
    `- Headings: ${heading}. Everything else: ${body}.${googleFontsUrl ? ` Fonts: ${googleFontsUrl}` : ""}`,
    `- Base sizes (size/line height, px; Scale, under Composition, says how far pages go from them): ${styles.map(([label, s]) => size(label, s)).join(", ")}`,
    "",
    "Shape and space",
    `- Buttons: ${shape}; ${exported.buttons.outline === "none" ? exported.buttons.fill : `outlined, ${exported.buttons.outline}`}.`,
    `- Fields: ${exported.buttons.fieldOutline === "none" ? "no outline" : `a ${exported.buttons.fieldOutline} outline`}. Cards and panels: ${corners["cards and panels"]} corners.`,
    `- Spacing steps: ${DS_SPACES.map((px2) => `${px2}`).join(", ")}px.`,
    "",
    "Composition",
    ...dsCompositionWords(theme.composition).map((line) => `- ${line}`),
    "",
    ...brief.moves.length ? ["Signature moves", ...brief.moves.map((m) => `- ${m}`), ""] : [],
    `Voice: ${voice.tone}. ${(voice.rules.length ? voice.rules : ["Plain words and short sentences; nothing shouted."]).join(" ")}`,
    "",
    "How to use it",
    ...HOW_TO_USE,
    "",
    MADE_WITH
  ].join("\n");
  const css = `${googleFonts ? `@import url("${googleFonts}");

` : ""}/* ${name}, from Parabola. Light on :root, dark on .dark. */
${themeCss.replace(/ \.dark/, "\n.dark").replace(/; /g, ";\n  ").replace(/\{ ?/g, "{\n  ").replace(/ ?\}/g, "\n}")}
`;
  return { name, style, readme, tokens, css, theme: exported };
}
var SPACE_USAGE = {
  4: "Hairline gaps: an icon and its label.",
  8: "Tight groups: pills in a row, a label and its field.",
  16: "Card padding; gaps between items in a list.",
  20: "The page's side margin on a phone.",
  32: "A picture and the text beside it, in a list.",
  40: "Between blocks inside a section.",
  80: "Between sections.",
  160: "Around the biggest breaks: before a footer, around a hero."
};
function dsThemeFromPaste(text) {
  const json = (raw2) => {
    try {
      return JSON.parse(raw2);
    } catch {
      return null;
    }
  };
  const marker = text.indexOf("=== tokens.json ===");
  const value = json(text) ?? (marker >= 0 ? json(text.slice(marker + "=== tokens.json ===".length)) : null);
  if (!value || typeof value !== "object") return null;
  const raw = value;
  const theme = raw.settings ?? raw.meta?.parabola ?? (raw.character ? raw : null);
  return theme ? parseDsThemeConfig(theme) : null;
}

// cli/files.ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
var FILE_EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];
function resolveFile(pkgRoot2, from, spec) {
  const base = join(dirname(from), spec);
  for (const ext of FILE_EXTENSIONS) {
    const path = base + ext;
    if (/\.(tsx?|css)$/.test(path) && existsSync(join(pkgRoot2, path))) return path;
  }
  return null;
}
function transform(file, source) {
  if (file !== "provider.tsx") return source;
  return source.replace(
    /import type \{ DsThemeEntry, DsThemeLibrary \} from "\.\/theme";/,
    "// The theme engine isn't copied with a component; these are its shapes, loosely.\ntype DsThemeEntry = { id: string; name: string; theme: unknown };\ntype DsThemeLibrary = { themes: DsThemeEntry[]; active: string };"
  );
}
function closure(pkgRoot2, entries) {
  const files = [];
  const packages = /* @__PURE__ */ new Set();
  const visit = (file) => {
    if (files.includes(file)) return;
    files.push(file);
    const source = readFileSync(join(pkgRoot2, file), "utf8");
    for (const [, spec] of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
      if (file === "provider.tsx" && spec === "./theme") continue;
      if (spec.startsWith(".")) {
        const next = resolveFile(pkgRoot2, file, spec);
        if (next) visit(next);
      } else if (!spec.startsWith("node:")) {
        packages.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
      }
    }
  };
  entries.forEach(visit);
  return { files, packages: [...packages].sort() };
}
function hasDependency(cwd, name) {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  } catch {
    return false;
  }
}

// cli/update.ts
import { spawnSync } from "node:child_process";
import { existsSync as existsSync2, mkdirSync, mkdtempSync, readFileSync as readFileSync2, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname as dirname2, join as join2, relative, resolve } from "node:path";
var MANIFEST = "parabola.json";
var DEFAULT_SOURCE = "https://github.com/alexbeltechi/parabola.git";
function readManifest(cwd) {
  const path = join2(cwd, MANIFEST);
  if (!existsSync2(path)) return null;
  const read = JSON.parse(readFileSync2(path, "utf8"));
  if (!read.version || !read.dir || !read.files) throw new Error(`${MANIFEST} needs "version", "dir" and "files".`);
  return { source: DEFAULT_SOURCE, ...read };
}
function writeManifest(cwd, manifest) {
  const { source, version, commit, dir, files, exclude } = manifest;
  const ordered = { source, version, ...commit ? { commit } : {}, dir, files, ...exclude ? { exclude } : {} };
  writeFileSync(join2(cwd, MANIFEST), `${JSON.stringify(ordered, null, 2)}
`);
}
function git(cwd, args) {
  const res = spawnSync("git", args, { cwd, maxBuffer: 256 * 1024 * 1024 });
  if (res.error) throw new Error("This needs git, and it isn't installed here.");
  return { ok: res.status === 0, out: res.stdout, err: res.stderr.toString("utf8").trim(), code: res.status ?? 1 };
}
function commitOf(pkgRoot2) {
  if (!existsSync2(join2(pkgRoot2, ".git"))) return void 0;
  const head = git(pkgRoot2, ["rev-parse", "HEAD"]);
  return head.ok ? head.out.toString("utf8").trim() : void 0;
}
function revParse(clone, ref) {
  const res = git(clone, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  return res.ok ? res.out.toString("utf8").trim() : null;
}
function show(clone, commit, path) {
  const res = git(clone, ["show", `${commit}:${path}`]);
  return res.ok ? res.out : null;
}
function filesAt(clone, commit) {
  return git(clone, ["ls-tree", "-r", "--name-only", commit]).out.toString("utf8").split("\n").filter(Boolean);
}
function versionAt(clone, commit) {
  try {
    return JSON.parse(show(clone, commit, "package.json")?.toString("utf8") ?? "{}").version ?? "?";
  } catch {
    return "?";
  }
}
function excluded(path, exclude = []) {
  return exclude.some((rule2) => rule2.endsWith("/") ? path.startsWith(rule2) : path === rule2);
}
var versionParts = (v) => v.split(".").map((n) => parseInt(n, 10) || 0);
function newer(a, b) {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
}
function changelogBetween(changelog, from, to) {
  const lines = [];
  let keep = false;
  for (const line of changelog.split("\n")) {
    const heading = line.match(/^##\s+v?(\d+\.\d+\.\d+)/);
    if (heading) keep = newer(heading[1], from) && !newer(heading[1], to);
    if (keep && line.trim()) lines.push(line);
  }
  return lines;
}
function merge(yours, base, theirs, labels) {
  const tmp = mkdtempSync(join2(tmpdir(), "parabola-merge-"));
  try {
    const paths = ["yours", "base", "theirs"].map((name) => join2(tmp, name));
    [yours, base, theirs].forEach((body, i) => writeFileSync(paths[i], body));
    const res = spawnSync("git", ["merge-file", "-p", "-L", labels[0], "-L", labels[1], "-L", labels[2], ...paths], {
      maxBuffer: 256 * 1024 * 1024
    });
    if (res.status === null || res.status > 127) throw new Error(`git couldn't merge a file: ${res.stderr.toString("utf8").trim()}`);
    return { body: res.stdout, conflicts: res.status };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
var isBinary = (body) => body.subarray(0, 8e3).includes(0);
function assertClean(cwd, manifest) {
  if (!git(cwd, ["rev-parse", "--is-inside-work-tree"]).ok) return;
  const dirty = git(cwd, ["status", "--porcelain", "--", manifest.dir, MANIFEST]).out.toString("utf8").trim();
  if (dirty) {
    throw new Error(
      `There's uncommitted work in ${manifest.dir}. Commit it first, so the update is easy to undo (or pass --force).`
    );
  }
}
function runUpdate(flags, cwd, io, statusOnly) {
  const manifest = readManifest(cwd);
  if (!manifest) {
    throw new Error(`No ${MANIFEST} here. It's written when Parabola is added to a project (\`add theme\`, \`add button\`).`);
  }
  const dry = statusOnly || flags["dry-run"] === true;
  if (!dry && flags.force !== true) assertClean(cwd, manifest);
  const given = typeof flags.source === "string" ? flags.source : manifest.source;
  const source = existsSync2(resolve(cwd, given)) ? resolve(cwd, given) : given;
  const clone = mkdtempSync(join2(tmpdir(), "parabola-src-"));
  try {
    const cloned = git(cwd, ["clone", "--quiet", source, clone]);
    if (!cloned.ok) throw new Error(`Couldn't fetch Parabola from ${given}.
${cloned.err}`);
    const baseRef = manifest.commit ?? `v${manifest.version}`;
    const base = revParse(clone, baseRef);
    if (!base) throw new Error(`${MANIFEST} says this copy came from ${baseRef}, and Parabola has no such version.`);
    const wanted = typeof flags.to === "string" ? flags.to : void 0;
    const latestTag = git(clone, ["tag", "--list", "v*", "--sort=-v:refname"]).out.toString("utf8").split("\n").filter(Boolean)[0];
    const target = revParse(clone, wanted ?? latestTag ?? "HEAD");
    if (!target) throw new Error(`Parabola has no version called ${wanted}.`);
    const toVersion = versionAt(clone, target);
    const whole = manifest.files === "*";
    let tracked;
    if (manifest.files === "*") {
      tracked = [.../* @__PURE__ */ new Set([...filesAt(clone, base), ...filesAt(clone, target)])].filter((p) => !excluded(p, manifest.exclude));
    } else {
      git(clone, ["checkout", "--quiet", "--detach", target]);
      const still = manifest.files.filter((f) => existsSync2(join2(clone, f)));
      tracked = [.../* @__PURE__ */ new Set([...manifest.files, ...closure(clone, still).files])];
    }
    const prepare = (path, body) => body && !whole ? Buffer.from(transform(path, body.toString("utf8"))) : body;
    const dir = resolve(cwd, manifest.dir);
    const results = [];
    const nextFiles = [];
    for (const path of tracked.sort()) {
      const was = prepare(path, show(clone, base, path));
      const now = prepare(path, show(clone, target, path));
      const file = join2(dir, path);
      const yours = existsSync2(file) ? readFileSync2(file) : null;
      let outcome;
      let write2;
      if (!now) {
        if (!yours) outcome = "same";
        else if (was && yours.equals(was)) [outcome, write2] = ["removed", null];
        else outcome = "kept-removed";
      } else if (!yours) {
        if (!was) [outcome, write2] = ["added", now];
        else outcome = now.equals(was) ? "same" : "left-out";
      } else if (yours.equals(now)) outcome = "same";
      else if (was && yours.equals(was)) [outcome, write2] = ["updated", now];
      else if (was && now.equals(was)) outcome = "yours";
      else if (isBinary(yours) || isBinary(now)) outcome = "conflict";
      else {
        const merged = merge(yours, was ?? Buffer.alloc(0), now, ["yours", `Parabola ${manifest.version}`, `Parabola ${toVersion}`]);
        [outcome, write2] = [merged.conflicts ? "conflict" : "merged", merged.body];
      }
      results.push({ path, outcome });
      if (now ? yours || write2 : outcome === "kept-removed") nextFiles.push(path);
      if (dry || write2 === void 0) continue;
      if (write2 === null) rmSync(file);
      else {
        mkdirSync(dirname2(file), { recursive: true });
        writeFileSync(file, write2);
      }
    }
    const of = (outcome) => results.filter((r) => r.outcome === outcome).map((r) => r.path);
    const rel = (path) => relative(cwd, join2(dir, path)).split("\\").join("/");
    const upToDate = base === target;
    if (statusOnly) {
      io.log(`This project is on Parabola ${manifest.version}.${upToDate ? " That's the latest." : ` The latest is ${toVersion}.`}`);
      const changed = of("yours").length + of("merged").length + of("conflict").length + of("kept-removed").length;
      if (upToDate) {
        const yours = results.filter((r) => r.outcome !== "same").map((r) => r.path);
        io.log(yours.length ? `Changed here (${yours.length}):
${yours.map((p) => `  ${rel(p)}`).join("\n")}` : "Nothing here differs from it.");
        return 0;
      }
      io.log(`  ${of("updated").length + of("added").length + of("removed").length} files would update cleanly`);
      io.log(`  ${changed} files you changed${of("conflict").length ? `, ${of("conflict").length} of them clash with Parabola's changes` : ""}`);
    } else {
      if (upToDate && results.every((r) => r.outcome === "same" || r.outcome === "yours")) {
        io.log(`Already on Parabola ${manifest.version}, the latest.`);
        return 0;
      }
      io.log(`${dry ? "Would update" : "Updating"} Parabola ${manifest.version} \u2192 ${toVersion}:`);
      const say = [
        ["updated", "updated ", ""],
        ["added", "added   ", ""],
        ["removed", "removed ", ""],
        ["merged", "merged  ", " (your changes and Parabola's)"],
        ["conflict", "CONFLICT", " (both changed the same lines)"],
        ["kept-removed", "kept    ", " (Parabola removed it; you had changed it)"],
        ["left-out", "left out", " (you removed it; Parabola changed it)"]
      ];
      for (const [outcome, label, note] of say) for (const path of of(outcome)) io.log(`  ${label}  ${rel(path)}${note}`);
      if (of("yours").length) io.log(`  ${of("yours").length} files you changed stay as they are.`);
    }
    const news = changelogBetween(show(clone, target, "CHANGELOG.md")?.toString("utf8") ?? "", manifest.version, toVersion);
    if (news.length) io.log(`
What's new:
${news.map((l) => `  ${l}`).join("\n")}`);
    if (dry) {
      if (!upToDate) io.log(`
Nothing was changed. Run \`update\` to take it.`);
      return 0;
    }
    writeManifest(cwd, { ...manifest, version: toVersion, commit: target, files: whole ? "*" : nextFiles.sort() });
    if (!whole) {
      const missing = closure(dir, nextFiles.filter((f) => existsSync2(join2(dir, f)))).packages.filter((p) => !hasDependency(cwd, p));
      if (missing.length) io.log(`
Install what they need:
  npm install ${missing.join(" ")}`);
    }
    const conflicts = of("conflict");
    if (conflicts.length) {
      io.log(
        `
${conflicts.length} ${conflicts.length === 1 ? "file needs" : "files need"} you: open ${conflicts.length === 1 ? "it" : "each"}, find <<<<<<<, keep what you want and delete the markers.`
      );
    }
    io.log(`
${MANIFEST} now says ${toVersion}. To undo all of it: git checkout -- ${manifest.dir} ${MANIFEST}`);
    return conflicts.length ? 1 : 0;
  } finally {
    rmSync(clone, { recursive: true, force: true });
  }
}

// cli/core.ts
var USAGE = `Parabola: copy a design system into your project.

  add theme [--from parabola-theme.json | --code <theme>] [--name <name>]
  add <component> [<component>\u2026]      (button, pill, field\u2026)
  list                                the components you can add

Options
  --dir <folder>      where to put it (default: parabola/, or src/parabola/ in a project with src/)
  --css <file>        the stylesheet to import the theme from (default: the project's globals.css)
  --overwrite         replace files that already exist
  --code <theme>      the theme pasted: Parabola code (JSON) or the same as base64
`;
var VALUE_FLAGS = ["from", "code", "name", "dir", "css", "to", "source"];
function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split(/=([\s\S]*)/);
    if (!VALUE_FLAGS.includes(key)) flags[key] = true;
    else if (inline !== void 0) flags[key] = inline;
    else if (argv[i + 1] !== void 0) flags[key] = argv[++i];
    else throw new Error(`--${key} needs a value.`);
  }
  return { positional, flags };
}
function themeFromText(text) {
  const trimmed = text.trim();
  const direct = dsThemeFromPaste(trimmed);
  if (direct) return direct;
  if (/^[A-Za-z0-9+/=_-]+$/.test(trimmed)) {
    try {
      return dsThemeFromPaste(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }
  return null;
}
function listComponents(pkgRoot2) {
  return ["primitives", "components"].flatMap((folder) => {
    const dir = join3(pkgRoot2, folder);
    if (!existsSync3(dir)) return [];
    return readdirSync(dir).filter((f) => /\.tsx$/.test(f)).map((f) => f.replace(/\.tsx$/, ""));
  });
}
function resolveComponent(pkgRoot2, name) {
  const entry = ["primitives", "components"].map((f) => `${f}/${name}.tsx`).find((p) => existsSync3(join3(pkgRoot2, p)));
  if (!entry) throw new Error(`No component called "${name}". Run \`list\` to see them.`);
  return closure(pkgRoot2, [entry]);
}
function write(path, body, overwrite, cwd, io) {
  if (existsSync3(path) && !overwrite) {
    io.log(`  skipped  ${relative2(cwd, path)} (exists; --overwrite replaces it)`);
    return false;
  }
  mkdirSync2(dirname3(path), { recursive: true });
  writeFileSync2(path, body);
  io.log(`  wrote    ${relative2(cwd, path)}`);
  return true;
}
function defaultDir(cwd) {
  return readManifest(cwd)?.dir ?? (existsSync3(join3(cwd, "src")) ? "src/parabola" : "parabola");
}
function sourceOf(pkgRoot2) {
  try {
    const repo = JSON.parse(readFileSync3(join3(pkgRoot2, "package.json"), "utf8")).repository;
    return repo?.url?.replace(/^git\+/, "") || DEFAULT_SOURCE;
  } catch {
    return DEFAULT_SOURCE;
  }
}
function versionOf(pkgRoot2) {
  return JSON.parse(readFileSync3(join3(pkgRoot2, "package.json"), "utf8")).version;
}
function assertSameVersion(cwd, pkgRoot2) {
  const manifest = readManifest(cwd);
  if (!manifest) return;
  const commit = commitOf(pkgRoot2);
  const same = manifest.commit && commit ? manifest.commit === commit : manifest.version === versionOf(pkgRoot2);
  if (!same) {
    throw new Error(`This project is on Parabola ${manifest.version} and this command is ${versionOf(pkgRoot2)}. Run \`update\` first, then add.`);
  }
}
function record(cwd, pkgRoot2, dir, files) {
  const existing = readManifest(cwd);
  if (existing?.files === "*") return;
  const commit = commitOf(pkgRoot2);
  const manifest = {
    source: existing?.source ?? sourceOf(pkgRoot2),
    version: versionOf(pkgRoot2),
    ...commit ? { commit } : {},
    dir: relative2(cwd, dir).split("\\").join("/") || ".",
    files: [.../* @__PURE__ */ new Set([...existing?.files ?? [], ...files])].filter((f) => existsSync3(join3(dir, f))).sort()
  };
  writeManifest(cwd, manifest);
}
var STYLESHEETS = ["src/app/globals.css", "app/globals.css", "src/styles/globals.css", "styles/globals.css", "src/index.css", "src/globals.css"];
var FONTS_MARK = "/* parabola:fonts */";
var FONTS_IMPORT = /\/\* parabola:fonts \*\/\n@import url\([^\n]*\n+/;
function importInto(css, cwd, dir, fonts, io) {
  let source = readFileSync3(css, "utf8");
  const fontsLine = fonts ? `${FONTS_MARK}
@import url("${fonts}");
` : "";
  if (!fontsLine ? FONTS_IMPORT.test(source) : !source.includes(fontsLine)) {
    source = fontsLine + source.replace(FONTS_IMPORT, "");
    writeFileSync2(css, source);
    if (fonts) io.log(`  updated  ${relative2(cwd, css)} (the theme's fonts, first line)`);
  }
  const rel = (file) => {
    const path = relative2(dirname3(css), join3(dir, file)).split("\\").join("/");
    return path.startsWith(".") ? path : `./${path}`;
  };
  const lines = [`@import "${rel("tokens.css")}";`, `@import "${rel("theme.css")}";`].filter((line) => !source.includes(line));
  if (!lines.length) return io.log(`  kept     ${relative2(cwd, css)} (already imports them)`);
  const tailwind = source.match(/^@import\s+["']tailwindcss["'][^;]*;[ \t]*$/m);
  if (!tailwind) {
    io.log(`  Add these to ${relative2(cwd, css)}, after Tailwind's import:
    ${lines.join("\n    ")}`);
    return;
  }
  const at = (tailwind.index ?? 0) + tailwind[0].length;
  writeFileSync2(css, `${source.slice(0, at)}
${lines.join("\n")}${source.slice(at)}`);
  io.log(`  updated  ${relative2(cwd, css)} (imports tokens.css and theme.css)`);
}
function addTheme(opts, pkgRoot2, cwd, io) {
  const { flags } = opts;
  let theme = DS_DEFAULT_THEME;
  if (typeof flags.from === "string") {
    const file = resolve2(cwd, flags.from);
    if (!existsSync3(file)) throw new Error(`No file at ${flags.from}. Download the brand kit from /parabola/theme (Share) and use its parabola-theme.json.`);
    const read = themeFromText(readFileSync3(file, "utf8"));
    if (!read) throw new Error(`${flags.from} isn't a Parabola theme (expected parabola-theme.json from the brand kit).`);
    theme = read;
  } else if (typeof flags.code === "string") {
    const read = themeFromText(flags.code);
    if (!read) throw new Error("That isn't Parabola code. Copy the command again from /parabola/theme.");
    theme = read;
  } else {
    io.log("No --from or --code given: using Parabola's own theme.");
  }
  const name = typeof flags.name === "string" ? flags.name : "Parabola";
  const overwrite = flags.overwrite === true;
  const dir = resolve2(cwd, typeof flags.dir === "string" ? flags.dir : defaultDir(cwd));
  const kit = dsBrandKit(theme, name);
  assertSameVersion(cwd, pkgRoot2);
  io.log("Adding the theme:");
  write(join3(dir, "tokens.css"), readFileSync3(join3(pkgRoot2, "tokens.css"), "utf8"), overwrite, cwd, io);
  record(cwd, pkgRoot2, dir, ["tokens.css"]);
  const fonts = kit.theme.typography.googleFonts;
  write(join3(dir, "theme.css"), kit.css.replace(/^@import url\([^\n]*\n+/, ""), true, cwd, io);
  write(join3(dir, "parabola-theme.json"), `${JSON.stringify(kit.theme, null, 2)}
`, true, cwd, io);
  const css = typeof flags.css === "string" ? resolve2(cwd, flags.css) : STYLESHEETS.map((p) => join3(cwd, p)).find(existsSync3);
  if (css && existsSync3(css)) importInto(css, cwd, dir, fonts, io);
  else io.log(`  No stylesheet found. First line of yours: ${fonts ? `@import url("${fonts}");` : "(no web fonts)"}. After Tailwind's import, add:
    @import "${relative2(cwd, join3(dir, "tokens.css")).split("\\").join("/")}";
    @import "${relative2(cwd, join3(dir, "theme.css")).split("\\").join("/")}";
  (paths relative to that stylesheet)`);
  return 0;
}
function addComponents(names, opts, pkgRoot2, cwd, io) {
  const overwrite = opts.flags.overwrite === true;
  const dir = resolve2(cwd, typeof opts.flags.dir === "string" ? opts.flags.dir : defaultDir(cwd));
  const packages = /* @__PURE__ */ new Set();
  const copied = [];
  assertSameVersion(cwd, pkgRoot2);
  for (const name of names) {
    const found = resolveComponent(pkgRoot2, name);
    copied.push(...found.files);
    io.log(`Adding ${name}:`);
    for (const file of found.files) {
      write(join3(dir, file), transform(file, readFileSync3(join3(pkgRoot2, file), "utf8")), overwrite, cwd, io);
    }
    found.packages.forEach((p) => packages.add(p));
    const entry = relative2(cwd, join3(dir, found.files[0])).replace(/\.tsx$/, "").split("\\").join("/");
    io.log(`  import from "${entry}" (your path alias may shorten it)`);
  }
  record(cwd, pkgRoot2, dir, copied);
  const missing = [...packages].filter((p) => !hasDependency(cwd, p));
  if (missing.length) io.log(`
Install what they need:
  npm install ${missing.join(" ")}`);
  io.log("\nThey draw from the theme's tokens: run `add theme` too if you haven't.");
  return 0;
}
function run(argv, cwd, pkgRoot2, io) {
  try {
    const opts = parseArgs(argv);
    const [command, ...rest] = opts.positional;
    if (!command || opts.flags.help) {
      io.log(USAGE);
      return command || opts.flags.help ? 0 : 1;
    }
    if (command === "list") {
      io.log(listComponents(pkgRoot2).join("\n"));
      return 0;
    }
    if (command === "update" || command === "status") return runUpdate(opts.flags, cwd, io, command === "status");
    if (command !== "add") throw new Error(`Unknown command "${command}".

${USAGE}`);
    if (!rest.length) throw new Error("Add what? `add theme`, or a component such as `add button`.");
    if (rest[0] === "theme") {
      const code = addTheme(opts, pkgRoot2, cwd, io);
      return rest.length > 1 ? addComponents(rest.slice(1), opts, pkgRoot2, cwd, io) : code;
    }
    return addComponents(rest, opts, pkgRoot2, cwd, io);
  } catch (e) {
    io.error(e instanceof Error ? e.message : String(e));
    return 1;
  }
}

// cli/main.ts
var pkgRoot = join4(dirname4(fileURLToPath(import.meta.url)), "..");
process.exitCode = run(process.argv.slice(2), process.cwd(), pkgRoot, {
  log: (line) => console.log(line),
  error: (line) => console.error(line)
});
