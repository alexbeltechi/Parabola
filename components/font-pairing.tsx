import * as React from "react";
import { DsField } from "../primitives/field";
import { DsSelect, type DsSelectOption } from "../primitives/select";
import { DS_FIELDS_CLASS } from "../primitives/field";
import { cn } from "../cn";
import { DS_FONTS, type DsFontId } from "../fonts";
import type { DsThemeConfig } from "../theme";

/** Each font, with "Aa" in its own face before its name. */
const FONT_OPTIONS: DsSelectOption[] = DS_FONTS.map((font) => ({
  value: font.id,
  label: font.label,
  indicator: (
    <span aria-hidden className="w-6 text-p text-ds-fg" style={{ fontFamily: font.family, fontWeight: font.headingWeight }}>
      Aa
    </span>
  ),
}));

/**
 * Parabola font pairing: a theme's two fonts (theme.ts), one for text and one
 * for headings, each a select of Parabola's fonts (fonts.ts) with "Aa" in
 * the face. The first of a theme's controls, on Settings › Design and the
 * /parabola Theme page (decisions, 2026-10-28). Controlled: it shows `theme`
 * and hands back the whole theme with the change.
 */
export function DsFontPairing({
  theme,
  onChange,
  disabled,
  className,
}: {
  theme: DsThemeConfig;
  onChange: (theme: DsThemeConfig) => void;
  disabled?: boolean;
  className?: string;
}) {
  const set = (role: "text" | "headings") => (id: string) =>
    onChange({ ...theme, fonts: { ...theme.fonts, [role]: id as DsFontId } });
  return (
    <div data-slot="ds-font-pairing" className={cn(DS_FIELDS_CLASS, className)}>
      <DsField label="Text" description="Body copy, buttons, fields, everything but headings.">
        <DsSelect options={FONT_OPTIONS} value={theme.fonts.text} onValueChange={set("text")} disabled={disabled} />
      </DsField>
      <DsField label="Headings" description="Display and H1 to H3. The same font, or a pairing.">
        <DsSelect options={FONT_OPTIONS} value={theme.fonts.headings} onValueChange={set("headings")} disabled={disabled} />
      </DsField>
    </div>
  );
}
