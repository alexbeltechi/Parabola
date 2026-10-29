"use client";

import * as React from "react";
import { cn } from "../cn";
import { dsHexToHsv, dsHsvToHex } from "../colours";
import { DsField, DsNumberInput } from "../primitives/field";

type Hsv = { h: number; s: number; v: number };

/** One colour on the wheel. */
export type DsWheelPoint = {
  id: string;
  label: string;
  colour: string;
  /** Still based on another colour: drawn as an outline, where a colour of its own is solid. */
  based?: boolean;
  /**
   * The least brightness it takes when dragged round the disc, so a black
   * (text, a button) dragged out becomes a colour rather than staying black.
   */
  floor?: number;
};

// The drawing, in its own pixels: the hue ring, the disc inside it, and the two arcs either side.
const W = 300;
const H = 250;
const CX = W / 2;
const CY = H / 2;
const RING = 100;
const DISC = 92;
const ARC = 124;
const SPAN = 42;

const HUES = "#FF0000, #FF00FF, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000";

/**
 * The hue a white, black or grey is headed: none of them has one, so they point to paper's warm yellow-orange
 * (Parabola's own paper and charcoal sit there), and moving one out from the centre warms it, not reddens it
 * (Alex, 2026-10-29).
 */
const NEUTRAL_HUE = 40;

/** A colour's hue, saturation and brightness, a neutral's hue paper's. */
function toHsv(hex: string): Hsv {
  const hsv = dsHexToHsv(hex);
  return hsv.s === 0 ? { ...hsv, h: NEUTRAL_HUE } : hsv;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (deg: number, r: number) => ({
  x: CX + r * Math.cos(rad(deg)),
  y: CY - r * Math.sin(rad(deg)),
});
// Saturation to distance from the centre on a square root, so the pale colours near white (paper) get room.
const toRadius = (s: number) => Math.sqrt(s) * DISC;
const toSaturation = (r: number) => clamp(r / DISC) ** 2;
// An arc's value (0 at the bottom, 1 at the top) as an angle, and back.
const arcAngle = (side: "left" | "right", t: number) => (side === "right" ? -SPAN + 2 * SPAN * t : 180 + SPAN - 2 * SPAN * t);
function arcValue(side: "left" | "right", deg: number) {
  const d = (deg + 360) % 360;
  return clamp(side === "right" ? ((d > 180 ? d - 360 : d) + SPAN) / (2 * SPAN) : (180 + SPAN - d) / (2 * SPAN));
}

/** The wheel's drawing an element sits in, which every position is measured from. */
const FRAME = "[data-slot=ds-colour-wheel-frame]";

/** Where a pointer is on the drawing: its angle from the centre (degrees, 0 at the right, up is positive) and distance. */
function polar(el: Element, e: { clientX: number; clientY: number }) {
  const r = el.getBoundingClientRect();
  const scale = r.width / W;
  const x = (e.clientX - r.left) / scale - CX;
  const y = (e.clientY - r.top) / scale - CY;
  return {
    deg: ((Math.atan2(-y, x) * 180) / Math.PI + 360) % 360,
    dist: Math.hypot(x, y),
  };
}

// How far a press on a point moves before it's a drag: a click only picks the point.
const SLOP = 3;

/** A drag that reports where the pointer is on the wheel, from the press until it's let go. */
function drag(onMove: (p: { deg: number; dist: number }) => void, slop = 0) {
  return (event: React.PointerEvent<Element>) => {
    const el = event.currentTarget;
    const box = el.closest(FRAME);
    if (!box) return;
    event.preventDefault();
    // What's pressed takes the focus (a hex field being typed in lets go of it, so it shows the new colour).
    (el as HTMLElement | SVGElement).focus({ preventScroll: true });
    // The moves are followed on the window, not just over what was pressed, so the drag holds wherever the
    // pointer goes (a thin arc is easy to slip off, and not every browser captures the pointer for SVG).
    const id = event.pointerId;
    const start = { x: event.clientX, y: event.clientY };
    let moving = slop === 0;
    if (moving) onMove(polar(box, event));
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      if (!moving && Math.hypot(e.clientX - start.x, e.clientY - start.y) < slop) return;
      moving = true;
      onMove(polar(box, e));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
}

/**
 * Parabola colour wheel: a theme's colours as points on one wheel, a hue
 * ring around a disc, red at the right and round through yellow, green and
 * blue. A tick on the ring shows the chosen colour's hue, and dragging
 * round the ring turns it. A point's angle is its hue and its distance from the centre its
 * saturation (white, black and greys at the middle, full colour at the
 * ring). Every point is the same size: the chosen one filled with its
 * colour, the others only a thin black ring. Where they share a spot they
 * stack in the order given, the first on top (the primary, at the centre
 * by default), the chosen one above them all. Choose a colour (`selected`,
 * from a list beside the wheel, or press its point), then drag its point
 * to move it; a click on the disc itself changes nothing. The arc on the left is its saturation, the arc on the
 * right its brightness. The chosen point takes the keyboard: the arrow
 * keys turn its hue (left, right) and saturation (up, down; Shift for
 * bigger steps), and Delete or Backspace, or a double click on a point,
 * hands it to `onRemove`. Controlled:
 * every change goes to `onChange` with the point's id and its new
 * `#RRGGBB`.
 */
export function DsColourWheel({
  points,
  selected,
  onSelect,
  onChange,
  onRemove,
  className,
}: {
  points: DsWheelPoint[];
  /** The colour that clicks, drags and keys move: chosen in a list beside the wheel. */
  selected: string;
  /** A point pressed on the wheel. */
  onSelect: (id: string) => void;
  onChange: (id: string, hex: string) => void;
  /** Delete or Backspace on a chosen point, or a double click on one. */
  onRemove?: (id: string) => void;
  className?: string;
}) {
  // Each point keeps its own hue and saturation, so they survive black, white and greys while it's dragged.
  const [kept, setKept] = React.useState<Record<string, { hex: string; hsv: Hsv }>>({});
  const hsvOf = (p: DsWheelPoint): Hsv => (kept[p.id]?.hex === p.colour ? kept[p.id].hsv : toHsv(p.colour));
  const set = (p: DsWheelPoint, hsv: Hsv) => {
    const next = { h: (hsv.h + 360) % 360, s: clamp(hsv.s), v: clamp(hsv.v) };
    const hex = dsHsvToHex(next.h, next.s, next.v);
    setKept((k) => ({ ...k, [p.id]: { hex, hsv: next } }));
    onChange(p.id, hex);
  };
  const current = points.find((p) => p.id === selected) ?? points[0];
  const hsv = hsvOf(current);

  const pct = (p: { x: number; y: number }) => ({
    left: `${(p.x / W) * 100}%`,
    top: `${(p.y / H) * 100}%`,
  });
  const box = (r: number) => ({
    left: `${((CX - r) / W) * 100}%`,
    top: `${((CY - r) / H) * 100}%`,
    width: `${((2 * r) / W) * 100}%`,
    height: `${((2 * r) / H) * 100}%`,
  });

  const arc = (
    side: "left" | "right",
    value: number,
    label: string,
    readout: string,
    onValue: (t: number) => void,
    from: string,
    to: string
  ) => {
    const a = at(arcAngle(side, 0), ARC);
    const b = at(arcAngle(side, 1), ARC);
    const path = `M ${a.x} ${a.y} A ${ARC} ${ARC} 0 0 ${side === "right" ? 0 : 1} ${b.x} ${b.y}`;
    const tick = arcAngle(side, value);
    const inner = at(tick, ARC - 8);
    const outer = at(tick, ARC + 8);
    const id = `ds-wheel-${side}`;
    return (
      <g
        role="slider"
        tabIndex={0}
        aria-label={`${current.label} ${label.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={readout}
        className="cursor-pointer outline-none"
        onPointerDown={drag(({ deg }) => onValue(arcValue(side, deg)))}
        onKeyDown={(event) => {
          const size = event.shiftKey ? 0.1 : 0.02;
          const delta =
            event.key === "ArrowUp" || event.key === "ArrowRight"
              ? size
              : event.key === "ArrowDown" || event.key === "ArrowLeft"
                ? -size
                : 0;
          if (!delta) return;
          event.preventDefault();
          onValue(clamp(value + delta));
        }}
      >
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={a.y} x2={0} y2={b.y}>
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        {/* A wide invisible stroke to grab, then the arc and its tick. */}
        <path d={path} fill="none" stroke="transparent" strokeWidth={24} />
        <path d={path} fill="none" stroke={`url(#${id})`} strokeWidth={4} strokeLinecap="round" />
        <path
          d={`M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`}
          className="stroke-ds-fg"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div data-slot="ds-colour-wheel" className={cn("flex flex-col gap-ds-8", className)}>
      <div
        data-slot="ds-colour-wheel-frame"
        className="relative mx-auto aspect-[300/250] w-full max-w-[300px] touch-none select-none"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
          {arc(
            "left",
            Math.sqrt(hsv.s),
            "Saturation",
            String(Math.round(hsv.s * 100)),
            (t) => set(current, { ...hsv, s: t * t }),
            dsHsvToHex(hsv.h, 0, Math.max(hsv.v, 0.6)),
            dsHsvToHex(hsv.h, 1, Math.max(hsv.v, 0.6))
          )}
          {arc(
            "right",
            hsv.v,
            "Brightness",
            String(Math.round(hsv.v * 100)),
            (t) => set(current, { ...hsv, v: t }),
            "#000000",
            dsHsvToHex(hsv.h, hsv.s, 1)
          )}
        </svg>
        {/* The hue ring: red at the right, round through yellow, green and blue (a conic gradient runs clockwise). */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            ...box(RING),
            background: `conic-gradient(from 90deg, ${HUES})`,
            mask: "radial-gradient(closest-side, transparent calc(100% - 6px), black calc(100% - 5px))",
          }}
        />
        {/* The disc: a faint wheel, so where a point sits reads as a colour. Clicking it does nothing: colours
            move only by dragging their point, so a stray click never changes one (Alex, 2026-10-29). */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full opacity-[0.22]"
          style={{
            ...box(DISC),
            background: `radial-gradient(closest-side, var(--ds-bg), transparent), conic-gradient(from 90deg, ${HUES})`,
          }}
        />
        {/* The hue: a tick across the ring at the chosen colour's hue, pointing the way it's headed even when it's
            white or grey at the centre. Drag round the ring to turn the hue, as on any colour wheel; its
            saturation and brightness stay (Alex, 2026-10-29). */}
        <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <circle
            role="slider"
            tabIndex={0}
            aria-label={`${current.label} hue`}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            aria-valuetext={`${Math.round(hsv.h)}°`}
            cx={CX}
            cy={CY}
            r={RING - 3}
            fill="none"
            stroke="transparent"
            strokeWidth={16}
            pointerEvents="stroke"
            className="cursor-pointer outline-none"
            onPointerDown={drag(({ deg }) => set(current, { ...hsv, h: deg }))}
            onKeyDown={(event) => {
              const size = event.shiftKey ? 10 : 2;
              const turn =
                event.key === "ArrowLeft" || event.key === "ArrowUp"
                  ? size
                  : event.key === "ArrowRight" || event.key === "ArrowDown"
                    ? -size
                    : 0;
              if (!turn) return;
              event.preventDefault();
              set(current, { ...hsv, h: hsv.h + turn });
            }}
          />
          <path
            d={`M ${at(hsv.h, RING - 12).x} ${at(hsv.h, RING - 12).y} L ${at(hsv.h, RING + 6).x} ${at(hsv.h, RING + 6).y}`}
            className="stroke-ds-fg"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
        {/* The points: all one size, solid or an outline; stacked first on top, the chosen one above all, so the
            one picked in the list can always be grabbed. Press one to choose it, drag it to move it. */}
        {points.map((p, i) => {
          const h = hsvOf(p);
          const chosen = p.id === current.id;
          return (
            <button
              key={p.id}
              type="button"
              tabIndex={chosen ? 0 : -1}
              data-chosen={chosen || undefined}
              aria-label={`${p.label}: ${p.colour}${p.based ? ", based on another" : ""}`}
              aria-pressed={chosen}
              title={p.label}
              className="absolute size-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none active:cursor-grabbing"
              style={{
                ...pct(at(h.h, toRadius(h.s))),
                zIndex: chosen ? points.length + 1 : points.length - i,
                // The chosen point is filled with its colour, ringed white with a line in the text colour outside;
                // the others are only a thin black ring with a faint white line outside it, so they show on a dark wheel
                // too, and the chosen one stands out (Alex, 2026-10-29).
                backgroundColor: chosen ? p.colour : "transparent",
                boxShadow: chosen
                  ? "inset 0 0 0 2px white, 0 0 0 2px var(--ds-fg)"
                  : "inset 0 0 0 1px black, 0 0 0 1px rgb(255 255 255 / 0.3)",
              }}
              onPointerDown={(event) => {
                // Pressing it focuses it (in drag), so Delete and the arrow keys reach it after a click.
                onSelect(p.id);
                drag(({ deg, dist }) => set(p, { h: deg, s: toSaturation(dist), v: Math.max(h.v, p.floor ?? 0) }), SLOP)(event);
              }}
              // A double click restores it, as Delete does.
              onDoubleClick={() => onRemove?.(p.id)}
              onKeyDown={(event) => {
                if ((event.key === "Delete" || event.key === "Backspace") && onRemove) {
                  event.preventDefault();
                  onRemove(p.id);
                  return;
                }
                const size = event.shiftKey ? 10 : 2;
                const turn = event.key === "ArrowLeft" ? size : event.key === "ArrowRight" ? -size : 0;
                const out = event.key === "ArrowUp" ? size / 100 : event.key === "ArrowDown" ? -size / 100 : 0;
                if (!turn && !out) return;
                event.preventDefault();
                set(p, { ...h, h: h.h + turn, s: Math.max(0, Math.sqrt(h.s) + out) ** 2, v: Math.max(h.v, p.floor ?? 0) });
              }}
            />
          );
        })}
      </div>
      {/* The chosen colour in numbers, in the wheel's order: saturation (its left arc), hue (the ring), brightness
          (its right arc); each typed in as well as read, laid out as any field is. */}
      <div className="grid grid-cols-3 gap-ds-8">
        <NumberField
          label="Saturation"
          value={Math.round(hsv.s * 100)}
          max={100}
          onCommit={(n) => set(current, { ...hsv, s: n / 100 })}
        />
        <NumberField
          label="Hue"
          value={Math.round(hsv.h) % 360}
          max={359}
          wrap
          onCommit={(n) => set(current, { ...hsv, h: n })}
        />
        <NumberField
          label="Brightness"
          value={Math.round(hsv.v * 100)}
          max={100}
          onCommit={(n) => set(current, { ...hsv, v: n / 100 })}
        />
      </div>
    </div>
  );
}

/** One of the chosen colour's numbers: a small labelled number field (arrows step it, Shift by 10). */
function NumberField({
  label,
  value,
  max,
  wrap,
  onCommit,
}: {
  label: string;
  value: number;
  max: number;
  wrap?: boolean;
  onCommit: (n: number) => void;
}) {
  return (
    <DsField size="small" label={label} className="w-full">
      <DsNumberInput size="small" value={value} max={max} wrap={wrap} onValueChange={onCommit} />
    </DsField>
  );
}
