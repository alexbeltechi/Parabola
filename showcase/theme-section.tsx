"use client";

import * as React from "react";
import { DsButton } from "../primitives/button";
import { DsCopyField } from "../primitives/copy-field";
import { DsField, DsInput } from "../primitives/field";
import { DsSelect } from "../primitives/select";
import { DsSwitch } from "../primitives/switch";
import { DsThemeToggle } from "../primitives/theme-toggle";
import { DsInfoCard } from "../components/info-card";
import { DsLinkList } from "../components/link-list";
import { useThemeEditor } from "./theme-editor";

/**
 * One tile of the preview grid: a few words on what it shows, then the
 * pieces themselves, on the page colour with no outline, so pieces that sit
 * on a surface of their own (the info card) stand out from the canvas.
 * Fields fill it unless it's wide.
 */
function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="@container rounded-ds-lg bg-ds-bg p-ds-20">
      {/* Fields fill the tile while it's narrow (under 672px), as on a phone; a wider tile gives them their usual width. */}
      <div className="flex flex-col gap-ds-16 @max-2xl:ds-fields-fill">
        <p className="text-small text-ds-fg-muted">{label}</p>
        {children}
      </div>
    </section>
  );
}

/**
 * Theme: the start of Parabola's home screen for making a theme (decisions,
 * 2026-10-28). A grid of Parabola's pieces that change as the theme does,
 * and the theme as data to copy. The theme is edited on Typography (Font
 * families, Type scale) and published top right. Every spacing is a
 * Parabola one.
 */
export function ThemeSection() {
  const { theme } = useThemeEditor();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-ds-40">
      <div className="grid gap-ds-20 md:grid-cols-2">
        <Tile label="Type">
          <p className="text-display text-ds-fg">Ars longa</p>
          <h2 className="text-h2 text-ds-fg">Make the small version first</h2>
          <p className="text-prose text-ds-fg-muted">
            Everything I&apos;ve finished started bigger and got smaller. Everything I abandoned stayed big.
          </p>
          <p className="text-small text-ds-fg-muted">Small, the floor</p>
        </Tile>
        <Tile label="Buttons">
          <div className="flex flex-wrap items-center gap-ds-8">
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
          <label className="inline-flex items-center gap-ds-8 self-start">
            <span className="text-p text-ds-fg">In the site&apos;s nav</span>
            <DsSwitch defaultChecked />
          </label>
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
