"use client";

/**
 * A board: things laid out on one large surface, as a design tool shows a
 * file, to drag around and zoom. Scroll to move around (or hold Space and
 * drag, as in Figma), pinch or ⌘-scroll to zoom toward the pointer, or use
 * the − and +. The Theme page shows the open theme on it (theme-section.tsx).
 */

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DS_THEME_SCOPE } from "../theme";

/** A frame on a board: its name, its width in px, and what it draws. `themed: false` is someone else's surface (a search page), not the style's. */
export type BoardFrame = {
  name: string;
  width: number;
  render: () => React.ReactNode;
  themed?: boolean;
  /** `false`: the frame draws its own edge (a phone, a rounded post); the board adds no ground, shadow or clipping. */
  chrome?: boolean;
};
/** The line round a frame that draws its own edge: very faint, so the edge shows on a ground of its own colour and nothing more. */
export const BOARD_OUTLINE = "inset 0 0 0 1px rgb(128 128 128 / 0.2)";

/** That line, over whatever the frame holds (an inset shadow alone would sit under its pictures). */
export function BoardOutline() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ boxShadow: BOARD_OUTLINE }} />;
}

/** A row of a board: a kind of thing, and the frames it's seen in. */
export type BoardRow = { name: string; frames: BoardFrame[]; /** Room between its frames, in px; 120 unless said. */ gap?: number };

const ZOOMS = [0.05, 0.1, 0.15, 0.25, 0.33, 0.5, 0.67, 0.8, 1];
const MIN_ZOOM = 0.05;
/** Empty board round the frames, in px, so there is always room to move and a zoom can keep its point still even zoomed right out. */
const ROOM = 1200;
const MAX_ZOOM = 1;
const START_ZOOM = 0.33;

/**
 * The surface a board is laid out on: rows of frames to drag around and zoom
 * (pinch or ⌘-scroll, or the − and +). The Board's pages and the Social
 * board's posts both sit on it.
 */
export function BoardSurface({ rows, mode, startZoom = START_ZOOM }: { rows: BoardRow[]; mode?: "light" | "dark" | null; startZoom?: number }) {
  const [zoom, setZoom] = React.useState(startZoom);
  const scroller = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  // Space held: the next drag moves the board, as in Figma. Otherwise a drag is free for what the frames hold.
  const [space, setSpace] = React.useState(false);

  /**
   * Zooming keeps one point still: the one under the pointer, or the middle
   * of the view for the − and +. It's held as a share of the frame there (or
   * the nearest one), and after the new zoom is drawn the board is scrolled so
   * that share of the frame is back under that point.
   */
  const anchor = React.useRef<{ node: HTMLElement; fx: number; fy: number; x: number; y: number } | null>(null);
  const zoomAt = React.useCallback((next: (z: number) => number, x: number, y: number) => {
    const frames = [...(content.current?.querySelectorAll<HTMLElement>("[data-slot=ds-board-frame]") ?? [])];
    const distance = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
    };
    const node = frames.reduce<HTMLElement | null>((best, el) => (!best || distance(el) < distance(best) ? el : best), null) ?? content.current;
    if (node) {
      const r = node.getBoundingClientRect();
      anchor.current = { node, fx: (x - r.left) / r.width, fy: (y - r.top) / r.height, x, y };
    }
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next(z) * 1000) / 1000)));
  }, []);
  React.useLayoutEffect(() => {
    const a = anchor.current;
    const el = scroller.current;
    if (!a || !el) return;
    anchor.current = null;
    const r = a.node.getBoundingClientRect();
    el.scrollLeft += r.left + a.fx * r.width - a.x;
    el.scrollTop += r.top + a.fy * r.height - a.y;
  }, [zoom]);

  const middle = () => {
    const r = scroller.current!.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2] as const;
  };
  const step = (dir: 1 | -1) =>
    zoomAt(
      (z) => {
        const i = ZOOMS.findIndex((v) => v >= z - 0.001);
        return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? ZOOMS.length - 1 : i) + dir))];
      },
      ...middle(),
    );

  // Pinch, or ⌘/Ctrl and the wheel, zooms toward the pointer; the page itself must not. A pinch comes as many small
  // steps and a wheel as a few big ones, so each is capped and turned into a smooth factor.
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.01);
      zoomAt((z) => z * factor, e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  React.useEffect(() => {
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || typing(e.target)) return;
      e.preventDefault();
      setSpace(true);
    };
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpace(false);
    const blur = () => setSpace(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // The board's own scrollbars: thin, over it, shown while it moves and gone a moment after, as the system's overlay
  // bars are. The browser's are hidden, since a setting can make them wide and always there.
  const [bars, setBars] = React.useState({ x: { at: 0, size: 1 }, y: { at: 0, size: 1 }, shown: false });
  const hide = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const measure = React.useCallback((show: boolean) => {
    const el = scroller.current;
    if (!el) return;
    const axis = (pos: number, view: number, full: number) => ({ at: full > view ? pos / full : 0, size: full > view ? view / full : 1 });
    setBars((b) => ({ x: axis(el.scrollLeft, el.clientWidth, el.scrollWidth), y: axis(el.scrollTop, el.clientHeight, el.scrollHeight), shown: show || b.shown }));
    if (show) {
      if (hide.current) clearTimeout(hide.current);
      hide.current = setTimeout(() => setBars((b) => ({ ...b, shown: false })), 900);
    }
  }, []);
  React.useEffect(() => {
    measure(false);
    return () => {
      if (hide.current) clearTimeout(hide.current);
    };
  }, [measure, zoom]);

  // How much of the board's left runs under the showcase's sidebar (frosted, so it shows through): the board opens
  // clear of it, and its zoom sits beside it.
  const [under, setUnder] = React.useState(0);
  React.useLayoutEffect(() => {
    const measure = () => {
      const el = scroller.current;
      const sidebar = document.querySelector("[data-slot=ds-sidebar]");
      if (!el) return 0;
      const right = sidebar && getComputedStyle(sidebar).display !== "none" ? sidebar.getBoundingClientRect().right : 0;
      const next = Math.max(0, Math.round(right - el.getBoundingClientRect().left));
      setUnder(next);
      return next;
    };
    // Open on the first frame, a little in from the corner (and from the sidebar), not on the empty board round it.
    const el = scroller.current;
    const first = measure();
    if (el) {
      el.scrollLeft = ROOM - 48 - first;
      el.scrollTop = ROOM - 48;
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // What the names are sized against: the zoom, but never below a quarter.
  const label = Math.max(zoom, 0.25);

  const stop = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <>
      <div
        ref={scroller}
        data-slot="ds-board"
        className={`absolute inset-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${dragging ? "cursor-grabbing select-none" : space ? "cursor-grab select-none" : ""}`}
        onScroll={() => measure(true)}
        onPointerDown={(e) => {
          // Space and a drag, or the middle button, moves the board; anything else is the frames' own.
          if (!(e.button === 1 || (e.button === 0 && space))) return;
          e.preventDefault();
          const el = scroller.current!;
          drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
          el.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const el = scroller.current!;
          el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
          el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <div className="w-max" style={{ padding: ROOM }}>
        <div ref={content} className="flex w-max flex-col" style={{ zoom, gap: 120 }}>
          {rows.map((row) => (
            <div key={row.name} className="flex flex-col" style={{ gap: 28 / label }}>
              {/* Names stay one size on screen down to a quarter zoom, then shrink with the board, so zoomed right out
                  they don't crowd the frames. A frame's name stops at its frame's edge. */}
              <div className="whitespace-nowrap text-ds-fg" style={{ fontSize: 15 / label, lineHeight: 1.2 }}>
                {row.name}
              </div>
              <div className="flex items-start" style={{ gap: row.gap ?? 20 }}>
                {row.frames.map((frame) => (
                  <div key={frame.name} className="flex shrink-0 flex-col" style={{ gap: 10 / label, width: frame.width }}>
                    <div className="truncate text-ds-fg-subtle" style={{ fontSize: 12 / label, lineHeight: 1.2 }}>
                      {frame.name}
                    </div>
                    <div
                      data-slot="ds-board-frame"
                      // Each frame its own layer: a bar pinned inside it never rises over another frame or the board's names.
                      data-ds-mode={frame.themed === false ? undefined : (mode ?? undefined)}
                      className={`isolate ${frame.themed === false ? "" : DS_THEME_SCOPE} ${frame.chrome === false ? "" : `${frame.themed === false ? "" : "bg-ds-bg"} overflow-hidden shadow-ds-raised`}`}
                      style={{ width: frame.width }}
                    >
                      {frame.render()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* The scrollbars, over the board's right and bottom edges. */}
      {(["x", "y"] as const).map((a) =>
        bars[a].size < 1 ? (
          <div
            key={a}
            aria-hidden
            className={`pointer-events-none absolute rounded-full bg-ds-fg transition-opacity duration-300 ${bars.shown || dragging ? "opacity-30" : "opacity-0"}`}
            style={
              a === "x"
                ? { bottom: 3, height: 6, left: `calc(${4 + under}px + (100% - ${8 + under}px) * ${bars.x.at})`, width: `calc((100% - ${8 + under}px) * ${bars.x.size})` }
                : { right: 3, width: 6, top: `calc(4px + (100% - 8px) * ${bars.y.at})`, height: `calc((100% - 8px) * ${bars.y.size})` }
            }
          />
        ) : null,
      )}

      {/* Zoom, in the board's corner, over it. */}
      <div className="absolute bottom-4 flex items-center gap-ds-4 rounded-ds-pill bg-ds-bg p-1 shadow-ds-raised" style={{ left: 16 + under }}>
        <DsButton size="small" variant="text" iconLeft={Minus} aria-label="Zoom out" onClick={() => step(-1)} />
        <button type="button" className="min-w-12 text-center text-small text-ds-fg tabular-nums" onClick={() => zoomAt(() => startZoom, ...middle())} title="Back to the starting zoom">
          {Math.round(zoom * 100)}%
        </button>
        <DsButton size="small" variant="text" iconLeft={Plus} aria-label="Zoom in" onClick={() => step(1)} />
      </div>
    </>
  );
}
