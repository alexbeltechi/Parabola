"use client";

import * as React from "react";
import { Check, Copy, Download } from "lucide-react";
import { dsBrandKit, dsBrandKitFiles, dsBrandKitPrompt, dsThemeCommands, dsThemeFromPaste } from "../brand-kit";
import { DsAccordion } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsCopyField } from "../primitives/copy-field";
import { DsDialog } from "../primitives/dialog";
import { DsField, DsTextarea } from "../primitives/field";
import { dsToast } from "../primitives/toast";
import { dsZip } from "../zip";
import { useThemeEditor } from "./theme-editor";

/** Where "Claude Design" in the design system's hint opens, with the text copied first. */
const CLAUDE_URL = "https://claude.ai/new";

/**
 * Export, top right of every /parabola page: the open theme, handed over
 * (brand-kit.ts; nothing goes anywhere on its own). The button opens a dialog
 * that leads with the style in words: the whole text, readable, and one
 * button that copies it, to paste at the end of any prompt ("make a website,
 * in this style"). Under it, folded, the other ways out from the same
 * source: the brand kit to download (the guide, Claude's tokens, the CSS and
 * the theme), the design system as one text for Claude Design, the commands
 * that copy the theme and a component into a project (`npx … add`,
 * cli/core.ts), and Parabola's own code, which a paste reads back and
 * applies at once.
 */
export function ThemeExport() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <DsButton size="small" onClick={() => setOpen(true)}>
        Export
      </DsButton>
      <ThemeExportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

/** The Export dialog on its own, for a menu item that opens it (the ⋮ menu on a phone). */
export function ThemeExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { theme, entry, setTheme } = useThemeEditor();
  if (!open) return null;
  return (
    <DsDialog
      open
      onOpenChange={onOpenChange}
      title={`Export ${entry.name}`}
      description="The style in words. Paste it into any agent, after what you want made."
      className="max-h-[calc(100dvh-32px)] w-[min(560px,calc(100vw-32px))] overflow-y-auto"
    >
      <ExportBody theme={theme} name={entry.name} setTheme={setTheme} />
    </DsDialog>
  );
}

function ExportBody({
  theme,
  name,
  setTheme,
}: {
  theme: ReturnType<typeof useThemeEditor>["theme"];
  name: string;
  setTheme: (theme: ReturnType<typeof useThemeEditor>["theme"]) => void;
}) {
  const kit = React.useMemo(() => dsBrandKit(theme, name), [theme, name]);
  const prompt = React.useMemo(() => dsBrandKitPrompt(kit), [kit]);
  const code = React.useMemo(() => JSON.stringify(kit.theme, null, 2), [kit]);
  const commands = React.useMemo(() => dsThemeCommands(kit), [kit]);
  const [copied, setCopied] = React.useState(false);
  const [text, setText] = React.useState(code);
  const [invalid, setInvalid] = React.useState(false);
  // A click in selects it all (copy takes the whole theme, a paste replaces it); the mouse coming up keeps that.
  const justFocused = React.useRef(false);
  // A change made anywhere else shows here.
  const [shown, setShown] = React.useState(code);
  if (code !== shown) {
    setShown(code);
    setText(code);
    setInvalid(false);
  }
  const copyStyle = () =>
    navigator.clipboard.writeText(kit.style).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => dsToast("Couldn't copy: select the text and copy it by hand")
    );
  const download = () => {
    const files = Object.fromEntries(
      Object.entries(dsBrandKitFiles(kit)).map(([path, body]) => [`brand-kit/${path}`, body])
    );
    const url = URL.createObjectURL(new Blob([dsZip(files)], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name} brand kit.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-ds-16">
      <DsButton variant="primary" iconLeft={copied ? Check : Copy} onClick={copyStyle}>
        {copied ? "Copied" : "Copy style"}
      </DsButton>
      {/* The whole text, to read before it's pasted; it selects like any text. */}
      <div
        data-slot="ds-style-text"
        className="rounded-ds-md bg-ds-surface-subtle p-ds-16 text-small whitespace-pre-wrap text-ds-fg select-text [overflow-wrap:anywhere]"
      >
        {kit.style}
      </div>

      <DsAccordion title="More ways to export" defaultOpen={false}>
        <div className="flex flex-col gap-ds-20">
          <div className="flex flex-col gap-ds-8">
            <div className="flex flex-col gap-ds-4">
              <span className="text-p text-ds-fg">Brand kit</span>
              <span className="text-small text-ds-fg-muted">
                Your brand as files: the guide, tokens for Claude and code, the CSS and this theme. Put them wherever you work.
              </span>
            </div>
            <DsButton size="small" iconLeft={Download} className="self-start" onClick={download}>
              Download
            </DsButton>
          </div>
          <DsField
            label="Design system"
            className="w-full"
            description={
              <>
                Paste into{" "}
                <a
                  href={CLAUDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ds-fg underline decoration-ds-border underline-offset-2 hover:decoration-ds-fg"
                  onClick={() => navigator.clipboard.writeText(prompt).then(() => dsToast("Copied: paste it into Claude"))}
                >
                  Claude Design
                </a>{" "}
                or any agent to build your design system with these specifications.
              </>
            }
          >
            <DsCopyField collapsible mono value={prompt} aria-label="Your design system, to paste" />
          </DsField>
          <DsField
            label="Command"
            className="w-full"
            description="In your project's folder: adds this theme's tokens (tokens.css and theme.css, imported from your stylesheet). Then add a component to wear it."
          >
            <DsCopyField collapsible mono value={commands.theme} aria-label="The command that adds this theme" />
          </DsField>
          <DsField
            label="Add a component"
            className="w-full"
            description="Copies the button and the Parabola files it imports into your project (parabola/primitives/button.tsx). Swap button for pill, field and others; `list` shows them all."
          >
            <DsCopyField mono value={commands.component} aria-label="The command that adds the button" />
          </DsField>
          <DsField
            label="Parabola code"
            className="w-full"
            description="This theme as Parabola reads it. Paste one in to open it here: Parabola code, or a design system made from Parabola, back from Claude."
            error={invalid ? "That isn't from Parabola. A design system made elsewhere needs your agent to turn it into a theme." : undefined}
          >
            <DsTextarea
              copyable
              collapsible
              className="font-mono [&_textarea]:text-small"
              spellCheck={false}
              value={text}
              onFocus={(e) => {
                e.currentTarget.select();
                justFocused.current = true;
              }}
              onMouseUp={(e) => {
                if (justFocused.current) e.preventDefault();
                justFocused.current = false;
              }}
              onChange={(e) => {
                setText(e.target.value);
                const pasted = dsThemeFromPaste(e.target.value);
                if (pasted) setTheme(pasted);
                setInvalid(!pasted);
              }}
            />
          </DsField>
        </div>
      </DsAccordion>
    </div>
  );
}
