"use client";

import * as React from "react";
import { cn } from "../cn";
import { DsButton } from "../primitives/button";
import { DsField, DsInput } from "../primitives/field";

export interface DsSubscribeProps {
  /**
   * Called with the address. Resolve when it's accepted; throw (or reject)
   * with an Error whose message says why not, and it reads as
   * "Couldn't subscribe: <message>" under the field.
   */
  onSubscribe: (email: string) => void | Promise<void>;
  buttonLabel?: string;
  placeholder?: string;
  /** A reason to show under the field straight away, as "Couldn't subscribe: <error>" (e.g. one the page already knows). */
  error?: string;
  /** Shown in place of the form once the address is accepted. */
  thanks?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

type State = { kind: "idle" | "sending" | "done" } | { kind: "error"; message: string };

/**
 * Parabola subscribe: an email field and one primary button, side by side
 * from `sm` up and stacked below it, then a thank-you line in its place.
 * It sends nothing itself: `onSubscribe` decides where the address goes (the
 * Newsletter block posts it to the app). A hidden honeypot field is filled
 * only by bots; when it is, the form pretends to succeed and calls nothing.
 */
export function DsSubscribe({
  onSubscribe,
  buttonLabel = "Subscribe",
  placeholder = "you@example.com",
  error,
  thanks = "Thanks! Check your inbox to confirm.",
  disabled,
  className,
}: DsSubscribeProps) {
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [state, setState] = React.useState<State>({ kind: "idle" });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (website) {
      setState({ kind: "done" });
      return;
    }
    setState({ kind: "sending" });
    try {
      await onSubscribe(email.trim());
      setState({ kind: "done" });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "The sign-up didn't go through" });
    }
  };

  const message = state.kind === "error" ? state.message : state.kind === "idle" ? error : undefined;

  if (state.kind === "done") {
    return (
      <p data-slot="ds-subscribe" data-state="done" role="status" className={cn("text-p text-ds-fg", className)}>
        {thanks}
      </p>
    );
  }

  return (
    <form
      data-slot="ds-subscribe"
      data-state={state.kind}
      onSubmit={submit}
      className={cn("relative flex flex-col gap-ds-8 sm:flex-row sm:items-start", className)}
    >
      <DsField error={message ? `Couldn't subscribe: ${message}` : undefined}>
        <DsInput
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="Email address"
          autoComplete="email"
          required
          disabled={disabled || state.kind === "sending"}
        />
      </DsField>
      {/* The honeypot: off-screen, skipped by the tab order, filled only by bots. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] size-px opacity-0"
      />
      <DsButton type="submit" variant="primary" loading={state.kind === "sending"} disabled={disabled}>
        {buttonLabel}
      </DsButton>
    </form>
  );
}
