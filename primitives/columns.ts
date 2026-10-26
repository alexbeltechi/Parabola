/**
 * Parabola columns: a row of like items in a form (the preview image, the
 * share toggles) laid out as equal columns that left-align and wrap onto new
 * rows as items are added: 2 columns, 3 from 672px wide, 4 from 896px. The
 * steps keep a column at least ~210px (room for a label and its toggle) once
 * there are 3 or more; each item stays one column wide, so a toggle never
 * drifts far from its label.
 *
 * The widths are the form's, not the screen's (container queries): put
 * `@container` on the form. Without one it stays at 2 columns.
 */
export const DS_COLUMNS_CLASS = "grid grid-cols-2 gap-4 @2xl:grid-cols-3 @4xl:grid-cols-4";
