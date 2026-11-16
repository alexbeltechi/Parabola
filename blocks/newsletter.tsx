"use client";

import { cn } from "../cn";
import { DsSubscribe } from "../components/subscribe";

export interface DsNewsletterBlockProps {
  heading?: string;
  /** One line under the heading: what people get and how often. */
  text?: string;
  buttonLabel?: string;
  /** The list the sign-up asks for ("news", "studio"); the app decides what that means. */
  list?: string;
  /** Where the sign-up came from, for the list's records. Defaults to the page's path. */
  source?: string;
  /** Shown in place of the form once the address is accepted. */
  thanks?: string;
  /** Where the form posts. The app's own door; the page never learns the provider behind it. */
  endpoint?: string;
  className?: string;
}

/**
 * Parabola newsletter block: a heading, a line of copy and the subscribe form
 * (DsSubscribe). Posts `{ email, list, source }` as JSON to the endpoint and
 * shows the thank-you line in its place on `{ data: { ok } }`. A refusal reads
 * as "Couldn't subscribe: <reason>" under the field. Bots that fill the
 * honeypot never reach the endpoint. Props are data only, so the page builder
 * and an agent can both place it; the page owns its width and the spacing
 * around it.
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
  const subscribe = async (email: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        list,
        source: source || (typeof window === "undefined" ? undefined : window.location.pathname),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data?.ok) throw new Error(json?.error || `The sign-up didn't go through (${res.status})`);
  };

  return (
    <section data-slot="ds-newsletter" className={cn("flex w-full flex-col gap-ds-16", className)}>
      {(heading || text) && (
        <div className="flex flex-col gap-ds-8">
          {heading && <h2 className="text-h2 text-ds-fg">{heading}</h2>}
          {text && <p className="text-p text-ds-fg-muted">{text}</p>}
        </div>
      )}
      <DsSubscribe onSubscribe={subscribe} buttonLabel={buttonLabel} thanks={thanks} />
    </section>
  );
}
