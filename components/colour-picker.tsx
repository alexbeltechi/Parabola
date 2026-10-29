"use client";

import * as React from "react";
import { cn } from "../cn";
import { dsHexToHsl, dsHexToHsv, dsHslToHex, dsHsvToHex, dsNormalizeHex, dsWarmth, dsWithWarmth } from "../colours";
import { DsInput } from "../primitives/field";
import { DS_SLIDER_THUMB, DS_SLIDER_THUMB_RING, DsSlider, useDrag } from "../primitives/slider";

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** A colour's hue, saturation and brightness; a white, black or grey has no hue, so it starts at paper's warm 40°. */
function toHsv(hex: string): Hsv {
  const hsv = dsHexToHsv(hex);
  return hsv.s === 0 ? { ...hsv, h: 40 } : hsv;
}

const THUMB = DS_SLIDER_THUMB;
const THUMB_RING = DS_SLIDER_THUMB_RING;

/** The picker's hue, warmth and brightness bars, and a theme's dials: Parabola's slider (primitives/slider.tsx). */
export const DsColourBar = DsSlider;

/**
 * Parabola colour picker, inline (no pop-up): a square for saturation (left
 * to right) and brightness (bottom to top) in the chosen hue, the hex right
 * under it (typed or pasted), a hue bar of the whole rainbow, a warmth bar
 * from cold to warm (white balance, for a page colour: white to
 * paper), and a brightness bar from black through the colour to white (all
 * DsColourBar). Drag any of them, or use the arrow keys on them (Shift for bigger steps). Every change is reported at
 * once, so whatever wears the colour follows live. Controlled: `value` is a
 * `#RRGGBB`, `onChange` gets the new one.
 */
export function DsColourPicker({
  value,
  onChange,
  className,
  warmth = true,
  "aria-label": label,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  /** The warmth bar, between hue and brightness (on by default). */
  warmth?: boolean;
  /** What the colour is for, naming the picker's group. */
  "aria-label"?: string;
}) {
  // The picker keeps its own hue and saturation, so they survive black, white and greys.
  const [hsv, setHsv] = React.useState<Hsv>(() => toHsv(value));
  const [text, setText] = React.useState(value);
  const [editing, setEditing] = React.useState(false);
  const shown = dsHsvToHex(hsv.h, hsv.s, hsv.v);
  // A new value from outside (a preset picked) moves the picker to it.
  const [last, setLast] = React.useState(value);
  if (value !== last) {
    setLast(value);
    if (value !== shown) setHsv(toHsv(value));
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
      <DsColourBar
        label="Hue"
        readout={`${Math.round(hsv.h) % 360}°`}
        value={hsv.h / 360}
        onChange={(x) => set({ ...hsv, h: x * 360 })}
        track="linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"
        thumb={dsHsvToHex(hsv.h, 1, 1)}
      />
      {warmth && (
        <DsColourBar
          label="Warmth"
          readout={String(Math.round(dsWarmth(shown) * 100))}
          value={dsWarmth(shown)}
          onChange={(w) => {
            const hex = dsWithWarmth(shown, w);
            setHsv(dsHexToHsv(hex));
            setLast(hex);
            onChange(hex);
          }}
          valueText={dsWarmth(shown) > 0.52 ? "Warm" : dsWarmth(shown) < 0.48 ? "Cold" : "Neither"}
          track={`linear-gradient(to right, ${dsWithWarmth(shown, 0)}, ${dsWithWarmth(shown, 0.5)}, ${dsWithWarmth(shown, 1)})`}
          thumb={shown}
        />
      )}
      <DsColourBar
        label="Brightness"
        readout={String(Math.round(light * 100))}
        value={light}
        onChange={(l) => {
          const hex = dsHslToHex(hsv.h, sat || hsv.s, l);
          // Keep the hue: black and white have none of their own.
          set({ ...dsHexToHsv(hex), h: hsv.h });
        }}
        track={`linear-gradient(to right, #000000, ${pure}, #FFFFFF)`}
        thumb={shown}
      />
    </div>
  );
}
