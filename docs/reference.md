# Parabola: the reference

Everything about how Parabola is built and used, for developers and agents.
The short version is the [README](../README.md).

## What belongs here

Parabola is organised in tiers, each built only from the ones above it. Each
tier has its own folder and its own section on `/parabola`.

| Tier | Folder | What it is | Examples |
| --- | --- | --- | --- |
| **Foundations** | root | Tokens: colours, type scale, spacing, corners, elevation, focus, z-index | `tokens.css`, `accents.ts`, `spacing.ts` |
| **Primitives** | `primitives/` | Single building blocks that decide how something looks and behaves, even when one screen uses them today | button, field, select, pill, list row, dialog |
| **Components** | `components/` | Primitives composed into a reusable piece with one job | colour picker, media tile, prompt box, subscribe |
| **Blocks** | `blocks/` | Full-width page sections that the page builder (or an agent) arranges into pages | newsletter |

Not here: anything that arranges pieces for one screen of an app (a list of
posts, a page's pinned header and filter row, a settings dialog). Those live
with their page. When two screens need the same arrangement *and* must stay
identical, promote it to a component then, not before.

## Installing

Parabola is a package, `@beltechi/parabola`, released from this repo by
version tag (see [Releasing a version](#releasing-a-version)). It isn't on
npm yet: install it from GitHub and pin a tag. Never copy the folder by hand
(to copy pieces into a project, use `add`, below). Nothing checks for a
newer version at run time: upgrading is a `package.json` change.

```sh
npm install github:alexbeltechi/parabola#v0.6.0
```

Code imports it as `@beltechi/parabola` either way.

It needs React 19, Tailwind CSS v4, Radix UI, lucide-react, sonner,
class-variance-authority, clsx and tailwind-merge as peers (npm installs the
ones you don't have). Then, in the app:

1. Import the tokens once, after Tailwind, and point Tailwind at the package
   so its classes are generated (node_modules is skipped by default):

   ```css
   @import "tailwindcss";
   @import "@beltechi/parabola/tokens.css";
   @source "../node_modules/@beltechi/parabola";
   ```

   The `@source` path is relative to the CSS file: from `src/app/globals.css`
   it's `"../../node_modules/@beltechi/parabola"`.

2. Wrap the app in `DsProvider`, where it plugs in its framework:

   ```tsx
   <DsProvider link={Link} onThemeChange={setTheme}>   {/* next/link, next-themes */}
   ```

   Without it Parabola renders plain `<a>` links and its theme toggle flips
   the `dark` class on `<html>` (not remembered across visits).

3. The package ships TypeScript source, not a build, so tell the bundler to
   compile it. In Next: `transpilePackages: ["@beltechi/parabola"]` in
   `next.config.ts`. There's no compiled build yet.

4. Apply the theme on the site's pages with `DsThemeStyle` (see
   [Themes](#themes)). Without it you get the tokens' built-in look, not
   Classic.

`site/` in this repo is the app behind
[parabolasystem.com](https://parabolasystem.com). It uses the source in
this repo directly rather than installing the package, so it skips steps 1
and 3.

## Self-contained

The package depends on nothing in an app and on no framework: no `@/…`
imports, nothing from the app that uses it.

- `tokens.css`: tokens, the dark variant and the `ds-*` utilities. An app
  imports it once, after Tailwind (see `site/app/globals.css`).
- `cn.ts`: the class-name helper, taught Parabola's custom classes.
- `provider.tsx`: `DsProvider` (above). `site/app/providers.tsx` sets it up
  for Next.

### Add-ons

Heavier pieces live outside the core barrel, each with its own import path,
so apps that don't use them never load their dependencies. Their packages
are optional peers:

| Add-on | Import | Needs |
| --- | --- | --- |
| Rich text | `@beltechi/parabola/primitives/rich-text` (`DsRichText`) | Tiptap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-table`) |

Tiptap is used as-is from npm (MIT), not forked: Parabola owns only the
wrapper (its menu, buttons and prose styles).

### The showcase

`showcase/` is the `/parabola` site: the registry of pages, the specimens and
the shell around them. It ships in the package so the package documents
itself: a consumer can mount it to see the exact version it installed, and
every component's specimen lives next to the component it shows (the
component contract asks for one). It is not part of the design system: never
import it from app code, and nothing in the core imports
it. It is the one place that touches a framework (`next/navigation`, for the
shell's current path), so `next` is an optional peer, needed only when the
showcase is mounted. Parabola's own site mounts it from `site/app/parabola`
(and so does Darmio, from `src/app/parabola`).

## Naming

"Parabola" is the brand: the folder, the URL, the docs. `ds` is its code
namespace, short and brand-free, so a rename never touches code:

| What | Pattern | Example |
| --- | --- | --- |
| Components | `Ds*` | `DsButton`, `DsListRow` |
| Class constants | `DS_*_CLASS` | `DS_FIELD_BOX_CLASS`, `DS_COLUMNS_CLASS` |
| CSS tokens | `--ds-*` | `--ds-surface`, `--ds-accent-red` |
| Tailwind utilities | `*-ds-*` | `bg-ds-surface`, `text-ds-fg-muted`, `rounded-ds-lg` |
| CSS utilities | `ds-*` | `ds-focus`, `ds-hover`, `ds-nav-fade` |

## Themes

A theme is data (`theme.ts`), much as shadcn's create page sets a style. Make
one on `/parabola/theme` (parabolasystem.com): a board that shows the site,
a letter, an app, an Instagram carousel and a reel side by side, with the
controls in a panel on the right. The panel's sections are Theme, Colour,
Typography, Buttons, Fields, Navigation, Social and Icons; each has its own
dice and Restore, and Restore all (any ⋮ menu) puts everything back.

- **Theme**: one rail. The styles first (`DS_TASTES` filtered in
  `showcase/theme-look.ts`: Classic, Minimal, Elegant, Tech, Natural), each
  a whole look (a palette, a kind of type and a kind of button, from
  `taste.ts`); then the themes you kept; then Custom, shown only while
  something has changed (+ keeps it, Delete puts the style back). Every chip
  has a ⋮ to rename, duplicate or delete it. Parabola's own is Classic.
- **Character** (`character.ts`, `DsCharacter`): the dials every Auto value
  is worked out from: a base colour, hue, saturation, brightness, contrast,
  roundness and depth. A value given its own (a colour, `radius`, `buttons`)
  stays when a dial moves; `null` means Auto. `dsThemeRadius`,
  `dsThemeButtons` and `dsThemeColourTokens` resolve a theme. An agent sets
  a look by moving dials.
- **Palettes, kinds of type, kinds of button** (`taste.ts`): `DS_PALETTES`
  (Paper, Black and white, Earthy, Pastel, Neon), `DS_TYPE_STYLES` (Classic,
  Swiss, Elegant, Humanist, Funky, Quirky, Retro, Futurist) and
  `DS_BUTTON_LOOKS` (Product, Soft, Sharp, Outline, Text, Tactile, Chunky),
  the chips on the Colour, Typography and Buttons rails.
- **Colours** (`colours.ts`, `DsThemeColours`), seven, named for what they
  colour: Background (`theme`), Text primary (`text`, the text and borders),
  Text secondary (`muted`, the quieter text), Primary (`accent`: the main
  button, calls to action, selected states, the highlight), Secondary
  (`buttonSecondary`: the quiet buttons and pills), Field (`field`) and
  Surface (`surface`, cards and panels). Each is Parabola's own (`null`) or
  a hex, picked for light; in dark it's based on the light one unless a dark
  colour is picked for it (`dsCounterpart`, `dsInkCounterpart`). A colour
  based on another can be shifted lighter or darker (`lightShift`,
  `darkShift`). `dsColourTokens` turns them into every colour token;
  `DsColourWheel`, `DsColourPicker`, `DsColourBar` and `DsColourField` are
  the pickers.
- **Font families** (`families`): Font (text, always there) and Heading
  (headlines) to start, and any the theme adds, each a name and a font.
- **Fonts**: Parabola's (`DS_FONTS` in `fonts.ts`: Geist Sans,
  Geist Serif, System), less any the theme took out (`hiddenFonts`;
  never System), plus Google fonts it added (`customFonts`, from a name or a
  link: `dsCustomFontFromInput`). Each font lists its weights.
- **The type scale**: for each text style (`DS_TEXT_STYLES`) its name,
  family, weight, size and line height. By default Display to H2 are in
  Heading (Geist Serif, Regular) and the rest, H3 included, in Font
  (Geist Sans, Medium).
- **Buttons** (`button-style.ts`): the solid buttons' fill, solid or a
  gradient of the button colour (contrast -1 to 1, 0 flat, above it the
  top lighter), an inset outline (1 to 8px, with an opacity; off by default), a label text shadow cast from a
  light's angle (`DsAngleDial`; never on the icons), each `none` until on
  (`--ds-button-image`, `--ds-button-ring`, `--ds-button-text-shadow`); and
  their roundness, the radius below, with the pills the same or their own
  (`pillRadius`, `--ds-radius-chip`, `rounded-ds-chip`). Fields have their
  own outline (`fields`: on, 2px, solid by default; `--ds-field-border-width`;
  an invalid field's red outline, `DS_FIELD_INVALID_CLASS`, is always 2px).
- **Navigation** (`nav-style.ts`, `theme.nav`): its style (`DS_NAV_STYLES`),
  Floating (`DsFloatingBar`, the default: buttons over the page, the title
  in the middle as a button, a soft fade behind) or Bar (`DsTopBar`); and the
  bar's background (`surface`, `DS_NAV_SURFACES`): None, Blur (the nav fade,
  the default) or Solid (the page colour alone, hiding what scrolls under
  it). A site passes it to its `DsTopBar` as `surface`.
- **Radius** (`radius.ts`): None, Small (2px), Medium, Large (the default) or a
  custom number of pixels (the cards' and pills' corner, the rest scaled),
  for every corner (`rounded-ds-sm` … `rounded-ds-lg`) and the pill
  (`rounded-ds-pill`: buttons, nav items, tooltips), which is fully round
  only at Large. Switches, radios, progress bars and avatars stay round.
- **Icons**: Lucide.
- **Social** (`social.ts`): post size (3:4, 1:1, 4:3), edge, text on
  pictures (Monochrome or Two-tone), corners, fonts, alignment and a
  signature, drawn as the board's carousel and reel and exported with the
  rest.

Themes are kept in a **library** (`DsThemeLibrary`): Classic (the default)
and any added, one of them in use. A style's weight snaps to the nearest one its family's
font has (`dsNearestWeight`). The tokens a theme sets are `--ds-*` variables
(`--ds-bg`… `--ds-highlight`, `--ds-family-<id>`, `--ds-font-<style>`,
`--ds-text-<style>`, `--ds-text-<style>-leading`, `--ds-weight-<style>`,
`--ds-radius-<sm|control|md|lg|pill>`), light
on `:root` and dark on `.dark`, so a theme changes them at run time. Make
themes on `/parabola`: Theme (the board, above) and Typography (Font
families, Type scale), with Undo, Redo, Export and Publish top right on
every page. An app applies the theme in use once, on its website's
pages (not its admin, which stays in Parabola's own), or on part of a page
with `scope` (`DS_THEME_SCOPE`, as /parabola's canvas does):

```tsx
<DsThemeStyle theme={dsActiveTheme(library).theme} />                          {/* loads its fonts */}
<DsThemeStyle theme={…} hosted={["geist", "geist-serif", "system"]} />             {/* the app hosts these */}
<DsThemeStyle theme={…} scope={DS_THEME_SCOPE} />                              {/* only <div className="ds-theme"> */}
```

An app that hosts Parabola's fonts (the site does, with next/font) sets
`--ds-font-<id>` to its family names; each stack tries it first. Pass the
library and a saver to `DsProvider` (`themeLibrary`, `onThemeLibraryChange`)
and `/parabola` publishes too.

## Sharing a theme

**Export**, top right of every `/parabola` page, hands the open theme over
as a **brand kit** (`brand-kit.ts`), one source with several ways out.
Nothing goes anywhere on its own; the maker puts it where they work.

- **The style in words** (`kit.style`), first in the dialog with one button
  to copy it: the look in a sentence, the colours, fonts, sizes and shapes,
  and how to use them, to paste at the end of any prompt ("make a website,
  in this style"). It says what holds and what's open, Parabola's "fixed
  below, free above", and ends "Created with parabolasystem.com". The
  guide below says the same.

- **Brand kit**: a zip (`zip.ts`, no dependency) with `README.md` (the brand
  guide), `tokens.json`, `tokens.css` and `parabola-theme.json`.
- **Design system**: one text (`dsBrandKitPrompt`) for Claude Design or any
  agent to build the design system from: the guide and the tokens, in a
  copy field with Show more. Its hint's "Claude Design" copies it and opens
  Claude. `tokens.json` is in the shape Claude's Design System reads: each
  family a list of `{ name, value, usage }`, colours with light and dark.
- **Parabola code**: the theme as `dsThemeExport` writes it, in a textarea
  with copy and Show more on. Paste one in to open it: Parabola code, a
  kit's `tokens.json`, or the whole design-system text back from Claude
  (`dsThemeFromPaste`). The kit's `tokens.json` carries the theme under
  `meta.parabola`, so a design system made from Parabola comes back exactly.
  One made elsewhere is refused: turning it into a theme is an agent's job.

Every value in the kit comes from the theme (colours, fonts, type styles,
spacing, corners, buttons, the voice from `dsTasteVoice`); the guide adds
only the rules for using them.

Copy inside a field is one button, `DsCopyButton`: DsCopyField always has
it, a DsTextarea takes it with `copyable`. In a copy field over several
lines it keeps a column of its own on the right, beside the first line, so
the text never runs under it. In a textarea it floats in the top right
corner on the default button's grey. Both take `collapsible` (`show-more.tsx`): six lines fading out and
Show more, then the whole text in the page. Never a scroll inside a scroll:
it's hard to work on a phone.

### Copying it with a command

One more way out, besides the style, the kit and the design-system text: a command, as
shadcn's `add`, that copies Parabola into a project so the maker owns the
files (`cli/`, bundled to `bin/parabola.mjs` by `npm run bundle`; the bundle
is committed, so the command runs straight from this repo). Run it in the
project's folder:

```sh
npx github:alexbeltechi/parabola add theme --from parabola-theme.json   # the kit's theme file
npx github:alexbeltechi/parabola add theme --code <theme>               # pasted: Parabola code, or base64 of it
npx github:alexbeltechi/parabola add button                             # a component, and the Parabola files it imports
npx github:alexbeltechi/parabola list
```

`add theme` writes `tokens.css` (the `ds-*` utilities), `theme.css` (the
theme's variables, light and dark, and its Google fonts) and
`parabola-theme.json` into `parabola/` (`src/parabola/` where there's a
`src/`; `--dir` changes it) and imports the first two from the project's
`globals.css` under Tailwind's import. `add <component>` copies the component
and what it imports in the folders it has here, so its imports hold, and
prints the npm packages to install. Export (top right on
`/parabola`) shows the command for the open theme. Nothing is fetched or published by it.

Every `add` notes what it copied in `parabola.json` at the project's root:
where Parabola came from, its version and commit, the folder, the files.

### Taking a newer Parabola

A project owns its copy, and nothing changes in it until someone asks:

```sh
npx github:alexbeltechi/parabola status             # which Parabola this project is on; what a newer one would change
npx github:alexbeltechi/parabola update --dry-run   # the same, file by file, writing nothing
npx github:alexbeltechi/parabola update             # take the latest version (--to v0.3.0 for another)
```

`update` (`cli/update.ts`) looks at each file three ways: as it was when
copied (from `parabola.json`'s commit), as the project has it, and as
Parabola has it now. A file the project never touched takes Parabola's. A
file only the project changed stays. Where both changed it the two are
merged as git would, and lines both sides changed get git's conflict markers
(`<<<<<<< yours`) for a person or their agent to settle. It prints the
changelog between the two versions, and it won't run over uncommitted work,
so `git checkout` undoes it. (Copier's `update` works the same way for project
templates.)

A project that carries the whole package rather than a few components (as
Darmio, the CMS built on Parabola, does in `packages/parabola`) says `"files": "*"` in `parabola.json`,
with `exclude` for what it doesn't want (`bin/`, `scripts/`, `test/`).

A change made in a project's copy stays that project's. To give it to every
project, open a pull request here with it; the others get it the next time
they update.

### Releasing a version

Change things here and add an entry under `## Unreleased` in `CHANGELOG.md`
in plain words (say which files a project is likely to have edited). To
release: raise `version` in `package.json`, turn `## Unreleased` into
`## <version> — <date>` (a new empty `## Unreleased` above it), `npm run
bundle`, `npm test`, `npm run check`, and merge to `main`. The tag
`v<version>` is made for you when it lands
(`.github/workflows/tag-release.yml`), so a release can't miss its tag.
`update` takes the newest tag, so a project gets the release with plain
`update`; work merged without a version stays on `main` until the next
release. Nothing happens in any project until it runs `update`.

Publishing a GitHub release for the tag puts that version on npm
(`.github/workflows/publish.yml`; it needs the repo's `NPM_TOKEN` secret).
parabolasystem.com rebuilds from `main` on every push, so the site always
shows the latest Parabola.

## Using it

```tsx
import { DsButton, DsField, DsInput } from "@beltechi/parabola";
```

Everything in the core comes from that barrel. Add-ons come from their own
path (see above), and so do blocks (`@beltechi/parabola/blocks`). Those are
the package's only entry points, besides `tokens.css` and the showcase's
`showcase/ds-shell` and `showcase/registry`; a component's own file isn't
importable from outside.

Fields have one width, `--ds-field-width` (320px from 1024px wide, the
full width below): a `DsField`, or a control on its own (input, select,
date picker, search, textarea, multi-select), is that wide wherever it's
dropped, and a control inside a
`DsField` fills the field. Lay a form out with `DS_FIELDS_CLASS`: fields
one under the other, left-aligned, never side by side and never stretched. Opt out deliberately:

- `className="w-full"` on the `DsField` (or a control on its own) for one
  that fills its row: long text, a list of files, a toolbar's search bar.
- `ds-fields-fill` on a container one field wide, so fields fill it.
  `DsDialog` and `DsSidePanel` already do.

Don't size fields with `max-w-[…]` per screen. See `/parabola/fields/form`.

A switch sits right after its label (`gap-ds-8`), never pushed to the far
edge of the row. Rows in a nav are 4px apart (`ds-4`).

Colours come from tokens only. No raw Tailwind palette (`bg-zinc-100`,
`text-emerald-600`) and no hex values in components. Content that carries a
colour (a category) stores the **accent's name** (`"red"`), never its value, so
changing an accent reaches everything that wears it.

A project can enforce this with a lint rule that flags raw palette classes
(Darmio, the CMS built on Parabola, does).

## The component contract

Every Parabola component:

1. **Passes through what it doesn't use.** `className`, `ref`, `id`, `aria-*`,
   `data-*` and event handlers reach the root element, or, for field-shaped
   controls, the element that takes focus (`DsControlProps` in `field.tsx`).
   A control that drops `aria-label` can't be named outside a `DsField`.
2. **Draws only from tokens**, so both themes work without per-component dark
   styles.
3. **Exposes state as data attributes** (`data-slot`, `data-state`,
   `data-variant`, `data-selected`), so parents can style children without new
   props.
4. **Has a page on `/parabola`** showing its variants and states: one entry in
   `showcase/registry.ts` and a specimen in `showcase/specimens.tsx`.

## The block contract

Blocks follow the component contract, plus:

1. **Props are data.** Every prop can be stored as JSON: strings, media
   references, links and named variants. No functions, children or class
   names. A page is an ordered list of `{ block, props }`, so the page builder
   and an agent can both write it.
2. **Few, deliberate variants.** A block offers a handful of named options
   (a tone, a layout), never free-form styling. Taste lives in the constraints.
3. **The page owns the rhythm.** A block never sets its own outer spacing or
   page width; the page decides both, so any order of blocks stays even.

## Adding things

- **A token**: add it to `:root` (and `.dark` if it differs by theme) in
  `tokens.css`, map it in `@theme inline` if it needs a Tailwind utility, and
  list it in `showcase/colour-roles.ts` (or `accents.ts` for an accent).
  Run `npm run check`: it fails if the showcase or accent list and
  `tokens.css` disagree, or if a themed token isn't shown.
- **A primitive or component**: a file in its tier's folder, a named export in
  `index.ts`, a specimen and a registry entry under its tier. Follow the
  contract above.
- **A block**: a file in `blocks/`, exported from `blocks/index.ts`, with a
  specimen and a registry entry. Follow the block contract.
- **Changing a value**: change it in `tokens.css`, then the matching line in
  `colour-roles.ts` / `accents.ts`; the check tells you if you missed one.
