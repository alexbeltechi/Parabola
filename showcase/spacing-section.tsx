import { DS_SPACES, type DsSpace } from "../spacing";

// What each spacing is typically for, as in tokens.css.
const USES: Record<DsSpace, string> = {
  4: "A title and its meta line: a post's categories",
  8: "The lines of one text group; a post header's date, title and categories",
  16: "A picture and the text under it: a post tile's image and title",
  20: "The gutter: between pictures and tiles, across and down; groups in a column (a title and its button); the page's side margin",
  32: "A picture and the text beside it: a list row's picture and its title",
  40: "Between blocks: a post's text and galleries, a collection's intro and its feed, the More section and the footer",
  80: "Between a text column and the content beside it; between the sections of a page",
  160: "Between a page's main content and what follows it: the post page's More section",
};

export function SpacingSection() {
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-ds-20">
      {DS_SPACES.map((px) => (
        <div key={px} className="flex flex-col gap-ds-8">
          <div className="flex items-baseline justify-between gap-ds-20">
            <p className="text-h3 text-ds-fg">{px}px</p>
            <code className="text-small text-ds-fg-muted">gap-ds-{px}</code>
          </div>
          {/* The distance itself, drawn as a bar between two marks. */}
          <div className="flex items-center">
            <span className="h-6 w-1 rounded-ds-sm bg-ds-fg" />
            <span className="h-2 bg-ds-surface" style={{ width: `var(--ds-space-${px})` }} />
            <span className="h-6 w-1 rounded-ds-sm bg-ds-fg" />
          </div>
          <p className="text-small text-ds-fg-muted">{USES[px]}</p>
        </div>
      ))}
    </div>
  );
}
