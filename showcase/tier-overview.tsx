type Rule = { title: string; body: React.ReactNode };

/** A tier's landing page: what belongs in it and the rules its pieces follow. */
function TierOverview({ title, lede, rules }: { title: string; lede: string; rules: Rule[] }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-h1 text-ds-fg">{title}</h2>
        <p className="text-p text-ds-fg-muted">{lede}</p>
      </div>
      {rules.map(({ title, body }) => (
        <section key={title} className="flex flex-col items-center gap-2">
          <h3 className="text-h3 text-ds-fg">{title}</h3>
          <p className="text-p text-ds-fg-muted">{body}</p>
        </section>
      ))}
    </div>
  );
}

/** Components › Overview. */
export function ComponentsOverview() {
  return (
    <TierOverview
      title="Components"
      lede="Primitives composed into a reusable piece with one job: a testimonial card, a step card, a marquee. Smaller than a page section, used by more than one block."
      rules={[
        {
          title: "Made of primitives",
          body: "Built from primitives and tokens only. A component never sets its own outer margin or page width; whatever places it decides.",
        },
        {
          title: "Content in, markup out",
          body: "Text, media and links come in as props. No fetching, no app state, no framework imports.",
        },
      ]}
    />
  );
}

/** Blocks › Overview. */
export function BlocksOverview() {
  return (
    <TierOverview
      title="Blocks"
      lede="Full-width page sections, built from components and primitives. A page is an ordered list of blocks, written by hand in the page builder or by an agent."
      rules={[
        {
          title: "Props are data",
          body: "Every prop can be stored as JSON: strings, media references, links and a few named variants. No functions, no children, no class names. That is what lets the page builder and an agent compose them.",
        },
        {
          title: "Few, deliberate variants",
          body: "Taste lives in the constraints. A block offers a handful of named options, never free-form styling.",
        },
        {
          title: "The page owns the rhythm",
          body: "Spacing between blocks and the page width come from the page, so any order of blocks stays even.",
        },
      ]}
    />
  );
}
