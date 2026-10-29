"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "../cn";
import { dsHexToHsv, dsHsvToHex } from "../colours";

type Hsv = { h: number; s: number; v: number };

/** One colour on the wheel: its own (a solid dot) or based on another until moved (a faint one). */
export type DsWheelPoint = { id: string; label: string; colour: string; based?: boolean };

// The drawing, in its own pixels: the hue ring, the disc inside it, and the two arcs either side.
const W = 300;
const H = 250;
const CX = W / 2;
const CY = H / 2;
const RING = 100;
const DISC = 92;
const ARC = 124;
const SPAN = 42;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (deg: number, r: number) => ({ x: CX + r * Math.cos(rad(deg)), y: CY - r * Math.sin(rad(deg)) });
// Saturation to distance from the centre on a square root, so the pale colours near white (paper) get room.
const toRadius = (s: number) => Math.sqrt(s) * DISC;
const toSaturation = (r: number) => clamp(r / DISC) ** 2;
// An arc's value (0 at the bottom, 1 at the top) as an angle, and back.
const arcAngle = (side: "left" | "right", t: number) => (side === "right" ? -SPAN + 2 * SPAN * t : 180 + SPAN - 2 * SPAN * t);
function arcValue(side: "left" | "right", deg: number) {
  const d = (deg + 360) % 360;
  return clamp(side === "right" ? ((d > 180 ? d - 360 : d) + SPAN) / (2 * SPAN) : (180 + SPAN - d) / (2 * SPAN));
}

/** Where a pointer is on the drawing: its angle from the centre (degrees, 0 at the right, up is positive) and distance. */
function polar(el: Element, e: { clientX: number; clientY: number }) {
  const r = el.getBoundingClientRect();
  const scale = r.width / W;
  const x = (e.clientX - r.left) / scale - CX;
  const y = (e.clientY - r.top) / scale - CY;
  return { deg: ((Math.atan2(-y, x) * 180) / Math.PI + 360) % 360, dist: Math.hypot(x, y) };
}

/** The wheel's drawing an element sits in, which every position is measured from. */
const FRAME = "[data-slot=ds-colour-wheel-frame]";

/** A drag that reports where the pointer is on the wheel, from the press until it's let go. */
function drag(onMove: (p: { deg: number; dist: number }) => void) {
  return (event: React.PointerEvent<Element>) => {
    const el = event.currentTarget;
    const box = el.closest(FRAME);
    if (!box) return;
    event.preventDefault();
    try {
      el.setPointerCapture(event.pointerId);
    } catch {}
    onMove(polar(box, event));
    const move = (e: Event) => onMove(polar(box, e as PointerEvent));
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };
}

/**
 * Parabola colour wheel: a theme's colours as points on one wheel, a hue
 * ring around a disc, red at the right and round through yellow, green and
 * blue. A point's angle is its hue and its distance from the centre its
 * saturation (white and greys at the middle, full colour at the ring). The
 * arc on the left is the chosen point's saturation, the arc on the right
 * its brightness. Drag a point, or click it and use the arrow keys (left
 * and right turn the hue, up and down the saturation; Shift for bigger
 * steps). With `onAdd`, hovering the disc shows a plus: click to add the
 * next colour where you clicked. Controlled: every change goes to
 * `onChange` with the point's id and its new `#RRGGBB`.
 */
export function DsColourWheel({
  points,
  selected,
  onSelect,
  onChange,
  onAdd,
  addLabel = "Add a colour",
  className,
}: {
  points: DsWheelPoint[];
  selected: string;
  onSelect: (id: string) => void;
  onChange: (id: string, hex: string) => void;
  /** Adds the next colour at a hue and saturation; leave it out when there's nothing left to add. */
  onAdd?: (hue: number, saturation: number) => void;
  /** What clicking the disc adds, for the plus ("Add Buttons"). */
  addLabel?: string;
  className?: string;
}) {
  // Each point keeps its own hue and saturation, so they survive black, white and greys while it's dragged.
  const [kept, setKept] = React.useState<Record<string, { hex: string; hsv: Hsv }>>({});
  const hsvOf = (p: DsWheelPoint): Hsv => (kept[p.id]?.hex === p.colour ? kept[p.id].hsv : dsHexToHsv(p.colour));
  const set = (p: DsWheelPoint, hsv: Hsv) => {
    const next = { h: (hsv.h + 360) % 360, s: clamp(hsv.s), v: clamp(hsv.v) };
    const hex = dsHsvToHex(next.h, next.s, next.v);
    setKept((k) => ({ ...k, [p.id]: { hex, hsv: next } }));
    onChange(p.id, hex);
  };
  const current = points.find((p) => p.id === selected) ?? points[0];
  const hsv = hsvOf(current);
  const [plus, setPlus] = React.useState<{ x: number; y: number } | null>(null);
  const place = (h: Hsv) => at(h.h, toRadius(h.s));
  const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` });

  const arc = (side: "left" | "right", value: number, label: string, readout: string, onValue: (t: number) => void, from: string, to: string) => {
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
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={readout}
        className="cursor-pointer outline-none"
        onPointerDown={drag(({ deg }) => onValue(arcValue(side, deg)))}
        onKeyDown={(event) => {
          const size = event.shiftKey ? 0.1 : 0.02;
          const delta = event.key === "ArrowUp" || event.key === "ArrowRight" ? size : event.key === "ArrowDown" || event.key === "ArrowLeft" ? -size : 0;
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
        <path d={`M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`} className="stroke-ds-fg" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <div data-slot="ds-colour-wheel" className={cn("flex flex-col gap-ds-8", className)}>
      <div data-slot="ds-colour-wheel-frame" className="relative mx-auto aspect-[300/250] w-full max-w-[300px] touch-none select-none">
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
            left: `${((CX - RING) / W) * 100}%`,
            top: `${((CY - RING) / H) * 100}%`,
            width: `${((2 * RING) / W) * 100}%`,
            height: `${((2 * RING) / H) * 100}%`,
            background: "conic-gradient(from 90deg, #FF0000, #FF00FF, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)",
            mask: "radial-gradient(closest-side, transparent calc(100% - 6px), black calc(100% - 5px))",
          }}
        />
        {/* The disc: a faint wheel, so where a point sits reads as a colour; clicking it adds the next one. */}
        <div
          aria-hidden
          className={cn("absolute rounded-full", onAdd ? "cursor-none" : "")}
          style={{
            left: `${((CX - DISC) / W) * 100}%`,
            top: `${((CY - DISC) / H) * 100}%`,
            width: `${((2 * DISC) / W) * 100}%`,
            height: `${((2 * DISC) / H) * 100}%`,
            background:
              "radial-gradient(closest-side, var(--ds-bg), transparent), conic-gradient(from 90deg, #FF0000, #FF00FF, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)",
            opacity: 0.22,
          }}
          onPointerMove={(e) => {
            const box = e.currentTarget.closest(FRAME);
            if (!onAdd || !box) return;
            const r = box.getBoundingClientRect();
            setPlus({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
          }}
          onPointerLeave={() => setPlus(null)}
          onClick={(e) => {
            const box = e.currentTarget.closest(FRAME);
            if (!onAdd || !box) return;
            const { deg, dist } = polar(box, e);
            onAdd(deg, toSaturation(dist));
          }}
        />
        {plus && onAdd && (
          <span
            aria-hidden
            className="pointer-events-none absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ds-button text-ds-on-button"
            style={pct(plus)}
            title={addLabel}
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </span>
        )}
        {/* The points, the chosen one last so it's on top. */}
        {[...points.filter((p) => p.id !== current.id), current].map((p) => {
          const h = hsvOf(p);
          const chosen = p.id === current.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-label={`${p.label}: ${p.colour}`}
              aria-pressed={chosen}
              title={p.label}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ds-fg focus-visible:ring-offset-2",
                chosen ? "size-5" : "size-3.5",
                p.based && !chosen && "opacity-50"
              )}
              style={{
                ...pct(place(h)),
                backgroundColor: p.colour,
                // A white ring and a thin black line outside it, so a point shows on any colour.
                boxShadow: "inset 0 0 0 2px white, 0 0 0 1px black",
              }}
              onPointerDown={(event) => {
                onSelect(p.id);
                drag(({ deg, dist }) => set(p, { ...h, h: deg, s: toSaturation(dist) }))(event);
              }}
              onKeyDown={(event) => {
                const size = event.shiftKey ? 10 : 2;
                const turn = event.key === "ArrowLeft" ? size : event.key === "ArrowRight" ? -size : 0;
                const out = event.key === "ArrowUp" ? size / 100 : event.key === "ArrowDown" ? -size / 100 : 0;
                if (!turn && !out) return;
                event.preventDefault();
                onSelect(p.id);
                set(p, { ...h, h: h.h + turn, s: Math.max(0, Math.sqrt(h.s) + out) ** 2 });
              }}
            />
          );
        })}
      </div>
      <div className="flex items-baseline justify-between text-small tabular-nums">
        <span className="text-ds-fg-muted">
          Saturation <span className="text-ds-fg">{Math.round(hsv.s * 100)}</span>
        </span>
        <span className="text-ds-fg-muted">
          Brightness <span className="text-ds-fg">{Math.round(hsv.v * 100)}</span>
        </span>
      </div>
    </div>
  );
}
