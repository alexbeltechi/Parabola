# Changelog

What changed in each Parabola, newest first, in plain words. `update` prints
the entries between a project's version and the one it's taking. Say which
files a change touches when a project is likely to have edited them.

## Unreleased

- Changed: on the Theme page the theme dropdown is now a row of names
  (Parabola, then any theme made from it), with Light and Dark as a second
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
