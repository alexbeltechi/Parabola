"use client";

/**
 * The style as posts, for the Theme page's board: one carousel of five
 * slides and one reel as its key scenes, each a frame laid side by side,
 * with the social rules for the theme's panel. Every frame is drawn
 * from the theme's colours and fonts and from its social rules (social.ts):
 * the frame's shape, the edge line, how text sits on a picture, how few
 * colours, how a slide is signed. So the same controls that change the site
 * change the posts.
 *
 * Lengths in social.ts are given at 1080 wide. A frame is its own size
 * container, so each length is drawn as a share of the frame's width
 * (`len`) and holds at whatever width the frame is shown.
 *
 * The people and copy are Ilo Odena's, the showcase's sample maker.
 */

import * as React from "react";
import { ALargeSmall, AlignCenter, AlignRight, Shapes, BatteryFull, Equal, Heart, House, MessageCircle, Repeat2, Search, Send, Signal, SquarePlay, Wifi, AlignLeft, Baseline, Captions, CircleSlash, Layers2, PenLine, Signature as SignatureIcon, Square, Squircle, Type, WrapText, createLucideIcon, type LucideIcon } from "lucide-react";
import {
  DS_SOCIAL_CHOICES,
  DS_SOCIAL_EDGES,
  DS_SOCIAL_FRAMES,
  DS_SOCIAL_GAP,
  DS_SOCIAL_REEL,
  DS_SOCIAL_TYPE,
  DS_SOCIAL_WIDTH,
  type DsSocial,
} from "../social";
import { DsButton } from "../primitives/button";
import { BoardOutline } from "./board";

const MEDIA = "/parabola/preview";
const NAME = "Ilo Odena";

/** What a slide is drawn on: a colour of the theme's, and the colour its text takes there. */
type Ground = { bg: string; fg: string };
const GROUNDS = {
  page: { bg: "var(--ds-bg)", fg: "var(--ds-fg)" },
  ink: { bg: "var(--ds-fg)", fg: "var(--ds-bg)" },
  accent: { bg: "var(--ds-button)", fg: "var(--ds-on-button)" },
} satisfies Record<string, Ground>;
/** The grounds the carousel's three colour slides take: the page colour first, so it opens looking like the site, then the text colour, then the accent. */
const PALETTE: [Ground, Ground, Ground] = [GROUNDS.page, GROUNDS.ink, GROUNDS.accent];

/** White: what a picture frame's text falls back to, and the platform's own buttons. */
const ON_PICTURE = "#FFFFFF";
/**
 * Text straight on a picture: the page colour, not pure white (paper on a paper theme, white only on a white one).
 * Kept light whatever the page is, a dark one included: its lightness is lifted and its colour held faint.
 */
const PAGE_ON_PICTURE = "oklch(from var(--ds-bg) max(l, 0.9) min(c, 0.05) h)";
/** How a frame's content lines up across it, by the style's alignment. */
const ACROSS = { left: "items-start text-left", centre: "items-center text-center", right: "items-end text-right" } as const;
const ITEMS = { left: "items-start", centre: "items-center", right: "items-end" } as const;

/** A length given at 1080 wide, as a share of the frame's width. */
const len = (n: number) => `${Math.round((n / DS_SOCIAL_WIDTH) * 100000) / 1000}cqw`;
/** The shadow under text straight on a picture, when the style gives it one. */
const SHADOW = `0 ${len(4.5)} ${len(4.5)} rgb(0 0 0 / 0.4), 0 0 ${len(2)} rgb(0 0 0 / 0.4)`;

type Ctx = { s: DsSocial };
type TypeName = keyof typeof DS_SOCIAL_TYPE;
type Place = "top" | "middle" | "bottom";

const type = ({ s }: Ctx, name: TypeName): React.CSSProperties => {
  const t = DS_SOCIAL_TYPE[name];
  const heading = t.heading && s.fonts === "two";
  return {
    fontSize: len(t.size),
    lineHeight: t.leading,
    fontFamily: heading ? "var(--ds-family-heading)" : "var(--ds-family-body)",
    fontWeight: heading ? "var(--ds-weight-h1)" : "var(--ds-weight-p)",
    letterSpacing: 0,
    textWrap: "balance",
  };
};

/** A slide: its shape, its ground (a colour, or a picture), and its content held inside the edge line. */
function Frame({
  ctx,
  height,
  ground,
  picture,
  position,
  dim,
  safe,
  anchor = "top",
  foot,
  over,
  flush,
  children,
}: {
  ctx: Ctx;
  /** The frame's height at 1080 wide. */
  height: number;
  ground?: Ground;
  picture?: string;
  /** Which part of the picture shows (CSS object-position). */
  position?: string;
  /** Darken the picture a little, so text reads on it (a reel). */
  dim?: boolean;
  /** Room kept clear at the top, the bottom and the right, at 1080 wide (a reel's safe areas). */
  safe?: { top: number; bottom: number; right?: number };
  /** Drawn over everything: what the app puts on top of the post (a reel's buttons). */
  over?: React.ReactNode;
  /** Edge to edge inside something else (a phone's screen): no corners and no line of its own. */
  flush?: boolean;
  /** Where the content sits between the edge lines. */
  anchor?: Place;
  /** What sits on the bottom edge line, under the content (the signature). */
  foot?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { s } = ctx;
  const edge = DS_SOCIAL_EDGES[s.edge];
  const inset = { top: len(Math.max(edge, safe?.top ?? 0)), right: len(Math.max(edge, safe?.right ?? 0)), bottom: len(Math.max(edge, safe?.bottom ?? 0)), left: len(edge) };
  const across = ACROSS[s.align];
  return (
    <div
      className={`relative overflow-hidden ${flush ? "" : "rounded-ds-lg"}`}
      style={{ containerType: "inline-size", aspectRatio: `${DS_SOCIAL_WIDTH} / ${height}`, background: ground?.bg ?? "#000000", color: ground?.fg ?? ON_PICTURE }}
    >
      {picture && (
        <img src={picture} alt="" draggable={false} className="absolute inset-0 size-full object-cover" style={{ objectPosition: position }} />
      )}
      {dim && <div className="absolute inset-0" style={{ background: "rgb(0 0 0 / 0.2)" }} />}
      <div className={`absolute flex flex-col ${across}`} style={inset}>
        <div className={`flex min-h-0 w-full flex-1 flex-col ${across} ${anchor === "bottom" ? "justify-end" : anchor === "middle" ? "justify-center" : "justify-start"}`}>{children}</div>
        {foot}
      </div>
      {over}
      {/* A very faint line round the frame, so its edge shows on a ground of its own colour. */}
      {!flush && <BoardOutline />}
    </div>
  );
}

/**
 * A text box as wide as its words. A box around wrapped text is otherwise as
 * wide as the room it had, with empty box after the longest line; this
 * measures the lines and sets the box to the longest.
 */
function Hug({ dep, style, children }: { dep: string; style: React.CSSProperties; children: React.ReactNode }) {
  const box = React.useRef<HTMLSpanElement>(null);
  const words = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    const b = box.current;
    const w = words.current;
    if (!b || !w) return;
    let live = true;
    const fit = () => {
      if (!live) return;
      b.style.width = "";
      const lines = [...w.getClientRects()];
      const outer = b.getBoundingClientRect();
      if (!lines.length || !outer.width) return;
      // Measured sizes are scaled when the page is zoomed; the box's own width isn't.
      const scale = b.offsetWidth / outer.width;
      const longest = Math.max(...lines.map((r) => r.right)) - Math.min(...lines.map((r) => r.left));
      const css = getComputedStyle(b);
      b.style.width = `${Math.ceil(longest * scale + parseFloat(css.paddingLeft) + parseFloat(css.paddingRight)) + 1}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    // The frame can change width (a narrower window): fit again.
    const observer = new ResizeObserver(fit);
    if (b.parentElement) observer.observe(b.parentElement);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [dep, children]);
  return (
    <span ref={box} className="block w-fit max-w-[82%]" style={style}>
      <span ref={words}>{children}</span>
    </span>
  );
}

/**
 * Text with a band behind each line, as wide as that line, the bands joined
 * into one shape. With rounded corners the shape is rounded everywhere,
 * where a short line meets a long one too: the bands are drawn once more
 * under the words, blurred and sharpened again, which rounds every corner.
 */
function Wrapped({ ctx, as, children }: { ctx: Ctx; as: TypeName; children: React.ReactNode }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const el = React.useRef<HTMLSpanElement>(null);
  // The rounding is worked out in px, from the text's own size as drawn.
  const [size, setSize] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    const measure = () => setSize(parseFloat(getComputedStyle(node).fontSize) || 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const rounded = ctx.s.corners === "rounded";
  // Each line's band: its words, with room either side, cut and repeated a line at a time.
  const band: React.CSSProperties = { padding: `0.24em ${len(DS_SOCIAL_GAP)}`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" };
  return (
    <span ref={el} className="grid max-w-[82%]" style={type(ctx, as)}>
      {rounded && size > 0 && (
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.14} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
        </svg>
      )}
      <span aria-hidden className="col-start-1 row-start-1" style={{ filter: rounded && size > 0 ? `url(#${id})` : undefined }}>
        <span style={{ ...band, background: "var(--ds-bg)", color: "transparent" }}>{children}</span>
      </span>
      <span className="relative col-start-1 row-start-1">
        <span style={{ ...band, color: "var(--ds-fg)" }}>{children}</span>
      </span>
    </span>
  );
}

/** Text on a picture, as the style sets it: in a box, wrapped a line at a time, or straight on it with or without a shadow. */
function OnPicture({ ctx, as, children }: { ctx: Ctx; as: TypeName; children: React.ReactNode }) {
  const { s } = ctx;
  if (s.text === "boxed" || s.text === "mixed") {
    return (
      <Hug
        dep={`${as} ${s.fonts} ${s.edge} ${s.frame} ${s.align}`}
        style={{ ...type(ctx, as), background: "var(--ds-bg)", color: "var(--ds-fg)", padding: len(DS_SOCIAL_GAP), borderRadius: s.corners === "rounded" ? len(DS_SOCIAL_GAP) : 0 }}
      >
        {children}
      </Hug>
    );
  }
  if (s.text === "wrapped") {
    return (
      <Wrapped ctx={ctx} as={as}>
        {children}
      </Wrapped>
    );
  }
  return (
    <span className="block max-w-[82%]" style={{ ...type(ctx, as), color: PAGE_ON_PICTURE, textShadow: s.text === "shadow" ? SHADOW : undefined }}>
      {children}
    </span>
  );
}

/** The name on the bottom edge line, on the slides the style signs. */
function Signature({ ctx, index, count, picture }: { ctx: Ctx; index: number; count: number; picture?: boolean }) {
  const { s } = ctx;
  if (s.signature === "none" || (s.signature === "ends" && index !== 0 && index !== count - 1)) return null;
  return (
    <span className="block shrink-0" style={{ ...type(ctx, "small"), color: picture ? PAGE_ON_PICTURE : undefined, paddingTop: len(DS_SOCIAL_GAP), textShadow: picture && s.text === "shadow" ? SHADOW : undefined }}>
      {NAME}
    </span>
  );
}

/** A stack of things at one anchor, 18px apart (at 1080 wide). */
function Stack({ ctx, children }: { ctx: Ctx; children: React.ReactNode }) {
  return (
    <div className={`flex w-full flex-col ${ITEMS[ctx.s.align]}`} style={{ gap: len(DS_SOCIAL_GAP) }}>
      {children}
    </div>
  );
}

const SLIDES = 5;

/** The carousel: a title on a picture, a statement on a colour, a picture with two lines, the big statement, and what the reader takes away. */
function slide(ctx: Ctx, index: number): React.ReactNode {
  const { s } = ctx;
  const height = DS_SOCIAL_FRAMES[s.frame];
  const [first, second, third] = PALETTE;
  const sign = (picture?: boolean) => <Signature ctx={ctx} index={index} count={SLIDES} picture={picture} />;
  // On a colour, a statement starts at the top left, or sits in the middle when the style centres.
  const statement = s.align === "centre" ? "middle" : "top";
  switch (index) {
    case 0:
      return (
        <Frame ctx={ctx} height={height} picture={`${MEDIA}/ilo-portrait.jpg`} anchor="bottom" foot={sign(true)}>
          <Stack ctx={ctx}>
            <OnPicture ctx={ctx} as="h2">
              Creating tasteful AI in an AI-infested world
            </OnPicture>
          </Stack>
        </Frame>
      );
    case 1:
      return (
        <Frame ctx={ctx} height={height} ground={first} anchor={statement} foot={sign()}>
          <span className="block" style={type(ctx, "h1")}>
            The hard part isn&apos;t what AI can do.
          </span>
        </Frame>
      );
    case 2:
      return (
        <Frame ctx={ctx} height={height} picture={`${MEDIA}/ilo-lake-day.jpg`} foot={sign(true)}>
          <Stack ctx={ctx}>
            <OnPicture ctx={ctx} as="p">
              It&apos;s knowing which decisions to hand over.
            </OnPicture>
            <OnPicture ctx={ctx} as="p">
              And which ones have to stay mine.
            </OnPicture>
          </Stack>
        </Frame>
      );
    case 3:
      return (
        <Frame ctx={ctx} height={height} ground={second} anchor={statement} foot={sign()}>
          <span className="block" style={type(ctx, "display")}>
            The ones I keep are the ones people recognise me by.
          </span>
        </Frame>
      );
    default:
      return (
        <Frame ctx={ctx} height={height} ground={third} anchor={statement} foot={sign()}>
          <Stack ctx={ctx}>
            <span className="block" style={type(ctx, "h2")}>
              Pick three decisions you never hand over.
            </span>
            <span className="block" style={type(ctx, "p")}>
              The type. What stays empty. The one loud thing on the page.
            </span>
          </Stack>
        </Frame>
      );
  }
}

/**
 * A reel's key scenes, as if cut from one video: a picture each, and what's
 * said over it. It opens on a title, big, in the heading font, straight on
 * the picture where it's calm (the sky). After that captions, all one size
 * and one font, each in one of three places, the top line of the clear
 * area, its middle or its bottom line: the one where that picture is calm,
 * never over her face.
 */
const SCENES: { picture: string; position?: string; place: Place; title?: boolean; plain?: boolean; lines: string[] }[] = [
  { picture: "ilo-black-sand.jpg", place: "top", title: true, lines: ["The hard part isn't what AI can do."] },
  { picture: "ilo-portrait.jpg", place: "bottom", lines: ["It's knowing which decisions to hand over."] },
  // Straight on the picture, with no box: the lake is calm enough to carry it.
  { picture: "ilo-lake.jpg", place: "middle", plain: true, lines: ["And which ones have to stay mine."] },
  { picture: "ilo-lake-day.jpg", place: "top", lines: ["The ones I keep are the ones people recognise me by."] },
  { picture: "ilo-portrait.jpg", position: "50% 0%", place: "bottom", lines: ["Pick three you never hand over."] },
];

/**
 * The screen a reel is watched on: the latest regular iPhone's (iPhone 17,
 * 402 × 874 points), at 1080 wide. The video fills all of it, so the app
 * crops its sides.
 */
const REEL_SCREEN = { height: Math.round((874 / 402) * DS_SOCIAL_WIDTH) };

/**
 * What Instagram lays over a reel today, in white, at its own sizes: the
 * like, comment, repost and send column on the right with its counts and the
 * menu under them; the avatar in its ring, the name, Follow and the caption
 * bottom left; the progress line; and the floating tab bar, Reels picked.
 * There so a reel's own words can be seen to keep clear of all of it
 * (DS_SOCIAL_REEL). Not the style's: the platform's, the same for every theme.
 */
function ReelButtons() {
  const font = "system-ui, -apple-system, 'SF Pro Text', sans-serif";
  const icon = (size: number, strokeWidth = 2) => ({ width: len(size), height: len(size), strokeWidth });
  const shadow = "drop-shadow(0 1px 2px rgb(0 0 0 / 0.3))";
  const count = (Icon: LucideIcon, n: string) => (
    <div className="flex flex-col items-center" style={{ gap: len(10) }}>
      <Icon style={icon(78)} />
      <span style={{ fontSize: len(34), fontWeight: 600 }}>{n}</span>
    </div>
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ color: ON_PICTURE, fontFamily: font }}>
      <div className="absolute flex flex-col items-center" style={{ right: len(40), bottom: len(336), gap: len(62), filter: shadow }}>
        {count(Heart, "2,719")}
        {count(MessageCircle, "36")}
        {count(Repeat2, "136")}
        {count(Send, "505")}
        <Equal style={icon(70)} />
      </div>
      <div className="absolute flex flex-col" style={{ left: len(44), right: len(200), bottom: len(330), gap: len(34), filter: shadow }}>
        <div className="flex items-center" style={{ gap: len(26) }}>
          <span className="rounded-full" style={{ padding: len(6), background: "linear-gradient(45deg, #F9CE34, #EE2A7B 50%, #6228D7)" }}>
            <img src={`${MEDIA}/ilo-portrait.jpg`} alt="" className="block rounded-full object-cover" style={{ width: len(96), height: len(96), boxShadow: `0 0 0 ${len(4)} #000000` }} />
          </span>
          <span style={{ fontSize: len(42), fontWeight: 600 }}>iloodena</span>
          <span className="border border-white/80" style={{ fontSize: len(38), fontWeight: 600, padding: `${len(10)} ${len(26)}`, borderRadius: len(18) }}>
            Follow
          </span>
        </div>
        <span className="truncate" style={{ fontSize: len(42) }}>
          Three summers at the lake <span className="opacity-70">… more</span>
        </span>
      </div>
      <div className="absolute overflow-hidden rounded-full bg-white/30" style={{ left: len(44), right: len(44), bottom: len(268), height: len(5) }}>
        <div className="h-full bg-white" style={{ width: "8%" }} />
      </div>
      {/* The tab bar: a pill of frosted glass (the blur and saturation of `ds-frosted`, on the app's grey), Reels picked.
          Its blur needs the video straight behind it, so nothing above it here carries a filter. */}
      <div
        className="absolute flex items-center justify-between rounded-full"
        style={{
          left: len(60),
          right: len(60),
          bottom: len(60),
          height: len(160),
          padding: `0 ${len(22)}`,
          background: "rgb(70 70 70 / 0.4)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
        }}
      >
        {[House, SquarePlay, Send, Search].map((Icon, i) => (
          <span key={i} className={`grid place-items-center rounded-full ${i === 1 ? "bg-white/20" : ""}`} style={{ width: len(196), height: len(120) }}>
            <Icon style={icon(66, i === 1 ? 2.75 : 2.25)} />
          </span>
        ))}
        <span className="grid place-items-center" style={{ width: len(150), height: len(120) }}>
          <img src={`${MEDIA}/ilo-portrait.jpg`} alt="" className="rounded-full object-cover" style={{ width: len(72), height: len(72) }} />
        </span>
      </div>
    </div>
  );
}

/** One scene of the reel: the picture, and its title or caption at its place, aligned as the style aligns, clear of the app's own buttons. */
function scene(ctx: Ctx, index: number): React.ReactNode {
  const { picture, position, place, title, plain, lines } = SCENES[index];
  // The 9:16 video fills the screen's height, so the app crops its sides; its safe areas grow with it.
  const fill = REEL_SCREEN.height / DS_SOCIAL_REEL.height;
  const crop = (DS_SOCIAL_WIDTH * fill - DS_SOCIAL_WIDTH) / 2;
  const safe = {
    top: Math.round(DS_SOCIAL_REEL.top * fill),
    bottom: Math.round(DS_SOCIAL_REEL.bottom * fill),
    // The buttons run down the right of the lower half only: text above them is centred on the whole screen.
    right: place === "bottom" ? Math.round(DS_SOCIAL_REEL.right * fill - crop) : undefined,
  };
  return (
    <ReelPhone>
      <Frame ctx={ctx} height={REEL_SCREEN.height} picture={`${MEDIA}/${picture}`} position={position} dim safe={safe} anchor={place} over={<ReelButtons />} flush>
        <Stack ctx={ctx}>
          {lines.map((line) =>
            // A title, or a line said over a calm picture: in the mixed style straight on the picture, the heading font
            // in the page colour, no box, no shadow. In any other style it's set as that style sets everything.
            title || plain ? (
              ctx.s.text === "mixed" ? (
                <span key={line} className="block max-w-[82%]" style={{ ...type(ctx, "h1"), color: PAGE_ON_PICTURE }}>
                  {line}
                </span>
              ) : (
                <OnPicture key={line} ctx={ctx} as="h1">
                  {line}
                </OnPicture>
              )
            ) : (
              <OnPicture key={line} ctx={ctx} as="caption">
                {line}
              </OnPicture>
            ),
          )}
        </Stack>
      </Frame>
    </ReelPhone>
  );
}

function ReelPhone({ children }: { children: React.ReactNode }) {
  const font = "system-ui, -apple-system, 'SF Pro Text', sans-serif";
  return (
    <div
      className="relative overflow-hidden bg-black text-white"
      style={{ containerType: "inline-size", aspectRatio: `${DS_SOCIAL_WIDTH} / ${REEL_SCREEN.height}`, borderRadius: `${(140 / DS_SOCIAL_WIDTH) * 100}% / ${(140 / REEL_SCREEN.height) * 100}%` }}
    >
      {children}
      {/* The status bar, over the top of the video. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between"
        style={{ height: len(160), padding: `0 ${len(96)}`, fontFamily: font, fontSize: len(46), fontWeight: 600, filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.3))" }}
      >
        <span>9:41</span>
        <span className="flex items-center" style={{ gap: len(16) }}>
          <Signal style={{ width: len(46), height: len(46), strokeWidth: 3 }} />
          <Wifi style={{ width: len(46), height: len(46), strokeWidth: 3 }} />
          <BatteryFull style={{ width: len(62), height: len(62), strokeWidth: 2 }} />
        </span>
      </div>
      <BoardOutline />
    </div>
  );
}

/** The carousel's slides and the reel's scenes, each a frame of its own for a board to lay side by side. */
export function socialFrames(social: DsSocial): { slides: React.ReactNode[]; scenes: React.ReactNode[]; slideHeight: number } {
  const ctx: Ctx = { s: social };
  return {
    slides: Array.from({ length: SLIDES }, (_, i) => slide(ctx, i)),
    scenes: SCENES.map((_, i) => scene(ctx, i)),
    slideHeight: DS_SOCIAL_FRAMES[social.frame],
  };
}

/** A frame of a given shape, drawn as an icon: 3:4, 4:5 or 1:1. */
const shape = (name: string, w: number, h: number) =>
  createLucideIcon(name, [["rect", { x: `${(24 - w) / 2}`, y: `${(24 - h) / 2}`, width: `${w}`, height: `${h}`, rx: "2", key: "frame" }]]);
/** A frame with its edge line inside it, close to the edge or far in. */
const edge = (name: string, inset: number) =>
  createLucideIcon(name, [
    ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "frame" }],
    ["rect", { x: `${3 + inset}`, y: `${3 + inset}`, width: `${18 - inset * 2}`, height: `${18 - inset * 2}`, rx: "0.5", strokeDasharray: "2 2", key: "edge" }],
  ]);
/** Each choice's icon, by option (social.ts holds the choices, the panel the pictures). */
const ICONS: Record<keyof DsSocial, Record<string, LucideIcon>> = {
  frame: { "3:4": shape("Frame34", 13.5, 18), "4:5": shape("Frame45", 14.4, 18), "1:1": shape("Frame11", 16, 16) },
  edge: { tight: edge("EdgeTight", 2), regular: edge("EdgeRegular", 3.5), wide: edge("EdgeWide", 5.5) },
  text: { mixed: Shapes, boxed: Captions, wrapped: WrapText, plain: Type, shadow: Layers2 },
  corners: { square: Square, rounded: Squircle },
  fonts: { two: ALargeSmall, one: Baseline },
  align: { left: AlignLeft, centre: AlignCenter, right: AlignRight },
  signature: { none: CircleSlash, ends: PenLine, every: SignatureIcon },
};

/** The social rules (social.ts), for a section of the theme's panel: each choice as a row of buttons. */
export function SocialSettings({ social: s, onChange }: { social: DsSocial; onChange: (next: DsSocial) => void }) {
  return (
    <>
      {DS_SOCIAL_CHOICES.map((choice) => (
        // The panel's light pills (as Colour's Classic, Neutral…), an icon each, no fill at rest and a soft one when
        // picked; here they share the row's whole width, the icon and the word centred together, and go onto a second
        // row when there are too many for one, so nothing scrolls or pushes the panel wider.
        <div key={choice.key} className="flex flex-col gap-ds-4">
          <span className="text-p text-ds-fg">{choice.label}</span>
          <div role="group" aria-label={choice.label} className="flex flex-wrap items-center gap-ds-4">
            {(choice.options as readonly { id: string; label: string; says: string }[]).map((o) => (
              <DsButton key={o.id} size="small" variant="text" className="min-w-0 grow px-2" iconLeft={ICONS[choice.key][o.id]} pressed={s[choice.key] === o.id} title={o.says} onClick={() => onChange({ ...s, [choice.key]: o.id })}>
                {o.label}
              </DsButton>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
