/**
 * A theme as a link: parabolasystem.com opens it as a new theme of its own,
 * in the Theme row, named as the file names it. This is how an agent hands a
 * theme it made to a person: write a theme file (theme-file.ts, the contract
 * says what it may set), make its link, and send it or open it in a browser.
 *
 *   https://parabolasystem.com/parabola/theme#theme=<the file, base64url>
 *
 * The theme rides in the part after #, which never reaches a server, and the
 * page takes it out of the address once it's opened. The command makes one
 * too: `npx github:alexbeltechi/parabola link firetalk.theme.json`.
 */
import { dsThemeFileParse, type DsThemeFileResult } from "./theme-file";

/** Where theme links open. */
export const DS_THEME_LINK_HOME = "https://parabolasystem.com";
/** The page they open on. */
export const DS_THEME_LINK_PATH = "/parabola/theme";
const KEY = "theme";

function toBase64Url(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

/**
 * The link that opens a theme file (its text, or the value parsed) on
 * parabolasystem.com, or on `home` (another copy of the site, a preview).
 * Throws with what's wrong when the file isn't a theme, so a link never
 * opens to an error.
 */
export function dsThemeLink(file: string | object, home: string = DS_THEME_LINK_HOME): string {
  const value = typeof file === "string" ? (JSON.parse(file) as object) : file;
  const checked = dsThemeFileParse(value);
  if (!checked.ok) throw new Error(`Not a theme file:\n- ${checked.errors.join("\n- ")}`);
  return `${home.replace(/\/+$/, "")}${DS_THEME_LINK_PATH}#${KEY}=${toBase64Url(JSON.stringify(value))}`;
}

/** The theme in an address's # part (`location.hash`), checked as a file is; null when there's none. */
export function dsThemeFromLink(hash: string): DsThemeFileResult | null {
  const code = new URLSearchParams(hash.replace(/^#/, "")).get(KEY);
  if (!code) return null;
  try {
    return dsThemeFileParse(fromBase64Url(code));
  } catch {
    return { ok: false, errors: ["The link is cut short or changed: ask for it again"] };
  }
}
