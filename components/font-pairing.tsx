import * as React from "react";
import { DsField, DS_FIELDS_CLASS } from "../primitives/field";
import { DsSelect, type DsSelectOption } from "../primitives/select";
import { cn } from "../cn";
import { dsThemeFonts, type DsFamilyRole, type DsThemeConfig } from "../theme";

/** A theme's fonts as select options, each with "Aa" in its own face before its name. */
export function dsFontOptions(theme: DsThemeConfig): DsSelectOption[] {
  return dsThemeFonts(theme).map((font) => ({
    value: font.id,
    label: font.label,
    indicator: (
      <span aria-hidden className="w-6 text-p text-ds-fg" style={{ fontFamily: font.family, fontWeight: font.weight }}>
        Aa
      </span>
    ),
  }));
}

/**
 * Parabola font pairing: a theme's two font families (theme.ts), primary and
 * display, each a select of the theme's fonts (Parabola's and any it
 * added) with "Aa" in the face. Every text style is set in one of the two
 * (Typography › Type scale). On Settings › Design and in /parabola's panel
 * (decisions, 2026-10-28). Controlled: it shows `theme` and hands back the
 * whole theme with the change.
 */
export function DsFontPairing({
  theme,
  onChange,
  disabled,
  stacked = false,
  className,
}: {
  theme: DsThemeConfig;
  onChange: (theme: DsThemeConfig) => void;
  disabled?: boolean;
  /** One field under the other, filling a narrow panel. */
  stacked?: boolean;
  className?: string;
}) {
  const options = dsFontOptions(theme);
  const set = (role: DsFamilyRole) => (id: string) => onChange({ ...theme, fonts: { ...theme.fonts, [role]: id } });
  return (
    <div data-slot="ds-font-pairing" className={cn(stacked ? "ds-fields-fill flex flex-col gap-ds-16" : DS_FIELDS_CLASS, className)}>
      <DsField label="Primary" description="Text, and every style set in it.">
        <DsSelect options={options} value={theme.fonts.primary} onValueChange={set("primary")} disabled={disabled} />
      </DsField>
      <DsField label="Display" description="For the styles you set in it, such as headings: a pairing.">
        <DsSelect options={options} value={theme.fonts.display} onValueChange={set("display")} disabled={disabled} />
      </DsField>
    </div>
  );
}
