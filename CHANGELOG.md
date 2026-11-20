# Changelog

What changed in each Parabola, newest first, in plain words. `update` prints
the entries between a project's version and the one it's taking. Say which
files a change touches when a project is likely to have edited them.

## Unreleased

## 0.5.3 — 2026-11-20

- Fixed: the showcase opens with its sidebar and panel shown on every
  visit. Collapsing them lasts while the page does; it was remembered, so a
  page drawn open hid them a moment after loading. The old setting
  (`ds-shell-sides`) is cleared.

## 0.5.2 — 2026-11-20

- Fixed: an empty or untouched theme reads back with its Paper colour chip
  (the check still looked for the white Parabola had before 0.5.0). Tested
  now (`test/theme.test.ts`).
- Fixed: the board's quote is Ilo's, not a real person's.

## 0.5.1 — 2026-11-20

- Fixed: the email preview took a theme it no longer used, which a
  project's lint (no unused arguments) stopped on.

## 0.5.0 — 2026-11-20

The Theme panel as one rail of looks, colours named for what they colour,
and social posts that follow the theme.

**Theme panel**

- Changed: **one Theme rail**. Parabola's styles (Classic, the default,
  then Minimal, Elegant, Tech, Natural), the themes kept, and Custom, which
  shows only while a style's been changed: + or naming it keeps it as a
  theme, Delete puts the style back. The page's title says the look picked.
  `setTheme(theme, into?)` and `addTheme(name, from?)` take a theme to open
  or copy (`showcase/theme-look.ts`).
- New: **custom looks** on the Colour, Typography and Buttons rows: change
  a value a preset set and the row shows Custom; + keeps it as a chip of its
  own (`showcase/custom-looks.ts`).
- New: every chip has its own **⋮** (on the picked one, and on hover):
  Rename, Duplicate, Delete. Right-click opens it too, and a double-click
  renames in place (`DsButton` `onRename`, `renaming`, `onRenameEnd`; the
  field keeps the label's width). A deleted preset is only hidden; deleting
  the picked chip picks its neighbour; the last chip in a row stays.
- Changed: **Restore all** is factory settings, from the panel or the top
  menu: Classic, every preset back under its own name, the kept themes and
  looks taken out (not the theme the website wears), with Undo. A section's
  Restore brings its own presets back.
- Changed: the default theme is **Classic**, its colour the Paper palette
  (`DS_DEFAULT_CHARACTER`: hue 38, colour 0.36, brightness 0.96, contrast
  0.05).

**Colour**

- Changed: the colours are **Text primary** (`text`), **Text secondary**
  (`muted`), **Primary** (`accent`: the main button, calls to action) and
  **Secondary** (`buttonSecondary`: the quiet buttons and pills). Stored
  names unchanged; the exported style says so.
- Changed: the chips Classic and Neutral are **Paper** and **Black and
  white** (ids unchanged).
- Fixed: a text or button colour picked while viewing dark shows in light
  too, moved only as far as it needs to read there (`colours.ts`).

**Typography**

- Changed: the chips are Classic, **Swiss** (was Startup), Elegant,
  **Humanist** (was Friendly: Source Sans 3, Fira Sans, Open Sans, Alegreya
  Sans), Funky, Quirky, Retro, Futurist. Editorial is gone (too near
  Classic). Elegant's sans is Jost; Retro opens on Fraunces. Stored ids
  `startup`, `friendly` and `editorial` read as `swiss`, `humanist` and
  `classic`.

**Social**

- Changed: post sizes are **3:4, 1:1 and 4:3** (1080 × 810). A stored 4:5
  reads as 3:4.
- New: a **Custom** edge, a number in px at 1080 wide (`edgeSize`,
  `dsSocialEdge`, `DS_SOCIAL_EDGE_RANGE`).
- New: **Text colours**, Monochrome (default) or Two-tone: one word or line
  a slide, written `plain *loud*`, in Text secondary (`tone`).
- Changed: text straight on a picture is the light one of the theme's pair:
  the page colour in light, Text primary in dark (was always white).
- Changed: the Social section's choices share their row where they fit and
  scroll sideways where they don't.

**Elsewhere**

- New: the floating nav takes a background too (`DsFloatingBar` `surface`:
  None, Blur or Solid, the theme's `nav.surface`).
- New: `ds-scroll-quiet`, a scroll area whose bar shows only while the
  pointer is over it.
- Changed: the theme toggle hands the page back to the system's mode when
  the pick matches it; `useDsSetTheme` and `onThemeChange` take `"system"`.
- Changed: the email preview's letter is in the theme's colours, and Gmail
  around it goes dark with the preview. The app preview shows its strongest
  line first.
- Fixed: the fields' outline widths are three equal columns; content panned
  under the Theme board's sidebar no longer flickers above it.

## 0.4.0 — 2026-11-20

- Fixed: a theme file carries `composition`, `brief` and `social`, so a theme
  saved to a file reads back whole (they were refused as unknown keys).
  Touches `theme-file.ts`.
- Changed: a showcase group that is one page (Intro, Theme, Board) is at its
  own name, `/parabola/theme`, not `/parabola/theme/fonts`; the old
  addresses redirect there, and a group's own name opens its first page.
  `dsHref` and `findDsPage` (showcase/registry.ts) give the new addresses; a
  project serving the showcase adds the `[group]` route
  (`site/app/parabola/[group]/page.tsx`).
- New: **the floating bar** (`DsFloatingBar`, `DsFloatingTitle`,
  `primitives/floating-bar.tsx`), the newer kind of nav: buttons floating
  over the page, the page's title in the middle as a button of its own,
  back on the left only when there's somewhere to go back to, the options
  on the right; no bar, only a soft fade of the page colour with a very
  faint blur (`ds-nav-float`). The title truncates first on a narrow screen.
  A theme picks its site's nav style (`theme.nav.style`: `floating`, now the
  default, or `bar`, `DsTopBar`); the Background choice is the bar's.
  Touches `nav-style.ts`, `theme-file.ts`, `tokens.css`.
- Changed: the nav fade's blur is gentler (3px, was 6px). Touches `tokens.css`.
- New: `DsTopBar` takes `column`, the page's reading width: the bar runs edge
  to edge, its rows sit in a centred column that wide.
- Changed: the showcase's header is a floating bar. On a phone it's one line,
  the page's name and two buttons: the theme's ⋮ (collapse, undo, redo, save,
  publish, export, restore) and the sections menu, which also holds the way
  back to the website. Touches `showcase/ds-shell.tsx`,
  `showcase/theme-editor.tsx`, `showcase/theme-export.tsx`.
- Exploration: **social**, the style as posts (`social.ts`). A theme now
  carries `social`: the post's shape (3:4, 4:5 or square), the edge line,
  text on pictures (boxed, wrapped a line at a time, plain or with a
  shadow; square or rounded), one font or two, alignment, how many colours a feed may use (two,
  three or five) and how a slide is signed. Type sizes and a reel's safe
  areas are fixed for every style. All of it goes into the exported style.
  Themes stored before read as Parabola's own. Touches `theme.ts`,
  `brand-kit.ts`.
- Exploration: **the Theme page is a board** (`showcase/theme-section.tsx`,
  `showcase/social-preview.tsx`): its preview is laid out on the Board's
  surface (`BoardSurface` in `showcase/board.tsx`) to move around and zoom,
  with the theme's panel beside it. The site on a phone and on a desktop,
  each scrolling inside its frame; a letter; a carousel's five slides and a
  reel's five scenes side by side, drawn by the social rules, with a Social
  section in the panel; the app as one screen on a phone. The story, the
  feed post, the post on X and the Brand part are gone.
- Exploration: **composition**, the part of a style that isn't a value
  (`composition.ts`). A theme now carries `composition` (layout: inline,
  hybrid or full width; alignment; scale; density; structure; labels;
  numbering; how a page opens) and a `brief` (a reference in a sentence
  and its signature moves). Both go into the exported style. Themes stored
  before read as Parabola's own composition. Touches `theme.ts`,
  `brand-kit.ts`.
- Exploration: **the Board** (`showcase/board.tsx`, `/parabola/board/all`):
  the open style on one surface to move around and zoom, as a home page,
  an article and a product page at desktop, laptop and phone, a
  newsletter, and how it shows in search, an AI answer, a shared link and
  social posts. Its panel picks a **starting point**
  (`starting-points.ts`: Parabola, Swiss, Institute, Storefront, Startup,
  Onchain, Studio), holds the brief and sets the composition. `DsCanvas`
  takes `board`.
- New: **outline**, an optional look for every button and pill. `<DsButton outline>` and
  `<DsPill outline>` draw a line with no fill. Buttons take the fields' own line
  (`ds-field-border`, `--ds-field-border-width`, 2px by default), so a row of outline
  buttons sits with selects and inputs; primary takes the button colour, danger and
  destructive take red. A pressed or current outline button fills as before, so in a row
  of outline chips the picked one is solid. Nothing changes for a button or pill without
  the prop. Touches `primitives/button.tsx`, `primitives/pill.tsx`,
  `showcase/specimens.tsx`.
- New: **Footnote** in the rich text tray. Select the words of the note and
  press it: they become `^[the words]`, the note written where it belongs.
  It's plain text, so typing it by hand works too; the site that shows the
  text numbers the notes and lists them at the end. Touches
  `primitives/rich-text.tsx`.
- New: a theme picks **the nav's background**: None, Blur (the default) or
  Solid (`theme.nav.surface`, new `nav-style.ts`), three buttons under
  Navigation on the Theme page. A site passes it to its `DsTopBar` as
  `surface`. Themes stored before read as Blur. Touches `theme.ts`,
  `theme-file.ts`, `showcase/theme-section.tsx`.
- Changed: `DsTopBar`'s solid surface is the page colour alone, without the
  rule under it. A bar that wants the rule adds `border-b border-ds-border`,
  as the showcase's own header does. Touches `primitives/top-bar.tsx`,
  `showcase/ds-shell.tsx`.
- New: **Export**, top right of every showcase page, in place of Share at
  the foot of the theme panel. Its dialog leads with the style in words
  (`dsBrandKit(...).style`) and a Copy style button: the look in a
  sentence, the values, and how to use them, to paste into any agent. The
  brand kit, design system text, commands and Parabola code are folded
  under it. Touches `showcase/theme-section.tsx`, `showcase/ds-shell.tsx`,
  `showcase/theme-editor.tsx`; new `showcase/theme-export.tsx`.
- Changed: the brand guide no longer tells an agent "don't invent". It says
  what holds (colours, fonts, sizes, spacing, corners) and what's open
  (layout, imagery, composition, motion), and its Don'ts line is gone.
  Touches `brand-kit.ts`.
- Fixed: the Theme dice only draws from what the sections below offer. It
  runs each section's own dice (Colour, Typography, Buttons, Fields), so a
  font or colour that isn't among their chips no longer comes up. Touches
  `showcase/theme-section.tsx`.
- Changed: a change on the Theme page goes straight into the open theme,
  Parabola included, instead of opening a copy called Custom. "Save as new
  theme" is gone; New + is how to start another theme, and Restore (it asks
  first) puts the open one back to Parabola's own. `parseDsThemeLibrary` no
  longer turns an edited Parabola into a Custom theme. Touches `theme.ts`,
  `showcase/theme-editor.tsx` and `showcase/theme-section.tsx`.
- New: without an app to save to, the showcase keeps its themes in the
  browser (localStorage), so a refresh keeps them. Nothing leaves the
  browser.
- Changed: the Theme page's Taste section is gone. Its Mood slider and its
  Previous / Shuffle / Next controls go with it; the dice it held now sits
  at the top of Theme, beside the ⋮ menu, with a Restore next to it that
  puts the open theme back to Parabola's look. Colour, Typography, Buttons
  and Fields each get their own dice beside their Restore, which draws that
  part again. Icons has no dice: Lucide is the only library that works.
  Touches `showcase/theme-section.tsx`.
- Changed: on the Theme page the theme dropdown is now a row of names
  (Parabola, then any theme made from it, then New +), with Light and Dark as a second
  row of the same kind. The Style list (Minimal, Elegant, Tech…) is gone
  from Taste; Mood, Shuffle and the dice stay. Touches
  `showcase/theme-section.tsx`.
- Changed: a field's clear button (the X) now stays while the field has
  text, focused or not, so a search can be cleared without clicking back
  into it. Touches `primitives/field.tsx`.
- Changed: with no website to go back to, the showcase's top-left menu is a
  plain Home button. Touches `showcase/ds-shell.tsx`.
- `DsSubscribe` takes `error`, to show a reason under the field from outside.
- Fixed: in dark mode the showcase's canvas no longer flashes white for a
  moment when a page loads. Until light or dark is picked for it, it follows
  the page's own dark mode from the first paint. Touches `theme.ts`,
  `showcase/ds-shell.tsx` and `showcase/theme-editor.tsx`.
- New component: `DsPromptBox`, a chat prompt box up to 700px wide. One
  pill (+ for files, the text, microphone, send) that opens into two rows as
  the text grows: text on top, + bottom left, microphone and send bottom
  right. Enter adds a line and ⌘/Ctrl+Enter sends (`enterSends` for Enter);
  `note` adds a line under it ("AI can make mistakes"). On `/parabola` under
  Components › Input.
- New component: `DsSubscribe`, the email field and button, sending nowhere
  itself (`onSubscribe`). The Newsletter block is now built on it, and bots
  that fill its hidden field no longer reach the endpoint. Touches
  `blocks/newsletter.tsx`.

## 0.3.0 — 2026-11-16

- Parabola has its own website, parabolasystem.com: the showcase, built
  from this repo's latest version and opening on Welcome. The app behind it
  is `site/`, which is also the example of setting Parabola up in Next.
- Ready for npm: publishing a GitHub release puts that version on npm as
  `@beltechi/parabola`. The README's install steps now describe that,
  not the Darmio workspace.
- Theme files are now `"format": "parabola-theme"`. Files that still say
  `"darmio-theme"` keep loading. Touches `theme-file.ts`.
- The showcase's example prompts say "Set up Parabola for me", not Darmio.
  Touches `showcase/specimens.tsx`.
- `DsShell` takes `backHref`: where "Back to website" goes, or `null` to
  leave it out when the showcase is the whole site. Touches
  `showcase/ds-shell.tsx`.
- `npm run check` (the token check that was Darmio's `check:parabola`)
  now lives here.

## 0.2.0 — 2026-11-15

- Parabola has its own repo. A project keeps its own copy and takes a newer
  Parabola when it chooses to.
- New: `update` takes a newer Parabola into a project. Files the project
  never touched update, its own changes are kept, and where both changed the
  same lines the file is marked for a person or their agent to settle.
- New: `status` says which Parabola a project is on and what a newer one
  would change, without writing anything.
- `add` now notes what it copied in `parabola.json`, which is how `update`
  knows what each file started as.

## 0.1.0 — 2026-11-15

- Parabola as it shipped inside Darmio: tokens, primitives, components,
  blocks, themes, the showcase, and `add` for copying a theme or a component
  into a project.
