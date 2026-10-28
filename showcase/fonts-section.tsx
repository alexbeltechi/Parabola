"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsField, DsInput } from "../primitives/field";
import { DsSelect } from "../primitives/select";
import { dsNearestWeight, dsWeightName } from "../fonts";
import {
  DS_DEFAULT_THEME,
  DS_TEXT_STYLES,
  DS_TEXT_STYLE_DEFAULTS,
  dsThemeFont,
  type DsFamilyRole,
  type DsTextStyle,
  type DsTextStyleConfig,
  type DsThemeConfig,
} from "../theme";
import { useThemeEditor } from "./theme-editor";

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

const FAMILY_LABEL: Record<DsFamilyRole, string> = { primary: "Primary", display: "Display" };

/**
 * A number in px, applied as soon as it's in range: what's typed stays in
 * the box meanwhile, so typing "48" never sets 4.
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
  return (
    <DsField label={label}>
      <DsInput
        type="number"
        min={min}
        max={max}
        value={focused ? text : String(value)}
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
 * One style's settings in a dialog: its name, family, weight (the ones the
 * family's font has), size and line height. Save
 * puts them in the theme (it shows at once; Publish, top right, makes it
 * live), Restore default puts back Parabola's for this style.
 */
function StyleDialog({
  style,
  theme,
  onClose,
  onSave,
}: {
  style: DsTextStyle;
  theme: DsThemeConfig;
  onClose: () => void;
  onSave: (config: DsTextStyleConfig) => void;
}) {
  const [draft, setDraft] = React.useState<DsTextStyleConfig>(theme.type[style]);
  const { use } = DS_TEXT_STYLE_DEFAULTS[style];
  const familyOptions = (["primary", "display"] as DsFamilyRole[]).map((role) => ({
    value: role,
    label: `${FAMILY_LABEL[role]}: ${dsThemeFont(theme, theme.fonts[role]).label}`,
  }));
  const font = dsThemeFont(theme, theme.fonts[draft.family]);
  const weight = dsNearestWeight(font, draft.weight);
  return (
    <DsDialog open onOpenChange={(open) => !open && onClose()} title={theme.type[style].label} description={use}>
      <div className="flex flex-col gap-ds-16">
        <DsField label="Name" description="What it's called here and in the theme.">
          <DsInput value={draft.label} maxLength={40} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        </DsField>
        <DsField label="Font">
          <DsSelect
            options={familyOptions}
            value={draft.family}
            onValueChange={(family) => setDraft({ ...draft, family: family as DsFamilyRole })}
          />
        </DsField>
        <DsField
          label="Weight"
          description={font.weights.length === 1 ? `${font.label} has one weight.` : `The weights ${font.label} has.`}
        >
          <DsSelect
            // Remount when the family changes, so the shown weight is one it has.
            key={font.id}
            options={font.weights.map((w) => ({ value: String(w), label: `${dsWeightName(w)} (${w})` }))}
            value={String(weight)}
            onValueChange={(w) => setDraft({ ...draft, weight: Number(w) })}
            disabled={font.weights.length === 1}
          />
        </DsField>
        <div className="grid grid-cols-2 gap-ds-8">
          <PxField label="Size" value={draft.size} min={10} max={200} onChange={(size) => setDraft({ ...draft, size })} />
          <PxField
            label="Line height"
            value={draft.lineHeight}
            min={10}
            max={240}
            onChange={(lineHeight) => setDraft({ ...draft, lineHeight })}
          />
        </div>
      </div>
      <DsDialogActions>
        <DsButton
          variant="primary"
          onClick={() => onSave({ ...draft, label: draft.label.trim() || DS_DEFAULT_THEME.type[style].label, weight })}
        >
          Save
        </DsButton>
        <DsButton variant="text" onClick={() => setDraft(DS_DEFAULT_THEME.type[style])}>
          Restore default
        </DsButton>
      </DsDialogActions>
    </DsDialog>
  );
}

/**
 * Typography › Type scale: Parabola's text styles (tokens.css), each in the
 * name, family, weight, size and line height the theme gives it, with its
 * spec and an edit button that opens its settings (decisions, 2026-10-28).
 */
export function FontsSection() {
  const { theme, setTheme } = useThemeEditor();
  const [editing, setEditing] = React.useState<DsTextStyle | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-ds-40 text-center">
      {DS_TEXT_STYLES.map((style) => {
        const { tag: Tag, className } = SPECIMEN[style];
        const t = theme.type[style];
        const font = dsThemeFont(theme, theme.fonts[t.family]);
        const { label } = t;
        return (
          <div key={style} className="flex max-w-full flex-col items-center gap-ds-8">
            <div className="flex max-w-full items-center gap-ds-8">
              <Tag className={`block min-w-0 ${className}`}>{SAMPLE}</Tag>
              <DsButton variant="text" iconLeft={Pencil} aria-label={`Edit ${label}`} onClick={() => setEditing(style)} />
            </div>
            <p className="text-small text-ds-fg-muted">
              {label}: {t.size} / {t.lineHeight} · {FAMILY_LABEL[t.family]} ({font.label}) ·{" "}
              {dsWeightName(dsNearestWeight(font, t.weight))}
            </p>
          </div>
        );
      })}

      {editing && (
        <StyleDialog
          key={editing}
          style={editing}
          theme={theme}
          onClose={() => setEditing(null)}
          onSave={(config) => {
            setTheme({ ...theme, type: { ...theme.type, [editing]: config } });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
