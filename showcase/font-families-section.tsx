"use client";

import * as React from "react";
import { Pencil, Plus, X } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsField, DsInput } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { dsFontOptions } from "../components/font-pairing";
import { dsCustomFontFromInput, dsNearestWeight, dsWeightName, type DsFont } from "../fonts";
import { DS_DEFAULT_THEME, dsThemeFont, dsThemeFonts, type DsFamilyRole, type DsThemeConfig } from "../theme";
import { useThemeEditor } from "./theme-editor";

const SAMPLE = "Ars longa vita brevis";

/** A font's weights by name: "Regular, Medium, Semibold, Bold". */
const weightNames = (font: DsFont) => font.weights.map(dsWeightName).join(", ");

/** A font's weights as small pills, each in its own weight. */
function Weights({ font }: { font: DsFont }) {
  return (
    <div className="flex flex-wrap gap-ds-4">
      {font.weights.map((w) => (
        <DsPill key={w}>
          <span style={{ fontFamily: font.family, fontWeight: w }}>{dsWeightName(w)}</span>
        </DsPill>
      ))}
    </div>
  );
}

const FAMILY: Record<DsFamilyRole, { label: string; use: string }> = {
  primary: { label: "Primary", use: "Text, and every style set in it." },
  display: { label: "Display", use: "For the styles you set in it, such as headings: a pairing." },
};

/** One family's font in a dialog. Save puts it in the theme; Restore default puts back Parabola's. */
function FamilyDialog({
  role,
  theme,
  onClose,
  onSave,
}: {
  role: DsFamilyRole;
  theme: DsThemeConfig;
  onClose: () => void;
  onSave: (fontId: string) => void;
}) {
  const [font, setFont] = React.useState(theme.fonts[role]);
  const picked = dsThemeFont(theme, font);
  return (
    <DsDialog open onOpenChange={(open) => !open && onClose()} title={`${FAMILY[role].label} font`} description={FAMILY[role].use}>
      <div className="flex flex-col gap-ds-16">
        <DsField label="Font">
          <DsSelect options={dsFontOptions(theme)} value={font} onValueChange={setFont} />
        </DsField>
        <DsField
          label="Weights"
          description={
            picked.custom && picked.weights.length === 1
              ? "Added by its name, so Regular only. For more, add it again from a share link on fonts.google.com with the weights picked."
              : "Each style picks one of these on Type scale."
          }
        >
          <Weights font={picked} />
        </DsField>
      </div>
      <DsDialogActions>
        <DsButton variant="primary" onClick={() => onSave(font)}>
          Save
        </DsButton>
        <DsButton variant="text" onClick={() => setFont(DS_DEFAULT_THEME.fonts[role])}>
          Restore default
        </DsButton>
      </DsDialogActions>
    </DsDialog>
  );
}

/** A Google font by its name or link, added to the theme's fonts. */
function AddFontDialog({ theme, onClose, onAdd }: { theme: DsThemeConfig; onClose: () => void; onAdd: (theme: DsThemeConfig) => void }) {
  const [input, setInput] = React.useState("");
  const [problem, setProblem] = React.useState<string | null>(null);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const font = dsCustomFontFromInput(input);
    if (!font) return setProblem("Type a Google font's name, or paste its link from fonts.google.com.");
    if (dsThemeFonts(theme).some((f) => f.id === font.id)) return setProblem(`${font.label} is already here.`);
    onAdd({ ...theme, customFonts: [...theme.customFonts, font] });
  }

  return (
    <DsDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add a font"
      description="Any Google font, by its name or its link from fonts.google.com. It loads from Google where it's used."
    >
      <form onSubmit={add} className="flex flex-col gap-ds-20">
        <DsField label="Google font" error={problem ?? undefined}>
          <DsInput
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setProblem(null);
            }}
            placeholder="Space Grotesk"
          />
        </DsField>
        <DsDialogActions>
          <DsButton type="submit" variant="primary" disabled={!input.trim()}>
            Add
          </DsButton>
        </DsDialogActions>
      </form>
    </DsDialog>
  );
}

/**
 * Typography › Font families: the theme's two families, primary and display,
 * in their faces with their weights, each with an edit button for its font;
 * then every font the theme can use (how many, top right), Parabola's and
 * any Google font added to it, and Add font under the list (decisions,
 * 2026-10-28).
 */
export function FontFamiliesSection() {
  const { theme, setTheme } = useThemeEditor();
  const [editing, setEditing] = React.useState<DsFamilyRole | null>(null);
  const [adding, setAdding] = React.useState(false);
  const used = new Set([theme.fonts.primary, theme.fonts.display]);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-ds-40">
      <div className="grid gap-ds-20 md:grid-cols-2">
        {(["primary", "display"] as DsFamilyRole[]).map((role) => {
          const font = dsThemeFont(theme, theme.fonts[role]);
          return (
            <section key={role} className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-bg p-ds-20">
              <div className="flex items-center gap-ds-8">
                <p className="flex-1 text-small text-ds-fg-muted">{FAMILY[role].label}</p>
                <DsButton
                  variant="text"
                  size="small"
                  iconLeft={Pencil}
                  aria-label={`Edit the ${FAMILY[role].label.toLowerCase()} font`}
                  onClick={() => setEditing(role)}
                />
              </div>
              <p className="text-h1 text-ds-fg" style={{ fontFamily: font.family, fontWeight: dsNearestWeight(font, 400) }}>
                {SAMPLE}
              </p>
              <div className="flex flex-col gap-ds-4">
                <p className="text-p text-ds-fg">{font.label}</p>
                <p className="text-small text-ds-fg-muted">{weightNames(font)}</p>
              </div>
            </section>
          );
        })}
      </div>

      <section className="flex flex-col gap-ds-8">
        <div className="flex items-baseline gap-ds-8">
          <h2 className="flex-1 text-h3 text-ds-fg">Fonts</h2>
          <span className="text-p text-ds-fg-muted tabular-nums">{dsThemeFonts(theme).length}</span>
        </div>
        <ul className="flex flex-col divide-y divide-ds-border border-y border-ds-border">
          {dsThemeFonts(theme).map((font) => (
            <li key={font.id} className="flex items-center gap-ds-16 py-ds-16">
              <span className="w-12 shrink-0 text-h2 text-ds-fg" style={{ fontFamily: font.family, fontWeight: dsNearestWeight(font, 400) }}>
                Aa
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-p text-ds-fg">{font.label}</span>
                <span className="truncate text-small text-ds-fg-muted">
                  {font.weights.length === 1 ? "1 weight" : `${font.weights.length} weights`}
                </span>
              </span>
              {used.has(font.id) && <DsPill>In use</DsPill>}
              <span className="text-small text-ds-fg-muted">{font.custom ? "Added" : "Parabola"}</span>
              {font.custom && (
                <DsButton
                  size="small"
                  variant="text"
                  iconLeft={X}
                  aria-label={`Remove ${font.label}`}
                  disabled={used.has(font.id)}
                  onClick={() => setTheme({ ...theme, customFonts: theme.customFonts.filter((f) => f.id !== font.id) })}
                />
              )}
            </li>
          ))}
        </ul>
        <DsButton iconLeft={Plus} className="mt-ds-8 self-start" onClick={() => setAdding(true)}>
          Add font
        </DsButton>
      </section>

      {editing && (
        <FamilyDialog
          key={editing}
          role={editing}
          theme={theme}
          onClose={() => setEditing(null)}
          onSave={(fontId) => {
            setTheme({ ...theme, fonts: { ...theme.fonts, [editing]: fontId } });
            setEditing(null);
          }}
        />
      )}
      {adding && (
        <AddFontDialog
          theme={theme}
          onClose={() => setAdding(false)}
          onAdd={(next) => {
            setTheme(next);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
