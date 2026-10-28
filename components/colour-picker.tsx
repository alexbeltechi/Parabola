"use client";

import * as React from "react";
import { cn } from "../cn";
import { dsHexToHsl, dsHexToHsv, dsHslToHex, dsHsvToHex, dsNormalizeHex } from "../colours";
import { DsInput } from "../primitives/field";

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Pointer drag over an element, reporting where it is as fractions (0–1) of its width and height. */
function useDrag(onMove: (x: number, y: number) => void) {
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

const THUMB = "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full";

/** A white ring and a thin black line outside it, so the thumb shows on any colour, white and black included. */
const THUMB_RING = "inset 0 0 0 2px white, 0 0 0 1px black";

/**
 * Parabola colour bar: a slider whose track shows the colours it gives, left
 * to right, and a thumb in the colour it's on. The colour picker's hue and
 * brightness are both one, and so is a theme colour's shift from what it's
 * based on. Drag it, or use the arrow keys (Shift for bigger steps).
 * Controlled: `value` from 0 to 1.
 */
export function DsColourBar({
  value,
  onChange,
  track,
  thumb,
  label,
  valueText,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  /** The track: a CSS gradient, left to right. */
  track: string;
  /** The thumb's colour. */
  thumb: string;
  label: string;
  /** What the value means, for assistive tech ("10% darker"). */
  valueText?: string;
  className?: string;
}) {
  const drag = useDrag((x) => onChange(x));
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={valueText}
      className={cn("relative h-3 w-full cursor-pointer touch-none rounded-full ds-focus", className)}
      style={{ backgroundImage: track }}
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
      <span className={THUMB} style={{ boxShadow: THUMB_RING, left: `${value * 100}%`, top: "50%", backgroundColor: thumb }} />
    </div>
  );
}

/**
 * Parabola colour picker, inline (no pop-up): a square for saturation (left
 * to right) and brightness (bottom to top) in the chosen hue, a hue bar of
 * the whole rainbow, a brightness bar from black through the colour to
 * white (both DsColourBar), and the hex, typed or pasted. Drag either, or use the
 * arrow keys on them (Shift for bigger steps). Every change is reported at
 * once, so whatever wears the colour follows live. Controlled: `value` is a
 * `#RRGGBB`, `onChange` gets the new one.
 */
export function DsColourPicker({
  value,
  onChange,
  className,
  "aria-label": label,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  /** What the colour is for, naming the picker's group. */
  "aria-label"?: string;
}) {
  // The picker keeps its own hue and saturation, so they survive black, white and greys.
  const [hsv, setHsv] = React.useState<Hsv>(() => dsHexToHsv(value));
  const [text, setText] = React.useState(value);
  const [editing, setEditing] = React.useState(false);
  const shown = dsHsvToHex(hsv.h, hsv.s, hsv.v);
  // A new value from outside (a preset picked) moves the picker to it.
  const [last, setLast] = React.useState(value);
  if (value !== last) {
    setLast(value);
    if (value !== shown) setHsv(dsHexToHsv(value));
  }

  const set = (next: Hsv) => {
    setHsv(next);
    const hex = dsHsvToHex(next.h, next.s, next.v);
    setLast(hex);
    onChange(hex);
  };

  const area = useDrag((x, y) => set({ ...hsv, s: x, v: 1 - y }));
  // Brightness as lightness: black at the left, the colour in the middle, white at the right.
  const [, sat, light] = dsHexToHsl(shown);
  const pure = dsHslToHex(hsv.h, sat || hsv.s, 0.5);

  const step = (event: React.KeyboardEvent) => {
    const size = event.shiftKey ? 0.1 : 0.02;
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp" ? size : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -size : 0;
    if (!delta) return;
    event.preventDefault();
    // In the square, left and right are saturation, up and down brightness.
    const key = event.key === "ArrowUp" || event.key === "ArrowDown" ? "v" : "s";
    set({ ...hsv, [key]: clamp(hsv[key] + delta) });
  };

  return (
    <div data-slot="ds-colour-picker" role="group" aria-label={label} className={cn("flex flex-col gap-ds-16", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuetext={shown}
        aria-valuenow={Math.round(hsv.s * 100)}
        className="relative h-24 w-full cursor-crosshair touch-none rounded-ds-md ds-focus"
        style={{
          backgroundColor: dsHsvToHex(hsv.h, 1, 1),
          backgroundImage: "linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent)",
        }}
        onKeyDown={step}
        {...area}
      >
        <span className={THUMB} style={{ boxShadow: THUMB_RING, left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: shown }} />
      </div>
      <DsColourBar
        label="Hue"
        value={hsv.h / 360}
        onChange={(x) => set({ ...hsv, h: x * 360 })}
        track="linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"
        thumb={dsHsvToHex(hsv.h, 1, 1)}
      />
      <DsColourBar
        label="Brightness"
        value={light}
        onChange={(l) => {
          const hex = dsHslToHex(hsv.h, sat || hsv.s, l);
          // Keep the hue: black and white have none of their own.
          set({ ...dsHexToHsv(hex), h: hsv.h });
        }}
        track={`linear-gradient(to right, #000000, ${pure}, #FFFFFF)`}
        thumb={shown}
      />
      <DsInput
        aria-label="Hex"
        className="w-full font-mono"
        value={editing ? text : shown}
        onFocus={() => {
          setText(shown);
          setEditing(true);
        }}
        onBlur={() => setEditing(false)}
        onChange={(e) => {
          setText(e.target.value);
          const hex = dsNormalizeHex(e.target.value);
          if (hex) {
            setHsv(dsHexToHsv(hex));
            setLast(hex);
            onChange(hex);
          }
        }}
        placeholder="#FFE35A"
      />
    </div>
  );
}
