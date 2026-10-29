# Parabola

The design system for the site and the admin, as a package: `@beltechi/parabola`.
Showcase: `/parabola`.

## What belongs here

Parabola is organised in tiers, each built only from the ones above it. Each
tier has its own folder and its own section on `/parabola`.

| Tier | Folder | What it is | Examples |
| --- | --- | --- | --- |
| **Foundations** | root | Tokens: colours, type scale, spacing, corners, elevation, focus, z-index | `tokens.css`, `accents.ts`, `spacing.ts` |
| **Primitives** | `primitives/` | Single building blocks that decide how something looks and behaves, even when one screen uses them today | button, field, select, pill, list row, dialog |
| **Components** | `components/` | Primitives composed into a reusable piece with one job | testimonial card, step card, marquee |
| **Blocks** | `blocks/` | Full-width page sections that the page builder (or an agent) arranges into pages | hero, service row, process |

Not here: anything that arranges pieces for one screen of the app (the posts
list, a page's pinned header and filter row, the category dialog). Those live
with their page. When two screens need the same arrangement *and* must stay
identical, promote it to a component then, not before.

## Installing

Parabola is an npm package, `@beltechi/parabola`, published by version from
`packages/parabola` in the Darmio workspace. Install it and pin a
version; never copy the folder. Nothing checks for a newer version at run
time: upgrading is a `package.json` change.

```sh
npm install @beltechi/parabola
```

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

2. Wrap the app in `DsProvider`, where it plugs in its framework:

   ```tsx
   <DsProvider link={Link} onThemeChange={setTheme}>   {/* next/link, next-themes */}
   ```

   Without it Parabola renders plain `<a>` links and its theme toggle flips
   the `dark` class on `<html>` (not remembered across visits).

3. The package ships TypeScript source, not a build, so tell the bundler to
   compile it. In Next: `transpilePackages: ["@beltechi/parabola"]` in
   `next.config.ts`. A build step (compiled JS and `.d.ts`) comes when a
   non-Next consumer needs one.

In this workspace the CMS depends on the package as `"*"`, so `npm install`
always links `packages/parabola` into `node_modules`, whatever its version,
and edits show up live. The CMS never fetches Parabola from npm: each CMS
release carries the Parabola in its repo.

## Self-contained

The package depends on nothing in the app and on no framework. ESLint
enforces it: no `@/…` imports inside `packages/parabola`.

- `tokens.css`: tokens, the dark variant and the `ds-*` utilities. The app
  imports it once, after Tailwind (see `src/app/globals.css`).
- `cn.ts`: the class-name helper, taught Parabola's custom classes. The app's
  `@/lib/utils` re-exports it.
- `provider.tsx`: `DsProvider` (above). This app sets it up in
  `src/components/providers/theme-provider.tsx`.

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
import it from app code (ESLint stops you) and nothing in the core imports
it. It is the one place that touches a framework (`next/navigation`, for the
shell's current path), so `next` is an optional peer, needed only when the
showcase is mounted. The CMS mounts it from `src/app/parabola`.

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

A theme is data (`theme.ts`), much as shadcn's create page sets a style:

- **Colours** (`colours.ts`, `DsThemeColours`), six, named for what they
  colour: base (`theme`, the website's background; Parabola's is white,
  its cards a warm off-white #F7F5F2), type: primary (`text`, the text and
  borders; black or white, whichever reads on the base), type: secondary
  (`muted`, the quieter text; the primary type toward the page by
  default), button (`accent`: `ds-button`, `ds-on-button`, selected states
  and the highlight; the primary type's by default), field (`field`, the
  fields' background; the base's by default) and surface (`surface`, cards
  and panels; a shade of the base by default). Each is Parabola's own (null) or a
  hex, picked for light; in dark it's based on the light one unless a dark
  colour is picked for it: the page and cards the same hue, about 87% dark
  (`dsCounterpart`, not a flip), text, buttons and the accent moved just
  far enough to read on it (`dsInkCounterpart`). A
  colour based on another can be shifted lighter or darker (`lightShift`,
  `darkShift`, `dsShift`). `dsColourTokens` turns the six into every
  colour token; `DsColourWheel` shows them all as points on one wheel (hue
  round it, saturation out from the centre, saturation and brightness on
  the arcs; one size, the chosen one filled, the others a thin ring; choose one
  and drag its point, Delete to restore it), and `DsColourPicker` picks a single colour inline, with
  `DsColourBar` its hue and brightness bars.
- **Font families** (`families`): Font (text, always there) and Heading
  (headlines) to start, and any the theme adds, each a name and a font.
- **Fonts**: Parabola's (`DS_FONTS` in `fonts.ts`: Instrument Sans,
  Instrument Serif, System), less any the theme took out (`hiddenFonts`;
  never System), plus Google fonts it added (`customFonts`, from a name or a
  link: `dsCustomFontFromInput`). Each font lists its weights.
- **The type scale**: for each text style (`DS_TEXT_STYLES`) its name,
  family, weight, size and line height. By default Display to H2 are in
  Heading (Instrument Serif, Regular) and the rest, H3 included, in Font
  (Instrument Sans, Medium).
- **Radius** (`radius.ts`): None, Small, Medium, Large (the default) or a
  custom number of pixels (the cards' and pills' corner, the rest scaled),
  for every corner (`rounded-ds-sm` … `rounded-ds-lg`) and the pill
  (`rounded-ds-pill`: buttons, nav items, tooltips), which is fully round
  only at Large. Switches, radios, progress bars and avatars stay round.
- **Icons**: the library, Lucide for now.

Themes are kept in a **library** (`DsThemeLibrary`): Parabola (the default)
and any added, one of them in use. A style's weight snaps to the nearest one its family's
font has (`dsNearestWeight`). The tokens a theme sets are `--ds-*` variables
(`--ds-bg`… `--ds-highlight`, `--ds-family-<id>`, `--ds-font-<style>`,
`--ds-text-<style>`, `--ds-text-<style>-leading`, `--ds-weight-<style>`,
`--ds-radius-<sm|control|md|lg|pill>`), light
on `:root` and dark on `.dark`, so a theme changes them at run time. Make
themes on `/parabola`: Theme (the pieces in one 600px column, and the main
choices in the panel on the right) and Typography (Font families, Type
scale), with Undo, Redo, Publish and a ⋮ menu to restore defaults top right
on every page. An app applies the theme in use once, on its website's
pages (not its admin, which stays in Parabola's own), or on part of a page
with `scope` (`DS_THEME_SCOPE`, as /parabola's canvas does):

```tsx
<DsThemeStyle theme={dsActiveTheme(library).theme} />                          {/* loads its Google fonts */}
<DsThemeStyle theme={…} hosted={["instrument-sans", "instrument-serif", "system"]} />  {/* the app hosts these */}
<DsThemeStyle theme={…} scope={DS_THEME_SCOPE} />                              {/* only <div className="ds-theme"> */}
```

An app that hosts Parabola's fonts (the CMS does, with next/font) sets
`--ds-font-<id>` to its family names; each stack tries it first. Pass the
library and a saver to `DsProvider` (`themeLibrary`, `onThemeLibraryChange`)
and `/parabola` publishes too.

## Using it

```tsx
import { DsButton, DsField, DsInput } from "@beltechi/parabola";
```

Everything in the core comes from that barrel. Add-ons come from their own
path (see above), and so do blocks (`@beltechi/parabola/blocks`). Those are
the package's only entry points, besides `tokens.css` and the showcase's
`showcase/ds-shell` and `showcase/registry`; a component's own file isn't
importable from outside.

Fields have one width, `--ds-field-width` (320px): a `DsField`, or a
control on its own (input, select, date picker, search, textarea,
multi-select), is that wide wherever it's dropped, and a control inside a
`DsField` fills the field. Lay a form out with `DS_FIELDS_CLASS`: fields
left-aligned in a row that wraps, never stretched. Opt out deliberately:

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

ESLint enforces this outside Parabola: raw palette classes are flagged.

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
  Run `npm run check:parabola`: it fails if the showcase or accent list and
  `tokens.css` disagree, or if a themed token isn't shown.
- **A primitive or component**: a file in its tier's folder, a named export in
  `index.ts`, a specimen and a registry entry under its tier. Follow the
  contract above.
- **A block**: a file in `blocks/`, exported from `blocks/index.ts`, with a
  specimen and a registry entry. Follow the block contract.
- **Changing a value**: change it in `tokens.css`, then the matching line in
  `colour-roles.ts` / `accents.ts`; the check tells you if you missed one.
