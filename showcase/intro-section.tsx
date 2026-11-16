/** Intro › Welcome: what Parabola is, in two paragraphs, then how to start. A mobile-first one-pager. */
export function IntroSection() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-h1 text-ds-fg">Parabola System</h2>
        <p className="text-p text-ds-fg-muted">
          Parabola is a style, not a design system in the traditional sense, although it contains components.
        </p>
        <p className="text-p text-ds-fg-muted">
          Fixed below, free above: the basics of a design system, as a foundation any model can experiment on.
        </p>
      </div>

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
