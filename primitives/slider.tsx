"use client";

import * as React from "react";
import { cn } from "../cn";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Pointer drag over an element, reporting where it is as fractions (0–1) of its width and height. */
export function useDrag(onMove: (x: number, y: number) => void) {
  return {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      const el = event.currentTarget;
      // Keep getting moves when the pointer leaves the element; a pointer that can't be captured still works.
      try {
        el.setPointerCapture(event.pointerId);
      } catch {}
      const report = (e: { clientX: number; clientY: number }) => {
        const r = el.getBoundingClientRect();
        onMove(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
      };
      report(event);
      const move = (e: PointerEvent) => report(e);
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    },
  };
}

/** A slider's or picker's thumb: 16px, round, centred on its spot. */
export const DS_SLIDER_THUMB = "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full";

/** A white ring and a thin black line outside it, so the thumb shows on any colour, white and black included. */
export const DS_SLIDER_THUMB_RING = "inset 0 0 0 2px white, 0 0 0 1px black";

/**
 * Parabola slider: one value from 0 to 1 on a 12px
 * track that shows what it gives, left to right (a gradient; the page's
 * border to its text by default), and a thumb in the colour it's on. Above
 * it, its `title` in the text colour and, on the right, its `readout`
 * ("212°", "64", "−6", or a word), so the value can be noted and made again;
 * under it, with `ends`, what the two ends mean, small and muted ("Serious",
 * "Wacky"). Drag it, or use the arrow keys (Shift for bigger steps).
 * Controlled: `value` and `onChange`. The colour picker's hue and brightness
 * bars, a theme's dials and the taste bars are all this one.
 *
 * `vertical`: the bar stands up, 0 at the bottom and 1 at the top, as wide
 * as the track and as tall as its `className` makes it (128px by default),
 * e.g. a volume control that slides up from its button. Title, readout and
 * ends are for the lying-down bar only. Its track gradient runs bottom to top.
 */
export function DsSlider({
  value,
  onChange,
  label,
  title = label,
  readout,
  ends,
  valueText,
  track = "linear-gradient(to right, var(--ds-border), var(--ds-fg))",
  thumb = "var(--ds-fg)",
  vertical = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  /** Its name for assistive tech. */
  label: string;
  /** The name shown above it, when it differs from `label` ("Brightness" for "Buttons brightness"). */
  title?: string;
  /** The value shown above it on the right: "212°", "64", "−6", "Playful". */
  readout?: string;
  /** What the two ends mean, shown under it. */
  ends?: [string, string];
  /** What the value means, for assistive tech ("10% darker"). */
  valueText?: string;
  /** The track: a CSS gradient, left to right. */
  track?: string;
  /** The thumb's colour. */
  thumb?: string;
  /** Standing up: 0 at the bottom, 1 at the top. */
  vertical?: boolean;
  className?: string;
}) {
  const drag = useDrag((x, y) => onChange(vertical ? 1 - y : x));
  const trackImage = vertical ? track.replace("to right", "to top") : track;
  const bar = (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={valueText}
      aria-orientation={vertical ? "vertical" : undefined}
      className={cn("relative cursor-pointer touch-none rounded-full ds-focus", vertical ? "h-full w-3" : "h-3 w-full")}
      style={{ backgroundImage: trackImage }}
      onKeyDown={(event) => {
        const size = event.shiftKey ? 0.1 : 0.02;
        const delta =
          event.key === "ArrowRight" || event.key === "ArrowUp" ? size : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -size : 0;
        if (!delta) return;
        event.preventDefault();
        onChange(clamp(value + delta));
      }}
      {...drag}
    >
      <span className={DS_SLIDER_THUMB} style={{
          boxShadow: DS_SLIDER_THUMB_RING,
          left: vertical ? "50%" : `${value * 100}%`,
          top: vertical ? `${(1 - value) * 100}%` : "50%",
          backgroundColor: thumb,
        }} />
    </div>
  );
  if (vertical) return <div className={cn("flex h-32 justify-center", className)}>{bar}</div>;
  if (readout === undefined && !ends) return <div className={className}>{bar}</div>;
  return (
    <div data-slot="ds-slider" className={cn("flex flex-col gap-ds-8", className)}>
      {readout !== undefined && (
        <div className="flex items-baseline justify-between gap-ds-8 text-p">
          <span className="text-ds-fg">{title}</span>
          <span className="text-ds-fg tabular-nums">{readout}</span>
        </div>
      )}
      {bar}
      {ends && (
        <div className="-mt-1 flex justify-between text-small text-ds-fg-muted">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}
