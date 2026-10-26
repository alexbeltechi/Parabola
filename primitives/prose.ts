/**
 * Parabola prose: how rich text reads, in one place, so a post's text looks
 * the same in the editor (DsRichText) as on the site. Body copy is Prose
 * (18/28, sized for reading) in muted;
 * titles (h2, h3) are H2 (24px) in the page colour with space above; bold and links
 * take the page colour; lists are indented with markers.
 *
 * A plain module (no "use client") so server components can use it too.
 */
export const DS_PROSE_CLASS = [
  "text-prose text-ds-fg-muted",
  "[&_p+p]:mt-4",
  "[&_:is(h1,h2,h3,h4)]:mb-2 [&_:is(h1,h2,h3,h4)]:text-h2 [&_:is(h1,h2,h3,h4)]:text-ds-fg",
  "[&_*+:is(h1,h2,h3,h4)]:mt-6",
  "[&_strong]:text-ds-fg [&_a]:text-ds-fg [&_a]:underline",
  "[&_:is(ul,ol)]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal [&_li+li]:mt-1 [&_*+:is(ul,ol)]:mt-4 [&_:is(ul,ol)+*]:mt-4",
  "[&_li>p]:m-0",
  // Tables, the classic way: a thin outline with rounded corners, rules between
  // rows only (no column lines), and a tinted header row in regular weight. Scrolls
  // sideways when it's too wide for the screen.
  "[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:rounded-ds-md [&_table]:border [&_table]:border-ds-border [&_table]:border-collapse [&_*+:is(table,.tableWrapper)]:mt-4 [&_:is(table,.tableWrapper)+*]:mt-4",
  "[&_:is(th,td)]:border-b [&_:is(th,td)]:border-ds-border [&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2 [&_:is(th,td)]:text-left [&_:is(th,td)]:align-top [&_:is(th,td)]:min-w-[8rem]",
  "[&_tr:last-child>:is(th,td)]:border-b-0 [&_thead_tr:last-child>:is(th,td)]:border-b",
  "[&_th]:bg-ds-surface-subtle [&_th]:font-medium [&_th]:text-ds-fg",
  "[&_:is(th,td)>p]:m-0",
].join(" ");
