import * as React from "react";
import { DsField, DS_FIELDS_CLASS } from "../primitives/field";
import { DsSelect, type DsSelectOption } from "../primitives/select";
import { cn } from "../cn";
import { dsNearestWeight } from "../fonts";
import { dsThemeFonts, type DsThemeConfig } from "../theme";

/** A theme's fonts as select options, each with "Aa" in its own face before its name. */
export function dsFontOptions(theme: DsThemeConfig): DsSelectOption[] {
  return dsThemeFonts(theme).map((font) => ({
    value: font.id,
    label: font.label,
    indicator: (
      <span aria-hidden className="w-6 text-p text-ds-fg" style={{ fontFamily: font.family, fontWeight: dsNearestWeight(font, 500) }}>
        Aa
      </span>
    ),
  }));
}

/**
 * Parabola font pairing: a select for each of a theme's font families
 * (theme.ts: Primary, Secondary and any it added), of the theme's fonts with
 * "Aa" in the face. Every text style is set in one of them (Typography ›
 * Type scale). On Settings › Design. Controlled: it
 * shows `theme` and hands back the whole theme with the change.
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
  return (
    <div data-slot="ds-font-pairing" className={cn(stacked ? "ds-fields-fill flex flex-col gap-ds-16" : DS_FIELDS_CLASS, className)}>
      {theme.families.map((family) => (
        <DsField key={family.id} label={family.label}>
          <DsSelect
            options={options}
            value={family.font}
            onValueChange={(font) =>
              onChange({ ...theme, families: theme.families.map((f) => (f.id === family.id ? { ...f, font } : f)) })
            }
            disabled={disabled}
          />
        </DsField>
      ))}
    </div>
  );
}
