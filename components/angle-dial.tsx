"use client";

import * as React from "react";
import { cn } from "../cn";

/**
 * Parabola angle dial, as Photoshop sets a light's direction: a small circle
 * with a line from its centre to the angle, 0° at the right and 90° straight
 * up (counter-clockwise, as Photoshop has it), and the angle beside it. Drag
 * anywhere on it, or use the arrow keys (Shift for 15° steps). Controlled:
 * `value` in whole degrees, 0 to 359.
 */
export function DsAngleDial({
  value,
  onChange,
  label,
  className,
}: {
  value: number;
  onChange: (degrees: number) => void;
  label: string;
  className?: string;
}) {
  const at = (event: { clientX: number; clientY: number }, el: Element) => {
    const r = el.getBoundingClientRect();
    const deg = (Math.atan2(-(event.clientY - (r.top + r.height / 2)), event.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    return Math.round((deg + 360) % 360);
  };
  const rad = (value * Math.PI) / 180;
  return (
    <div className={cn("flex items-center gap-ds-8", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={value}
        aria-valuetext={`${value}°`}
        className="relative size-9 shrink-0 cursor-pointer touch-none rounded-full bg-ds-field shadow-[inset_0_0_0_2px_var(--ds-field-border)] ds-focus"
        onPointerDown={(event) => {
          const el = event.currentTarget;
          event.preventDefault();
          el.focus();
          onChange(at(event, el));
          const move = (e: PointerEvent) => onChange(at(e, el));
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
        onKeyDown={(event) => {
          const size = event.shiftKey ? 15 : 1;
          const turn = event.key === "ArrowUp" || event.key === "ArrowLeft" ? size : event.key === "ArrowDown" || event.key === "ArrowRight" ? -size : 0;
          if (!turn) return;
          event.preventDefault();
          onChange((((value + turn) % 360) + 360) % 360);
        }}
      >
        <svg viewBox="-18 -18 36 36" aria-hidden className="absolute inset-0 size-full">
          <line x1={0} y1={0} x2={Math.cos(rad) * 12} y2={-Math.sin(rad) * 12} className="stroke-ds-fg" strokeWidth={2} strokeLinecap="round" />
          <circle cx={0} cy={0} r={2} className="fill-ds-fg" />
        </svg>
      </div>
      <span className="text-small text-ds-fg tabular-nums">{value}°</span>
    </div>
  );
}
