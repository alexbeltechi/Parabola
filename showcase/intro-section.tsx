import { DS_ACCENTS } from "../accents";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Lean by design",
    body: "Four tiers, each built from the ones above: foundations, primitives, components and blocks. App screens are composed from them and stay with their page, so the system stays small enough to know by heart.",
  },
  {
    title: "Content first",
    body: "Quiet, neutral chrome so the work carries the colour. One highlight for the few things that need attention, nine accents for content.",
  },
  {
    title: "Light and dark, one codebase",
    body: "Every component draws from semantic tokens only. Each token has a light and a dark value, so both themes come for free.",
  },
  {
    title: "Accessible by default",
    body: "Built on Radix: full keyboard support, a visible focus ring, labelled controls and text that clears AA contrast in both themes.",
  },
  {
    title: "Change once, everywhere",
    body: (
      <>
        Tokens live in one place. Change a value and every screen follows;{" "}
        <code className="text-ds-fg">npm run check:parabola</code> keeps the docs in step.
      </>
    ),
  },
];

/** Intro › Welcome: Parabola in a few lines, a mobile-first one-pager. */
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
          A lean design system for calm, content-first interfaces, optimised for small teams and fast iteration.
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
        <p className="text-p text-ds-fg-muted">Import components, style with tokens.</p>
        <pre className="w-full overflow-x-auto rounded-ds-lg bg-ds-surface/70 p-4 text-left text-small text-ds-fg">
          <code>{`import { DsButton } from "@beltechi/parabola";

<DsButton variant="primary">Publish</DsButton>
<div className="bg-ds-surface text-ds-fg-muted" />`}</code>
        </pre>
      </section>
    </div>
  );
}
