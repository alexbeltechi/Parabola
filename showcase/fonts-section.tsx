"use client";

import * as React from "react";
import { DsField, DsInput } from "../primitives/field";
import { DsSelect } from "../primitives/select";
import {
  DS_TEXT_STYLES,
  DS_TEXT_STYLE_DEFAULTS,
  dsThemeFont,
  type DsFamilyRole,
  type DsTextStyle,
  type DsTextStyleConfig,
} from "../theme";
import { InPanel, PanelSection, ThemeActions, useThemeEditor } from "./theme-editor";

/** Each style's class and the element it's for, so the specimen is what a page gets. */
const SPECIMEN: Record<DsTextStyle, { tag: "h1" | "h2" | "h3" | "p" | "small"; className: string }> = {
  display: { tag: "h1", className: "text-display text-ds-fg" },
  h1: { tag: "h1", className: "text-h1 text-ds-fg" },
  h2: { tag: "h2", className: "text-h2 text-ds-fg" },
  h3: { tag: "h3", className: "text-h3 text-ds-fg" },
  p: { tag: "p", className: "text-p text-ds-fg" },
  prose: { tag: "p", className: "text-prose text-ds-fg-muted" },
  small: { tag: "small", className: "text-small text-ds-fg-muted" },
};

const SAMPLE = "Ars longa vita brevis";

/**
 * A number in px, applied as soon as it's in range: what's typed stays in
 * the box meanwhile, so typing "48" never shows the text at 4px.
 */
function PxField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);
  const shown = focused ? text : String(value);
  return (
    <DsField label={label}>
      <DsInput
        type="number"
        min={min}
        max={max}
        value={shown}
        onFocus={() => {
          setText(String(value));
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value && n >= min && n <= max) onChange(Math.round(n));
        }}
      />
    </DsField>
  );
}

/**
 * Typography › Type scale: Parabola's text styles (tokens.css), each in the
 * family, size and line height the theme gives it, with its spec. The panel
 * sets them per style: which family (primary or secondary), the size and the
 * line height (decisions, 2026-10-28).
 */
export function FontsSection() {
  const { theme, setTheme } = useThemeEditor();

  const setStyle = (style: DsTextStyle, patch: Partial<DsTextStyleConfig>) =>
    setTheme({ ...theme, type: { ...theme.type, [style]: { ...theme.type[style], ...patch } } });

  const familyOptions = (["primary", "secondary"] as DsFamilyRole[]).map((role) => ({
    value: role,
    label: `${role === "primary" ? "Primary" : "Secondary"}: ${dsThemeFont(theme, theme.fonts[role]).label}`,
  }));

  return (
    <div className="flex w-full flex-col items-center gap-ds-40 text-center">
      {DS_TEXT_STYLES.map((style) => {
        const { tag: Tag, className } = SPECIMEN[style];
        const t = theme.type[style];
        const font = dsThemeFont(theme, theme.fonts[t.family]);
        return (
          <div key={style} className="flex max-w-full flex-col items-center gap-ds-8">
            <Tag className={`block ${className}`}>{SAMPLE}</Tag>
            <p className="text-small text-ds-fg-muted">
              {DS_TEXT_STYLE_DEFAULTS[style].label}: {t.size} / {t.lineHeight} · {font.label} ·{" "}
              {font.weight === 500 ? "Medium" : "Regular"}
            </p>
          </div>
        );
      })}

      <InPanel>
        <ThemeActions />
        {DS_TEXT_STYLES.map((style) => {
          const { label, use } = DS_TEXT_STYLE_DEFAULTS[style];
          const t = theme.type[style];
          return (
            <PanelSection key={style} title={label} defaultOpen={style === "display"}>
              <p className="text-small text-ds-fg-muted">{use}</p>
              <DsField label="Font">
                <DsSelect
                  options={familyOptions}
                  value={t.family}
                  onValueChange={(family) => setStyle(style, { family: family as DsFamilyRole })}
                />
              </DsField>
              <div className="grid grid-cols-2 gap-ds-8">
                <PxField label="Size" value={t.size} min={10} max={200} onChange={(size) => setStyle(style, { size })} />
                <PxField
                  label="Line height"
                  value={t.lineHeight}
                  min={10}
                  max={240}
                  onChange={(lineHeight) => setStyle(style, { lineHeight })}
                />
              </div>
            </PanelSection>
          );
        })}
      </InPanel>
    </div>
  );
}
