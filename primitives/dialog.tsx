"use client";

import * as React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";
import { DsField, DsInput } from "./field";

/**
 * Parabola dialog: a modal question that needs an answer before you carry on
 * (unsaved changes, delete, publish). Radix AlertDialog underneath, so focus
 * moves in and stays there, Escape cancels, and focus returns on close.
 *
 * The page frosts behind it (page colour at 60% with a blur, like the menu),
 * and the dialog is a page-colour card with no outline: 16px corners, the
 * raised shadow, 20px padding. H3 title with a close (×) button on its right,
 * P description in muted, then the actions stacked full width with the main
 * one first; Cancel is a plain (grey) button. No icon and no warning colour;
 * a destructive action shows in red (DsButton `destructive`). Fields inside
 * fill its width (`ds-fields-fill`): a dialog is one field wide.
 *
 * On open, focus goes to the dialog itself rather than its first button, so
 * nothing shows a focus ring until you Tab; Escape still cancels.
 */
export function DsDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  dismissible = true,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The actions, usually DsDialogActions. */
  children: React.ReactNode;
  /** Show the × button. Turn off for a dialog that can't be left, e.g. one showing progress. */
  dismissible?: boolean;
  className?: string;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-(--ds-z-menu) bg-ds-bg/60 backdrop-blur-[24px] motion-safe:animate-in motion-safe:fade-in-0" />
        <AlertDialog.Content
          data-slot="ds-dialog"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-(--ds-z-menu) flex w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5",
            "rounded-ds-lg bg-ds-bg p-5 text-ds-fg shadow-ds-raised outline-none ds-fields-fill",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
            className
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertDialog.Title className="min-w-0 flex-1 pt-1.5 text-h3">{title}</AlertDialog.Title>
              {dismissible && (
                <DsButton iconLeft={X} aria-label="Close" className="-mt-0.5 -mr-0.5" onClick={() => onOpenChange(false)} />
              )}
            </div>
            {description ? (
              <AlertDialog.Description className="text-p text-ds-fg-muted">{description}</AlertDialog.Description>
            ) : (
              // Radix wants a description; keep it for screen readers only when there's none to show.
              <AlertDialog.Description className="sr-only">{title}</AlertDialog.Description>
            )}
          </div>
          {children}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** The dialog's buttons, stacked full width. Put the main action first. */
export function DsDialogActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 [&>*]:w-full", className)} {...props} />;
}

/**
 * The common case: a question with one action and Cancel. The action is the
 * primary button, or red with `destructive`. It stays open while `loading`,
 * so close it yourself when the work is done.
 *
 * `confirmWord`: for what can't be undone, a field asks you to type that word
 * (e.g. "delete") and the action stays off until you have.
 */
export function DsConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  destructive,
  loading,
  confirmWord,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: React.ReactNode;
  onConfirm: () => void;
  cancelLabel?: React.ReactNode;
  destructive?: boolean;
  loading?: boolean;
  /** A word to type before the action turns on, e.g. "delete". */
  confirmWord?: string;
}) {
  const [typed, setTyped] = React.useState("");
  // Start empty each time it opens.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }
  const ready = !confirmWord || typed.trim().toLowerCase() === confirmWord.toLowerCase();

  return (
    <DsDialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)} title={title} description={description}>
      {confirmWord && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (ready && !loading) onConfirm();
          }}
        >
          <DsField label={`Type ${confirmWord} to confirm`}>
            <DsInput value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />
          </DsField>
        </form>
      )}
      <DsDialogActions>
        <DsButton variant="primary" destructive={destructive} loading={loading} disabled={!ready} onClick={onConfirm}>
          {confirmLabel}
        </DsButton>
        <AlertDialog.Cancel asChild>
          <DsButton disabled={loading}>
            {cancelLabel}
          </DsButton>
        </AlertDialog.Cancel>
      </DsDialogActions>
    </DsDialog>
  );
}

export const DsDialogCancel = AlertDialog.Cancel;

type ConfirmOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: React.ReactNode;
  destructive?: boolean;
  /** A word to type before the action turns on, for what can't be undone. */
  confirmWord?: string;
};

/**
 * `await confirm({...})` in place of window.confirm, which is blocked or
 * easily dismissed in some browsers (so the action looked dead). Returns the
 * function and the dialog element to render once in the component:
 *
 *   const [confirm, confirmDialog] = useDsConfirm();
 *   if (!(await confirm({ title: "Delete post?", confirmLabel: "Delete", destructive: true }))) return;
 *   …
 *   return <>{…}{confirmDialog}</>;
 */
export function useDsConfirm(): [(options: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [pending, setPending] = React.useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = React.useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    []
  );

  const settle = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  const element = (
    <DsConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => !open && settle(false)}
      title={pending?.title ?? ""}
      description={pending?.description}
      confirmLabel={pending?.confirmLabel ?? ""}
      destructive={pending?.destructive}
      confirmWord={pending?.confirmWord}
      onConfirm={() => settle(true)}
    />
  );

  return [confirm, element];
}
