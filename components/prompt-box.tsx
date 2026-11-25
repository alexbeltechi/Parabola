"use client";

import * as React from "react";
import { ArrowUp, FileText, Mic, Plus, Square } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "../primitives/button";
import { DsPill } from "../primitives/pill";
import { DS_FIELD_INPUT_CLASS } from "../primitives/field";

export interface DsPromptBoxProps {
  /** The text, when the parent holds it. Leave out (or use `defaultValue`) to let the box hold it. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Send: the text and any files added. The box clears itself afterwards unless `value` is controlled. */
  onSubmit?: (prompt: { text: string; files: File[] }) => void;
  placeholder?: string;
  /** The + on the left, for adding files. Off: no +. */
  files?: boolean;
  /** Which files the + offers, as the file input's `accept` ("image/*,.pdf"). */
  accept?: string;
  /** The microphone, before send: called when it's pressed. Leave out and there's no microphone. */
  onVoice?: () => void;
  /** The microphone is listening: drawn pressed. */
  listening?: boolean;
  /** Waiting for a reply: send turns into stop (when `onStop` is given) or a spinner. */
  busy?: boolean;
  onStop?: () => void;
  /** Enter sends (Shift+Enter for a new line). Off by default: Enter adds a line and ⌘/Ctrl+Enter sends. */
  enterSends?: boolean;
  /** A line under the box, e.g. "AI can make mistakes. Check important info." */
  note?: React.ReactNode;
  disabled?: boolean;
  /** Label for the text area, read by screen readers. */
  "aria-label"?: string;
  /**
   * Small: one line, 36px tall, the height of a default button, with small
   * text and small buttons inside, so it can sit in a row of buttons (a
   * toolbar, a call's controls). It doesn't grow into two rows; files and
   * the note are for the default size.
   */
  size?: "default" | "small";
  className?: string;
}

/** Taller than one line of text (22px) and its padding (14px), plus a little: the box goes to two rows. */
const ONE_LINE = 44;
/** How tall the text grows before it scrolls. */
const MAX_TEXT_HEIGHT = 240;

/**
 * Parabola prompt box: where a prompt is typed, as in a chat. Up to 700px wide.
 *
 * On one line it's a single pill: + (add files) on the left, the text, then
 * the microphone and send on the right. As the text runs onto a second line,
 * or a file is added, it opens into two rows: the text (and the files, as
 * pills) across the top, growing with it up to ten lines or so and then
 * scrolling, and + bottom left, microphone and send bottom right. It goes
 * back to one line once it's emptied.
 *
 * The microphone is a text button (no background), send the primary button,
 * off until there's something to send. `note` puts a quiet line under the box.
 * The box sends nothing anywhere itself: `onSubmit` gets the text and files.
 */
export function DsPromptBox({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "Ask anything",
  files: allowFiles = true,
  accept,
  onVoice,
  listening,
  busy,
  onStop,
  enterSends = false,
  note,
  disabled,
  "aria-label": ariaLabel = "Prompt",
  size = "default",
  className,
}: DsPromptBoxProps) {
  const small = size === "small";
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : inner;
  const setValue = (next: string) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };

  const [attached, setAttached] = React.useState<File[]>([]);
  const [tall, setTall] = React.useState(false);
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Grow with the text: measure, then cap (it scrolls past the cap).
  // Two rows once it needs more than one line; one again once it's empty.
  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    if (small) {
      el.style.height = "";
      return;
    }
    el.style.height = "auto";
    const height = el.scrollHeight;
    el.style.height = `${Math.min(height, MAX_TEXT_HEIGHT)}px`;
    if (small || (!value && attached.length === 0)) setTall(false);
    else if (height > ONE_LINE || value.includes("\n") || attached.length > 0) setTall(true);
  }, [value, attached.length, tall, small]);

  const canSend = !disabled && !busy && (value.trim().length > 0 || attached.length > 0);

  const send = () => {
    if (!canSend) return;
    onSubmit?.({ text: value, files: attached });
    if (!controlled) setInner("");
    setAttached([]);
    textRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    const mod = event.metaKey || event.ctrlKey;
    // Small is one line: Enter always sends.
    if (mod || small || (enterSends && !event.shiftKey)) {
      event.preventDefault();
      send();
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setAttached((prev) => [...prev, ...Array.from(list)]);
    textRef.current?.focus();
  };

  const buttonSize = small ? "small" : "default";
  const plus = allowFiles && !small && (
    <>
      <DsButton
        type="button"
        variant="text"
        iconLeft={Plus}
        aria-label="Add files"
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={accept}
        tabIndex={-1}
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );

  const actions = (
    <div className="flex shrink-0 items-center gap-ds-4">
      {onVoice && (
        <DsButton
          type="button"
          variant="text"
          size={buttonSize}
          iconLeft={Mic}
          aria-label={listening ? "Stop dictating" : "Dictate"}
          pressed={listening}
          disabled={disabled}
          onClick={onVoice}
        />
      )}
      {busy && onStop ? (
        <DsButton type="button" variant="primary" size={buttonSize} iconLeft={Square} aria-label="Stop" onClick={onStop} />
      ) : (
        <DsButton
          type="submit"
          variant="primary"
          size={buttonSize}
          iconLeft={ArrowUp}
          aria-label="Send"
          loading={busy}
          disabled={!canSend}
        />
      )}
    </div>
  );

  const text = (
    <textarea
      ref={textRef}
      rows={1}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        DS_FIELD_INPUT_CLASS,
        small
          ? "block h-6 resize-none overflow-hidden py-[3px] text-small leading-[18px] whitespace-nowrap text-ds-fg"
          : "block min-h-[22px] resize-none overflow-y-auto py-[7px] text-p text-ds-fg",
        tall ? "w-full px-2" : small ? "w-full px-2" : "w-full px-1"
      )}
    />
  );

  return (
    <div className={cn("flex w-full max-w-[700px] flex-col items-center gap-ds-8", className)}>
      <form
        data-slot="ds-prompt-box"
        data-state={tall ? "tall" : "single"}
        data-busy={busy || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        onClick={(e) => {
          // A click anywhere on the box (not on a button) puts the cursor in the text.
          if (e.target === e.currentTarget) textRef.current?.focus();
        }}
        onDragOver={(e) => allowFiles && e.preventDefault()}
        onDrop={(e) => {
          if (!allowFiles) return;
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "w-full cursor-text border-[length:var(--ds-field-border-width)] border-ds-field-border bg-ds-field ds-focus-within transition-colors",
          // The pill's ends stay round on one line; two rows keep the same corner, capped.
          "rounded-[min(var(--ds-radius-pill),28px)]",
          // One grid in both layouts, so the text area is never remounted (it keeps focus and the cursor).
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center",
          // Small: 36px with its 2px border, the send button 24px, so 4px around it.
          small ? "h-9 p-1" : "p-ds-8",
          tall
            ? "gap-x-ds-4 gap-y-ds-8 pt-ds-12 [grid-template-areas:'files_files_files'_'text_text_text'_'plus_._actions']"
            : "gap-x-ds-4 [grid-template-areas:'plus_text_actions']",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {attached.length > 0 && (
          <div className="flex flex-wrap gap-ds-8 px-2 [grid-area:files]">
            {attached.map((file, i) => (
              <DsPill
                key={`${file.name}-${i}`}
                iconLeft={FileText}
                onRemove={() => setAttached((prev) => prev.filter((_, j) => j !== i))}
              >
                {file.name}
              </DsPill>
            ))}
          </div>
        )}
        {plus && <div className="flex [grid-area:plus]">{plus}</div>}
        <div className="flex min-w-0 [grid-area:text]">{text}</div>
        <div className="flex justify-end [grid-area:actions]">{actions}</div>
      </form>
      {note && !small && <p className="text-center text-small text-ds-fg-subtle">{note}</p>}
    </div>
  );
}
