type TextStyle = {
  name: string;
  tag: "h1" | "h2" | "h3" | "p" | "small";
  className: string;
  spec: string;
  muted?: boolean;
};

// The type scale classes from tokens.css (Figma: Folio Dharmify 693:5061),
// each rendered with the element it's named for (Display, the editorial size,
// is an h1 on large screens). All medium, in the theme's fonts (Theme page;
// Display to H3 in its heading font), two colours: `ds-fg` and `ds-fg-muted`.
export const TEXT_STYLES: TextStyle[] = [
  { name: "Display", tag: "h1", className: "text-display", spec: "60 / 64" },
  { name: "H1", tag: "h1", className: "text-h1", spec: "36 / 48" },
  { name: "H2", tag: "h2", className: "text-h2", spec: "24 / 30" },
  { name: "H3", tag: "h3", className: "text-h3", spec: "18 / 26" },
  { name: "P", tag: "p", className: "text-p", spec: "16 / 22" },
  { name: "P muted", tag: "p", className: "text-p", spec: "16 / 22", muted: true },
  { name: "Prose", tag: "p", className: "text-prose", spec: "18 / 28", muted: true },
  { name: "Small", tag: "small", className: "text-small", spec: "14 / 18", muted: true },
];

const SAMPLE = "Ars longa vita brevis";

export function FontsSection() {
  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-h3 text-ds-fg">The theme&apos;s fonts</p>
        <p className="text-small text-ds-fg-muted">Instrument Sans by default; pick others on Theme</p>
      </div>

      {TEXT_STYLES.map(({ name, tag: Tag, className, spec, muted }) => (
        <div key={name} className="flex max-w-full flex-col items-center gap-2">
          <Tag className={`block ${className} ${muted ? "text-ds-fg-muted" : "text-ds-fg"}`}>{SAMPLE}</Tag>
          <p className="text-small text-ds-fg-muted">
            {name}: {spec} · Medium
          </p>
        </div>
      ))}
    </div>
  );
}
