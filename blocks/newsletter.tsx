"use client";

import * as React from "react";
import { cn } from "../cn";
import { DsButton } from "../primitives/button";
import { DsField, DsInput } from "../primitives/field";

export interface DsNewsletterBlockProps {
  heading?: string;
  /** One line under the heading: what people get and how often. */
  text?: string;
  buttonLabel?: string;
  /** The list the sign-up asks for ("beltechi", "y3k"); the CMS decides what that means. */
  list?: string;
  /** Where the sign-up came from, for the list's records. Defaults to the page's path. */
  source?: string;
  /** Shown in place of the form once the address is accepted. */
  thanks?: string;
  /** Where the form posts. The CMS's own door; the page never learns the provider behind it. */
  endpoint?: string;
  className?: string;
}

type State = { kind: "idle" | "sending" | "done" } | { kind: "error"; message: string };

/**
 * Parabola newsletter block: a heading, a line of copy and an email field
 * with one button. Posts `{ email, list, source, website }` as JSON to the
 * endpoint (`website` is the honeypot, a field people never see) and shows
 * the thank-you line in its place on `{ data: { ok } }`. A refusal reads as
 * "Couldn't subscribe: <reason>" under the field. Props are data only, so the
 * page builder and an agent can both place it; the page owns its width and
 * the spacing around it.
 */
export function DsNewsletterBlock({
  heading = "Get new work by email",
  text,
  buttonLabel = "Subscribe",
  list,
  source,
  thanks = "Thanks! Check your inbox to confirm.",
  endpoint = "/api/subscribe",
  className,
}: DsNewsletterBlockProps) {
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [state, setState] = React.useState<State>({ kind: "idle" });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          list,
          source: source || (typeof window === "undefined" ? undefined : window.location.pathname),
          website,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.data?.ok) throw new Error(json?.error || `The sign-up didn't go through (${res.status})`);
      setState({ kind: "done" });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "The sign-up didn't go through" });
    }
  };

  return (
    <section
      data-slot="ds-newsletter"
      data-state={state.kind}
      className={cn("flex w-full flex-col gap-ds-16", className)}
    >
      {(heading || text) && (
        <div className="flex flex-col gap-ds-8">
          {heading && <h2 className="text-h2 text-ds-fg">{heading}</h2>}
          {text && <p className="text-p text-ds-fg-muted">{text}</p>}
        </div>
      )}

      {state.kind === "done" ? (
        <p role="status" className="text-p text-ds-fg">
          {thanks}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-ds-8 sm:flex-row sm:items-start">
          <DsField
            error={state.kind === "error" ? `Couldn't subscribe: ${state.message}` : undefined}
          >
            <DsInput
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              autoComplete="email"
              required
              disabled={state.kind === "sending"}
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
          <DsButton type="submit" variant="primary" loading={state.kind === "sending"}>
            {buttonLabel}
          </DsButton>
        </form>
      )}
    </section>
  );
}
