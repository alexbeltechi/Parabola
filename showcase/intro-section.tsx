import { DS_ACCENTS } from "../accents";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Fixed below, free above",
    body: "The basics are those of a design system: tokens, buttons, fields, a spacing scale. They leave room for visual expression, so any model can experiment on top of them and a site still reads as one thing from page to page.",
  },
  {
    title: "The default is the fallback",
    body: "The default theme keeps everything consistent; from there a page can expand. Not every page is made from scratch.",
  },
  {
    title: "Four tiers",
    body: "Foundations, primitives, components and blocks, each built only from the ones above it. App screens are composed from them and stay with their page, so the system stays small enough to know by heart.",
  },
  {
    title: "Light and dark, accessible",
    body: "Every component draws from semantic tokens with a light and a dark value, and is built on Radix: keyboard support, a visible focus ring and text that clears AA contrast in both.",
  },
];

/** Intro › Welcome: Parabola in a few lines, as the README opens; a mobile-first one-pager. */
export function IntroSection() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <div aria-hidden className="flex gap-1.5">
          {DS_ACCENTS.map(({ name, token }) => (
            <span key={name} className="size-3 rounded-full" style={{ backgroundColor: `var(${token})` }} />
          ))}
        </div>
        <h2 className="text-h1 text-ds-fg">Welcome to Parabola</h2>
        <p className="text-p text-ds-fg-muted">
          A style, not a design system in the traditional sense, although it contains components.
        </p>
      </div>

      {SECTIONS.map(({ title, body }) => (
        <section key={title} className="flex flex-col items-center gap-2">
          <h3 className="text-h3 text-ds-fg">{title}</h3>
          <p className="text-p text-ds-fg-muted">{body}</p>
        </section>
      ))}

      <section className="flex w-full flex-col items-center gap-2">
        <h3 className="text-h3 text-ds-fg">Get started</h3>
        <p className="text-p text-ds-fg-muted">Install it, then import components and style with tokens.</p>
        <pre className="w-full overflow-x-auto rounded-ds-lg bg-ds-surface/70 p-4 text-left text-small text-ds-fg">
          <code>{`npm install @beltechi/parabola

import { DsButton } from "@beltechi/parabola";

<DsButton variant="primary">Publish</DsButton>
<div className="bg-ds-surface text-ds-fg-muted" />`}</code>
        </pre>
      </section>
    </div>
  );
}
