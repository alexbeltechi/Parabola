"use client";

import * as React from "react";
import { DsButton } from "../primitives/button";
import { DsCopyField } from "../primitives/copy-field";
import { DsField, DsInput } from "../primitives/field";
import { DsSelect } from "../primitives/select";
import { DsSwitch } from "../primitives/switch";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { dsToast } from "../primitives/toast";
import { DsFontPairing } from "../components/font-pairing";
import { DsInfoCard } from "../components/info-card";
import { DsLinkList } from "../components/link-list";
import { useDsThemeConfig } from "../provider";
import { DS_DEFAULT_THEME, dsApplyTheme, type DsThemeConfig } from "../theme";

/** One tile of the preview grid: a few words on what it shows, then the pieces themselves. */
function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-ds-lg border border-ds-border p-5">
      <p className="text-small text-ds-fg-muted">{label}</p>
      {children}
    </section>
  );
}

/**
 * Theme: the start of Parabola's home screen for making a theme (decisions,
 * 2026-10-28). The controls on top (fonts for now: text and headings), a grid
 * of Parabola's pieces under them that change as you pick, and the theme as
 * data to copy. With an app that can save it (DsProvider
 * `onThemeConfigChange`, the CMS), Save makes it the site's and the admin's;
 * without, it's a preview for this page.
 */
export function ThemeSection() {
  const { themeConfig, onThemeConfigChange } = useDsThemeConfig();
  const [saved, setSaved] = React.useState<DsThemeConfig>(themeConfig ?? DS_DEFAULT_THEME);
  const [theme, setTheme] = React.useState<DsThemeConfig>(saved);
  const [saving, setSaving] = React.useState(false);
  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);

  const pick = (next: DsThemeConfig) => {
    setTheme(next);
    dsApplyTheme(next);
  };

  // Leaving the page unsaved puts the page back in the theme it was served with.
  React.useEffect(() => () => dsApplyTheme(saved), [saved]);

  async function save() {
    if (!onThemeConfigChange) return;
    setSaving(true);
    try {
      await onThemeConfigChange(theme);
      setSaved(theme);
      dsToast.success("Theme saved");
    } catch (error) {
      dsToast.error("Couldn't save the theme", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ds-fg">Theme</h1>
        <p className="text-prose text-ds-fg-muted">
          Pick the fonts and watch everything below change.{" "}
          {onThemeConfigChange ? "Save makes them this site's and its admin's." : "Copy the theme to use it."}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <DsFontPairing theme={theme} onChange={pick} disabled={saving} />
        <div className="flex flex-wrap gap-2">
          {onThemeConfigChange && (
            <DsButton variant="primary" onClick={save} disabled={!dirty} loading={saving}>
              Save
            </DsButton>
          )}
          <DsButton onClick={() => pick(saved)} disabled={!dirty || saving}>
            Undo changes
          </DsButton>
          <DsButton variant="text" onClick={() => pick(DS_DEFAULT_THEME)} disabled={saving}>
            Parabola&apos;s default
          </DsButton>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Tile label="Type">
          <p className="text-display text-ds-fg">Ars longa</p>
          <h2 className="text-h2 text-ds-fg">Make the small version first</h2>
          <p className="text-prose text-ds-fg-muted">
            Everything I&apos;ve finished started bigger and got smaller. Everything I abandoned stayed big.
          </p>
          <p className="text-small text-ds-fg-muted">Small: 14 / 18</p>
        </Tile>
        <Tile label="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <DsButton variant="primary">Publish</DsButton>
            <DsButton>Save</DsButton>
            <DsButton variant="text">Writing</DsButton>
            <DsThemeToggle variant="text" />
          </div>
        </Tile>
        <Tile label="Fields">
          <DsField label="Name" description="The project's name, and the site's.">
            <DsInput defaultValue="Ilo Odena" />
          </DsField>
          <DsField label="Layout">
            <DsSelect
              value="list"
              options={[
                { value: "list", label: "Stacked like a blog" },
                { value: "wall", label: "Posts only" },
              ]}
            />
          </DsField>
          <div className="flex items-center gap-3">
            <span className="flex-1 text-p text-ds-fg">In the site&apos;s nav</span>
            <DsSwitch defaultChecked />
          </div>
        </Tile>
        <Tile label="Lists and notes">
          <DsLinkList
            items={[
              { label: "How to listen to a lake", href: "#", meta: "2026 · 2 min" },
              { label: "Keep fewer moments", href: "#", meta: "2026 · 1 min" },
            ]}
            more={{ label: "All 6 posts", href: "#" }}
          />
          <DsInfoCard title="Not live yet">
            <p>Changes to a published post wait until you publish them.</p>
          </DsInfoCard>
        </Tile>
      </div>

      <DsField label="The theme as data" description="Paste it into another Parabola site, or hand it to an agent." className="w-full">
        <DsCopyField mono wrap value={JSON.stringify(theme)} />
      </DsField>
    </div>
  );
}
