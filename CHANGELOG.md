# Changelog

What changed in each Parabola, newest first, in plain words. `update` prints
the entries between a project's version and the one it's taking. Say which
files a change touches when a project is likely to have edited them.

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
