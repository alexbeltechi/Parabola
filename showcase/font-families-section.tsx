"use client";

import * as React from "react";
import { X } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsField, DsInput } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsFontPairing } from "../components/font-pairing";
import { dsCustomFontFromInput } from "../fonts";
import { dsThemeFont, dsThemeFonts, type DsFamilyRole } from "../theme";
import { InPanel, PanelSection, ThemeActions, useThemeEditor } from "./theme-editor";

const SAMPLE = "Ars longa vita brevis";

/**
 * Typography › Font families: the theme's two families, primary and
 * secondary, in their faces, and every font it can use: Parabola's, and any
 * Google font added to it by name or link (decisions, 2026-10-28). The panel
 * picks the two families and adds a font.
 */
export function FontFamiliesSection() {
  const { theme, setTheme } = useThemeEditor();
  const [input, setInput] = React.useState("");
  const [problem, setProblem] = React.useState<string | null>(null);

  const used = new Set([theme.fonts.primary, theme.fonts.secondary]);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const font = dsCustomFontFromInput(input);
    if (!font) {
      setProblem("Type a Google font's name, or paste its link from fonts.google.com.");
      return;
    }
    if (dsThemeFonts(theme).some((f) => f.id === font.id)) {
      setProblem(`${font.label} is already here.`);
      return;
    }
    setTheme({ ...theme, customFonts: [...theme.customFonts, font] });
    setInput("");
    setProblem(null);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-ds-40">
      <div className="grid gap-ds-20 md:grid-cols-2">
        {(["primary", "secondary"] as DsFamilyRole[]).map((role) => {
          const font = dsThemeFont(theme, theme.fonts[role]);
          return (
            <section key={role} className="flex flex-col gap-ds-16 rounded-ds-lg border border-ds-border p-ds-20">
              <p className="text-small text-ds-fg-muted">{role === "primary" ? "Primary" : "Secondary"}</p>
              <p className="text-h1 text-ds-fg" style={{ fontFamily: font.family, fontWeight: font.weight }}>
                {SAMPLE}
              </p>
              <p className="text-p text-ds-fg">{font.label}</p>
            </section>
          );
        })}
      </div>

      <section className="flex flex-col gap-ds-8">
        <h2 className="text-h3 text-ds-fg">Fonts</h2>
        <ul className="flex flex-col divide-y divide-ds-border border-y border-ds-border">
          {dsThemeFonts(theme).map((font) => (
            <li key={font.id} className="flex items-center gap-ds-16 py-ds-16">
              <span className="w-12 shrink-0 text-h2 text-ds-fg" style={{ fontFamily: font.family, fontWeight: font.weight }}>
                Aa
              </span>
              <span className="min-w-0 flex-1 truncate text-p text-ds-fg">{font.label}</span>
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
      </section>

      <InPanel>
        <ThemeActions />
        <PanelSection title="Families">
          <DsFontPairing theme={theme} onChange={setTheme} stacked />
        </PanelSection>
        <PanelSection title="Add a font">
          <form onSubmit={add} className="flex flex-col gap-ds-8">
            <DsField
              label="Google font"
              description="Its name, or its link from fonts.google.com. It loads from Google where it's used."
              error={problem ?? undefined}
            >
              <DsInput
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setProblem(null);
                }}
                placeholder="Space Grotesk"
              />
            </DsField>
            <DsButton type="submit" className="self-start" disabled={!input.trim()}>
              Add
            </DsButton>
          </form>
        </PanelSection>
      </InPanel>
    </div>
  );
}
