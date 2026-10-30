"use client";

import * as React from "react";
import { ArrowUpRight, Pencil, Plus, X } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsDialog, DsDialogActions } from "../primitives/dialog";
import { DsField, DsInput } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSelect } from "../primitives/select";
import { dsToast } from "../primitives/toast";
import { dsFontOptions } from "../components/font-pairing";
import { dsCustomFontFromInput, dsGoogleFontsPage, dsNearestWeight, dsWeightName, type DsFont } from "../fonts";
import {
  DS_DEFAULT_THEME,
  DS_PERMANENT_FONT,
  DS_BODY_FAMILY,
  dsFamilyFont,
  dsFamilyId,
  dsRemoveFamily,
  dsThemeFont,
  dsThemeFonts,
  type DsFontFamily,
  type DsThemeConfig,
} from "../theme";
import { useThemeEditor } from "./theme-editor";

const SAMPLE = "Ars longa vita brevis";

/** A font's name, linked to its page on Google Fonts (to check it's the one meant) when it has one. */
function FontName({ font, className }: { font: DsFont; className: string }) {
  const page = dsGoogleFontsPage(font);
  if (!page) return <span className={className}>{font.label}</span>;
  return (
    <a
      href={page}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} group inline-flex items-center gap-ds-4 hover:underline hover:underline-offset-4`}
    >
      {font.label}
      <ArrowUpRight aria-hidden className="size-4 shrink-0 text-ds-fg-subtle group-hover:text-ds-fg" />
    </a>
  );
}

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

/**
 * A family in a dialog: its name and its font, with the font's weights.
 * Save puts it in the theme; Restore default puts back Parabola's (Primary
 * and Secondary only); Remove takes it out (any but Primary). New families
 * open here too, blank.
 */
function FamilyDialog({
  theme,
  family,
  onClose,
  onSave,
  onRemove,
}: {
  theme: DsThemeConfig;
  /** The family being edited; none for a new one. */
  family?: DsFontFamily;
  onClose: () => void;
  onSave: (family: { label: string; font: string }) => void;
  onRemove?: () => void;
}) {
  const [label, setLabel] = React.useState(family?.label ?? "");
  const [font, setFont] = React.useState(family?.font ?? theme.families[0].font);
  const picked = dsThemeFont(theme, font);
  const defaults = family ? DS_DEFAULT_THEME.families.find((f) => f.id === family.id) : undefined;
  return (
    <DsDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={family ? family.label : "Add a family"}
      description={
        family?.id === DS_BODY_FAMILY
          ? "Text, and every style set in it."
          : "A font your styles can be set in: headlines, quotes, captions…"
      }
    >
      <div className="flex flex-col gap-ds-16">
        <DsField label="Name">
          <DsInput autoFocus={!family} value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="Accent" />
        </DsField>
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
        <DsButton variant="primary" disabled={!label.trim()} onClick={() => onSave({ label: label.trim(), font })}>
          {family ? "Save" : "Add family"}
        </DsButton>
        {defaults && (
          <DsButton
            variant="text"
            onClick={() => {
              setLabel(defaults.label);
              setFont(defaults.font);
            }}
          >
            Restore default
          </DsButton>
        )}
        {onRemove && (
          <DsButton variant="text" destructive onClick={onRemove}>
            Remove family
          </DsButton>
        )}
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
    // One of Parabola's that was taken out comes back instead of a copy.
    if (theme.hiddenFonts.includes(font.id)) return onAdd({ ...theme, hiddenFonts: theme.hiddenFonts.filter((id) => id !== font.id) });
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
 * Typography › Font families: the theme's families, one card each under the
 * other (Primary, Secondary, any added), in their faces with their fonts
 * (linked to Google Fonts) and weights, each with an edit button; Add family
 * under them. Then every font the theme can use, how many top right, each
 * linked to Google Fonts and removable but System (not while a family uses
 * it), and Add font under the list.
 */
export function FontFamiliesSection() {
  const { theme, setTheme } = useThemeEditor();
  const [editing, setEditing] = React.useState<string | "new" | null>(null);
  const [adding, setAdding] = React.useState(false);
  const used = new Set(theme.families.map((f) => f.font));
  const fonts = dsThemeFonts(theme);

  /** A change that can be taken back from its toast. */
  function change(next: DsThemeConfig, message: string) {
    const before = theme;
    setTheme(next);
    dsToast(message, { action: { label: "Undo", onClick: () => setTheme(before) } });
  }

  function removeFont(font: DsFont) {
    change(
      font.custom
        ? { ...theme, customFonts: theme.customFonts.filter((f) => f.id !== font.id) }
        : { ...theme, hiddenFonts: [...theme.hiddenFonts, font.id] },
      `${font.label} removed`
    );
  }

  const editingFamily = editing && editing !== "new" ? theme.families.find((f) => f.id === editing) : undefined;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-ds-40">
      <section className="flex flex-col gap-ds-16">
        {theme.families.map((family) => {
          const font = dsFamilyFont(theme, family.id);
          return (
            <article key={family.id} className="flex flex-col gap-ds-16 rounded-ds-lg bg-ds-bg p-ds-20">
              <div className="flex items-center gap-ds-8">
                <p className="flex-1 text-small text-ds-fg-muted">{family.label}</p>
                <DsButton
                  variant="text"
                  size="small"
                  iconLeft={Pencil}
                  aria-label={`Edit ${family.label}`}
                  onClick={() => setEditing(family.id)}
                />
              </div>
              <p className="text-h1 text-ds-fg" style={{ fontFamily: font.family, fontWeight: dsNearestWeight(font, 400) }}>
                {SAMPLE}
              </p>
              <div className="flex flex-col gap-ds-4">
                <FontName font={font} className="text-p text-ds-fg" />
                <p className="text-small text-ds-fg-muted">{font.weights.map(dsWeightName).join(", ")}</p>
              </div>
            </article>
          );
        })}
        <DsButton iconLeft={Plus} className="self-start" onClick={() => setEditing("new")}>
          Add family
        </DsButton>
      </section>

      <section className="flex flex-col gap-ds-8">
        <div className="flex items-baseline gap-ds-8">
          <h2 className="flex-1 text-h3 text-ds-fg">Fonts</h2>
          <span className="text-p text-ds-fg-muted tabular-nums">{fonts.length}</span>
        </div>
        <ul className="flex flex-col divide-y divide-ds-border border-y border-ds-border">
          {fonts.map((font) => (
            <li key={font.id} className="flex items-center gap-ds-16 py-ds-16">
              <span className="w-12 shrink-0 text-h2 text-ds-fg" style={{ fontFamily: font.family, fontWeight: dsNearestWeight(font, 400) }}>
                Aa
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <FontName font={font} className="truncate text-p text-ds-fg" />
                <span className="truncate text-small text-ds-fg-muted">
                  {font.weights.length === 1 ? "1 weight" : `${font.weights.length} weights`}
                </span>
              </span>
              {used.has(font.id) && <DsPill>In use</DsPill>}
              {font.id !== DS_PERMANENT_FONT && (
                <DsButton
                  size="small"
                  variant="text"
                  iconLeft={X}
                  aria-label={used.has(font.id) ? `${font.label} is in use` : `Remove ${font.label}`}
                  disabled={used.has(font.id)}
                  onClick={() => removeFont(font)}
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
          theme={theme}
          family={editingFamily}
          onClose={() => setEditing(null)}
          onSave={({ label, font }) => {
            setTheme(
              editingFamily
                ? { ...theme, families: theme.families.map((f) => (f.id === editingFamily.id ? { ...f, label, font } : f)) }
                : { ...theme, families: [...theme.families, { id: dsFamilyId(theme, label), label, font }] }
            );
            setEditing(null);
          }}
          onRemove={
            editingFamily && editingFamily.id !== DS_BODY_FAMILY
              ? () => {
                  change(dsRemoveFamily(theme, editingFamily.id), `${editingFamily.label} removed; its styles are in Primary now`);
                  setEditing(null);
                }
              : undefined
          }
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
