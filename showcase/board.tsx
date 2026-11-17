"use client";

/**
 * The board: the open style on one large surface, as a design tool shows a
 * file. Rows are kinds of thing (a home page, an article, a product page, a
 * newsletter, how it shows up in search, in an AI answer and on social),
 * and a row's frames are the sizes it's seen at (desktop, laptop, phone).
 * Drag to move around, pinch or ⌘-scroll to zoom, or use the − and +.
 *
 * Every frame is drawn from the theme's values and its composition
 * (composition.ts) with Parabola's own primitives, so a change of style
 * changes all of them at once. That is what the board is for: to see whether
 * two styles really differ, and whether one style holds from a phone to a
 * search result. The panel beside it picks a starting point
 * (starting-points.ts), holds the style's words (its brief) and sets the
 * composition; colours, type and buttons are tuned on the Theme page.
 *
 * The people and copy are Ilo Odena's, the showcase's sample maker.
 */

import * as React from "react";
import { ArrowRight, ArrowUpRight, Minus, Plus, Search, Sparkles } from "lucide-react";
import { DS_COMPOSITION_CHOICES, type DsComposition } from "../composition";
import { DsSubscribe } from "../components/subscribe";
import { DsButton } from "../primitives/button";
import { DsField, DsTextarea } from "../primitives/field";
import { DsPill } from "../primitives/pill";
import { DsSwitch } from "../primitives/switch";
import { DS_STARTING_POINTS } from "../starting-points";
import { DS_THEME_SCOPE } from "../theme";
import { InPanel, PanelSection, useThemeEditor } from "./theme-editor";

const MEDIA = "/parabola/preview";
const PHOTOS = ["ilo-lake.jpg", "ilo-black-sand.jpg", "ilo-lake-day.jpg", "ilo-portrait.jpg"].map((f) => `${MEDIA}/${f}`);

type Device = 0 | 1 | 2;
const DEVICES: { name: string; width: number }[] = [
  { name: "Desktop", width: 1440 },
  { name: "Laptop", width: 1024 },
  { name: "Phone", width: 390 },
];

/** Type sizes by scale, for desktop, laptop and phone: the headline, a section's heading, a lead line and running text. */
const SIZES: Record<DsComposition["scale"], { display: number[]; heading: number[]; lead: number[]; text: number[] }> = {
  small: { display: [30, 28, 24], heading: [18, 18, 17], lead: [15, 15, 15], text: [14, 14, 14] },
  regular: { display: [76, 58, 40], heading: [32, 28, 24], lead: [21, 19, 18], text: [17, 16, 16] },
  loud: { display: [152, 108, 56], heading: [60, 44, 32], lead: [40, 30, 22], text: [26, 22, 18] },
};
/** Room between sections by density, for desktop, laptop and phone. */
const GAPS: Record<DsComposition["density"], number[]> = { tight: [56, 48, 40], regular: [112, 88, 64], airy: [200, 152, 96] };

type Ctx = { c: DsComposition; d: Device };

const px = (n: number) => `${n}px`;
const display = ({ c, d }: Ctx): React.CSSProperties => ({ fontSize: px(SIZES[c.scale].display[d]), lineHeight: c.scale === "loud" ? 0.96 : 1.08, letterSpacing: c.scale === "loud" ? "-0.03em" : "-0.01em" });
const heading = ({ c, d }: Ctx): React.CSSProperties => ({ fontSize: px(SIZES[c.scale].heading[d]), lineHeight: 1.12, letterSpacing: c.scale === "loud" ? "-0.02em" : undefined });
const lead = ({ c, d }: Ctx): React.CSSProperties => ({ fontSize: px(SIZES[c.scale].lead[d]), lineHeight: 1.35 });
const text = ({ c, d }: Ctx): React.CSSProperties => ({ fontSize: px(SIZES[c.scale].text[d]), lineHeight: 1.5 });

/** The page's side gutter. */
const gutter = ({ c, d }: Ctx) => (d === 2 ? 20 : c.layout === "full" ? 32 : 40);
/** How wide a presenting page's content runs: a column, a contained width, or all of it. */
const wide = ({ c }: Ctx) => (c.layout === "inline" ? 640 : c.layout === "hybrid" ? 1160 : undefined);
/** How wide a page that's read runs. */
const reading = ({ c }: Ctx) => (c.layout === "full" ? undefined : 640);
const centred = ({ c }: Ctx) => c.align === "centre";

/** A page's content box: the gutter, and the width its layout gives it. */
function Box({ ctx, max, children, className = "" }: { ctx: Ctx; max?: number; children: React.ReactNode; className?: string }) {
  return (
    <div style={{ paddingInline: px(gutter(ctx)) }}>
      <div className={className} style={{ maxWidth: max ? px(max) : undefined, marginInline: max && (centred(ctx) || ctx.c.layout !== "inline") ? "auto" : undefined }}>
        {children}
      </div>
    </div>
  );
}

/** A section's name, as the style names things. */
function Label({ ctx, children, n }: { ctx: Ctx; children: string; n?: number }) {
  const { c } = ctx;
  const count = c.numbered && n !== undefined ? String(n).padStart(2, "0") : null;
  if (c.labels === "none") return count ? <span className="text-small text-ds-fg-muted">{count}</span> : null;
  if (c.labels === "tag") return <DsPill className="self-start">{count ? `${count} ${children}` : children}</DsPill>;
  if (c.labels === "bracket") return <span className="text-small text-ds-fg">({count ? `${count} ` : ""}{children})</span>;
  return (
    <span className="text-small tracking-[0.12em] text-ds-fg-muted uppercase">
      {count ? `${count} / ` : ""}
      {children}
    </span>
  );
}

/**
 * A section: its room above, its rule or box, its label and its content. On
 * a full-width page from a laptop up, the label takes the left three columns
 * and the content the other nine.
 */
function Section({ ctx, label, n, max, children }: { ctx: Ctx; label: string; n?: number; max?: number; children: React.ReactNode }) {
  const { c, d } = ctx;
  const grid = c.layout === "full" && d !== 2;
  const name = <Label ctx={ctx} n={n}>{label}</Label>;
  const boxed = c.structure === "boxed";
  return (
    <section style={{ marginTop: px(GAPS[c.density][d]) }}>
      <Box ctx={ctx} max={max ?? wide(ctx)}>
        <div
          className={`${c.structure === "ruled" ? "border-t border-ds-fg" : ""} ${boxed ? "border border-ds-border" : ""}`}
          style={{ paddingTop: c.structure === "ruled" ? px(d === 2 ? 16 : 24) : undefined, padding: boxed ? px(d === 2 ? 20 : 32) : undefined }}
        >
          {grid ? (
            <div className="grid grid-cols-12 gap-x-8">
              <div className="col-span-3 flex">{name}</div>
              <div className="col-span-9 min-w-0">{children}</div>
            </div>
          ) : (
            <div className={`flex flex-col gap-ds-20 ${centred(ctx) && c.layout !== "full" ? "items-center text-center" : ""}`}>
              {name}
              <div className="w-full min-w-0">{children}</div>
            </div>
          )}
        </div>
      </Box>
    </section>
  );
}

/** A group of like things side by side: on cards, under rules, in shared boxes, or with nothing. */
function Items({ ctx, cols, children }: { ctx: Ctx; cols: number; children: React.ReactNode[] }) {
  const { c, d } = ctx;
  const n = d === 2 || c.layout === "inline" ? 1 : d === 1 ? Math.min(cols, 2 + (cols > 3 ? 0 : 1)) : cols;
  const boxed = c.structure === "boxed";
  return (
    <div className={`grid ${boxed ? "gap-px border border-ds-border bg-ds-border" : ""}`} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: boxed ? undefined : px(c.density === "tight" ? 16 : d === 2 ? 24 : 32) }}>
      {children.map((child, i) => (
        <div
          key={i}
          className={`flex min-w-0 flex-col gap-ds-8 text-left ${c.structure === "cards" ? "rounded-ds-lg bg-ds-surface-subtle p-5" : ""} ${c.structure === "ruled" ? "border-t border-ds-fg pt-4" : ""} ${boxed ? "bg-ds-bg p-5" : ""}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function Photo({ src, ratio, className = "" }: { src: string; ratio: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`block w-full object-cover ${className}`} style={{ aspectRatio: ratio }} />;
}

const NAV = ["Work", "Writing", "Course", "About"];

function Nav({ ctx, max }: { ctx: Ctx; max?: number }) {
  const { c, d } = ctx;
  return (
    <header className={c.structure === "ruled" || c.structure === "boxed" ? "border-b border-ds-border" : ""}>
      <Box ctx={ctx} max={max}>
        <div className="flex items-center justify-between gap-ds-16 py-5" style={text({ c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale }, d })}>
          <span className="text-ds-fg">Ilo Odena</span>
          {d === 2 ? (
            <span className="text-ds-fg-muted">Menu</span>
          ) : (
            <nav className="flex items-center gap-ds-20 text-ds-fg-muted">
              {NAV.map((item) => (
                <span key={item}>{c.labels === "eyebrow" && c.structure === "boxed" ? item.toUpperCase() : item}</span>
              ))}
              <DsButton size="small" variant="primary">
                Subscribe
              </DsButton>
            </nav>
          )}
        </div>
      </Box>
    </header>
  );
}

function Footer({ ctx, max }: { ctx: Ctx; max?: number }) {
  return (
    <footer style={{ marginTop: px(GAPS[ctx.c.density][ctx.d]) }} className="border-t border-ds-border">
      <Box ctx={ctx} max={max}>
        <div className="flex flex-wrap justify-between gap-ds-16 py-8 text-small text-ds-fg-muted">
          <span>Ilo Odena, 2026</span>
          <span>Instagram · Letters · Contact</span>
        </div>
      </Box>
    </footer>
  );
}

const HEADLINE = "Creating tasteful AI in an AI-infested world";
const LEAD = "The hard part isn't what AI can do. It's knowing which decisions to hand over, and which ones have to stay mine.";

/** How a page opens: words alone, words beside a picture, or a picture across the width with the words over it. */
function Hero({ ctx }: { ctx: Ctx }) {
  const { c, d } = ctx;
  const mid = centred(ctx) && c.layout !== "full";
  const words = (onPhoto?: boolean) => (
    <div className={`flex flex-col ${mid ? "items-center text-center" : "items-start"}`} style={{ gap: px(d === 2 ? 20 : c.scale === "loud" ? 40 : 28) }}>
      <Label ctx={ctx}>Essay</Label>
      <h1 className={`text-display ${onPhoto ? "" : "text-ds-fg"}`} style={{ ...display(ctx), maxWidth: c.scale === "loud" ? undefined : "18ch" }}>
        {HEADLINE}
      </h1>
      <p className={onPhoto ? "" : "text-ds-fg-muted"} style={{ ...lead(ctx), maxWidth: "38ch" }}>
        {LEAD}
      </p>
      <div className="flex flex-wrap gap-ds-8">
        <DsButton variant="primary" iconRight={ArrowRight}>
          Read the essay
        </DsButton>
        {!onPhoto && <DsButton>See the work</DsButton>}
      </div>
    </div>
  );
  const top = px(d === 2 ? 48 : c.density === "tight" ? 64 : 112);
  if (c.hero === "poster") {
    const bleed = c.layout === "full" || c.layout === "hybrid";
    const poster = (
      <div className={`relative overflow-hidden ${bleed ? "" : "rounded-ds-lg"}`}>
        <Photo src={PHOTOS[0]} ratio={d === 2 ? "3 / 4" : c.scale === "small" ? "16 / 9" : "16 / 8"} />
        {/* A scrim under the words, so they read on any picture. */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white" style={{ padding: px(d === 2 ? 20 : 48) }}>
          {words(true)}
        </div>
      </div>
    );
    return bleed ? poster : <div style={{ paddingTop: top }}><Box ctx={ctx} max={wide(ctx)}>{poster}</Box></div>;
  }
  if (c.hero === "split" && d !== 2 && c.layout !== "inline") {
    return (
      <div style={{ paddingTop: top }}>
        <Box ctx={ctx} max={wide(ctx)}>
          <div className="grid grid-cols-12 items-center gap-x-8">
            <div className="col-span-7">{words()}</div>
            <div className="col-span-5">
              <Photo src={PHOTOS[3]} ratio="4 / 5" className="rounded-ds-lg" />
            </div>
          </div>
        </Box>
      </div>
    );
  }
  return (
    <div style={{ paddingTop: top }}>
      <Box ctx={ctx} max={wide(ctx)}>
        {words()}
        {c.hero === "split" && <Photo src={PHOTOS[3]} ratio="4 / 3" className="mt-8 rounded-ds-lg" />}
      </Box>
    </div>
  );
}

const STEPS: [string, string][] = [
  ["Notice", "Look at what you already return to. Taste starts as a record of attention, long before it's a rule."],
  ["Decide", "Name the few choices that are yours. Hand the rest over without guilt."],
  ["Show", "Put it where people can meet it, and watch what they do with it."],
];

function HomePage({ ctx }: { ctx: Ctx }) {
  const { c, d } = ctx;
  const max = wide(ctx);
  return (
    <>
      <Nav ctx={ctx} max={max} />
      <Hero ctx={ctx} />
      <Section ctx={ctx} label="Approach" n={1}>
        <Items ctx={ctx} cols={3}>
          {STEPS.map(([title, copy], i) => (
            <React.Fragment key={title}>
              {c.numbered && <span className="text-small text-ds-fg-muted">({String(i + 1).padStart(2, "0")})</span>}
              <h3 className="text-h2 text-ds-fg" style={heading({ c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale }, d })}>
                {title}
              </h3>
              <p className="text-ds-fg-muted" style={text({ c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale }, d })}>
                {copy}
              </p>
            </React.Fragment>
          ))}
        </Items>
      </Section>
      <section style={{ marginTop: px(GAPS[c.density][d]) }}>
        {/* The work: edge to edge on a full-width page, inside the page's width otherwise. */}
        <div style={{ paddingInline: c.layout === "full" ? 0 : px(gutter(ctx)) }}>
          <div
            className="grid"
            style={{
              maxWidth: c.layout === "full" ? undefined : px(max ?? 640),
              marginInline: "auto",
              gridTemplateColumns: `repeat(${d === 2 || c.layout === "inline" ? 1 : d === 1 ? 2 : 4}, minmax(0, 1fr))`,
              gap: px(c.layout === "full" ? (c.density === "tight" ? 2 : 0) : 16),
            }}
          >
            {PHOTOS.map((src) => (
              <Photo key={src} src={src} ratio="4 / 5" className={c.layout === "full" ? "" : "rounded-ds-lg"} />
            ))}
          </div>
        </div>
      </section>
      <Section ctx={ctx} label="Words" n={2}>
        <blockquote className="text-display text-ds-fg" style={{ ...heading(ctx), maxWidth: "24ch", marginInline: centred(ctx) && c.layout !== "full" ? "auto" : undefined }}>
          “Alex combines the eye of an eagle with the delicacy of a butterfly.”
        </blockquote>
      </Section>
      <Section ctx={ctx} label="Letters" n={3}>
        <div className={`flex flex-col gap-ds-16 ${centred(ctx) && c.layout !== "full" ? "items-center" : "items-start"}`}>
          <h2 className="text-h1 text-ds-fg" style={heading(ctx)}>
            A letter, some Sundays
          </h2>
          {/* The form answers to the window's width, not the frame's: stacked by hand in a phone frame. */}
          <DsSubscribe onSubscribe={() => undefined} className={d === 2 ? "w-full sm:flex-col sm:items-stretch" : ""} />
        </div>
      </Section>
      <Footer ctx={ctx} max={max} />
    </>
  );
}

const PARAGRAPHS = [
  "I used to think taste was a filter you ran at the end, once the thing existed. Make a lot, then pick. It turns out the picking is the work, and it starts before there's anything to pick from.",
  "A model will give you forty versions of a page before your coffee is cold. Thirty-nine of them are fine. The trouble with fine is that it looks like a decision someone made, and nobody did.",
  "So I keep a short list of the choices that are mine. The type. What's left empty. The one thing on a page that's allowed to be loud. Everything else I hand over, and I try not to look back.",
];

function ArticlePage({ ctx }: { ctx: Ctx }) {
  const { c, d } = ctx;
  const max = reading(ctx);
  const grid = c.layout === "full" && d !== 2;
  const headMax = c.layout === "hybrid" ? 960 : max;
  const body = (
    <div className="flex flex-col" style={{ gap: px(c.scale === "loud" ? 28 : 20) }}>
      {PARAGRAPHS.map((p) => (
        <p key={p} className="text-prose text-ds-fg" style={{ ...text(ctx), lineHeight: 1.6 }}>
          {p}
        </p>
      ))}
      <blockquote className={`text-display text-ds-fg ${c.structure === "ruled" ? "border-t border-ds-fg pt-5" : c.structure === "plain" ? "" : "border-l-2 border-ds-button pl-5"}`} style={heading(ctx)}>
        Fine looks like a decision someone made, and nobody did.
      </blockquote>
      <p className="text-prose text-ds-fg" style={{ ...text(ctx), lineHeight: 1.6 }}>
        None of this is against the tools. It's the opposite. The more they can do, the more it matters that someone, somewhere, chose.
      </p>
    </div>
  );
  return (
    <>
      <Nav ctx={ctx} max={c.layout === "inline" ? max : wide(ctx)} />
      <div style={{ paddingTop: px(d === 2 ? 40 : 88) }}>
        <Box ctx={ctx} max={headMax}>
          <div className={`flex flex-col gap-ds-20 ${centred(ctx) && !grid ? "items-center text-center" : "items-start"}`}>
            <Label ctx={ctx}>Essay</Label>
            <h1 className="text-display text-ds-fg" style={{ ...display({ c: { ...c, scale: c.scale }, d }), fontSize: px(Math.round(SIZES[c.scale].display[d] * (c.scale === "loud" ? 0.7 : 0.82))), maxWidth: "20ch" }}>
              Where to let it decide, and where to keep the choice
            </h1>
            <p className="text-small text-ds-fg-muted">Ilo Odena · 12 November 2026 · 4 min</p>
          </div>
        </Box>
      </div>
      <div style={{ marginTop: px(d === 2 ? 32 : 56), paddingInline: c.layout === "full" ? 0 : px(gutter(ctx)) }}>
        <div style={{ maxWidth: c.layout === "full" ? undefined : px(headMax ?? 640), marginInline: "auto" }}>
          <Photo src={PHOTOS[2]} ratio={d === 2 ? "4 / 3" : "16 / 8"} className={c.layout === "full" ? "" : "rounded-ds-lg"} />
        </div>
      </div>
      <div style={{ marginTop: px(d === 2 ? 32 : 64) }}>
        <Box ctx={ctx} max={c.layout === "hybrid" && !centred(ctx) ? headMax : max}>
          {grid ? (
            <div className="grid grid-cols-12 gap-x-8">
              <div className="col-span-3 flex flex-col gap-ds-8 text-small text-ds-fg-muted">
                <span>Filed under Taste</span>
                <span>Share</span>
              </div>
              <div className="col-span-7">{body}</div>
            </div>
          ) : (
            // Hybrid, left: the reading column hangs from the same left edge as the headline over it.
            <div style={{ maxWidth: px(640) }}>{body}</div>
          )}
        </Box>
      </div>
      <Section ctx={ctx} label="Keep reading" max={c.layout === "inline" ? max : wide(ctx)}>
        <Items ctx={ctx} cols={2}>
          {["The floor and the ceiling", "Forty versions before coffee"].map((title) => (
            <React.Fragment key={title}>
              <h3 className="text-h2 text-ds-fg">{title}</h3>
              <span className="flex items-center gap-ds-4 text-small text-ds-fg-muted">
                Read <ArrowUpRight className="size-4" />
              </span>
            </React.Fragment>
          ))}
        </Items>
      </Section>
      <Footer ctx={ctx} max={c.layout === "inline" ? max : wide(ctx)} />
    </>
  );
}

function ProductPage({ ctx }: { ctx: Ctx }) {
  const { c, d } = ctx;
  const [size, setSize] = React.useState("A3");
  const max = wide(ctx);
  const stacked = d === 2 || c.layout === "inline";
  const buy = (
    <div className={`flex flex-col gap-ds-20 ${c.structure === "cards" ? "rounded-ds-lg bg-ds-surface-subtle p-6" : ""} ${c.structure === "boxed" ? "border border-ds-border p-6" : ""}`}>
      <div className="flex flex-col gap-ds-8">
        <Label ctx={ctx}>Print</Label>
        <h1 className="text-display text-ds-fg" style={heading({ c: { ...c, scale: c.scale }, d })}>
          Black sand, morning
        </h1>
        <p className="text-ds-fg" style={lead({ c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale }, d })}>
          €120
        </p>
      </div>
      <p className="text-ds-fg-muted" style={text({ c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale }, d })}>
        Giclée print on cotton rag, signed and numbered. An edition of 40, printed in Bucharest.
      </p>
      <div className="flex flex-col gap-ds-8">
        <span className="text-small text-ds-fg-muted">Size</span>
        <div className="flex flex-wrap gap-ds-8">
          {["A4", "A3", "A2"].map((s) => (
            <DsButton key={s} size="small" pressed={s === size} onClick={() => setSize(s)}>
              {s}
            </DsButton>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-ds-8">
        <DsButton variant="primary">Add to cart</DsButton>
        <DsButton>Buy now</DsButton>
      </div>
      <ul className="flex flex-col text-small text-ds-fg-muted">
        {["Ships in 5 days, tracked", "Returns within 30 days", "Framing available"].map((line) => (
          <li key={line} className="border-t border-ds-border py-3">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <>
      <Nav ctx={ctx} max={max} />
      <div style={{ paddingTop: px(d === 2 ? 20 : 48) }}>
        <Box ctx={ctx} max={max}>
          {stacked ? (
            <div className="flex flex-col gap-ds-20">
              <Photo src={PHOTOS[1]} ratio="1 / 1" className="rounded-ds-lg" />
              {buy}
            </div>
          ) : (
            <div className="grid grid-cols-12 items-start gap-x-8">
              <div className="col-span-7 flex flex-col gap-ds-16">
                <Photo src={PHOTOS[1]} ratio="4 / 5" className={c.layout === "full" ? "" : "rounded-ds-lg"} />
                <div className="grid grid-cols-3 gap-ds-16">
                  {PHOTOS.filter((_, i) => i !== 1).map((src) => (
                    <Photo key={src} src={src} ratio="1 / 1" className={c.layout === "full" ? "" : "rounded-ds-md"} />
                  ))}
                </div>
              </div>
              <div className="col-span-5 xl:col-span-4 xl:col-start-9">{buy}</div>
            </div>
          )}
        </Box>
      </div>
      <Section ctx={ctx} label="You may also like" n={1}>
        <Items ctx={ctx} cols={3}>
          {[
            ["Lake, late", "€120", PHOTOS[0]],
            ["Lake, day", "€95", PHOTOS[2]],
            ["Portrait in wind", "€140", PHOTOS[3]],
          ].map(([title, price, src]) => (
            <React.Fragment key={title}>
              <Photo src={src} ratio="1 / 1" className={c.structure === "cards" ? "rounded-ds-md" : ""} />
              <div className="flex items-baseline justify-between gap-ds-8 text-p text-ds-fg">
                <span>{title}</span>
                <span className="text-ds-fg-muted">{price}</span>
              </div>
            </React.Fragment>
          ))}
        </Items>
      </Section>
      <Footer ctx={ctx} max={max} />
    </>
  );
}

/** A newsletter, as it lands in an inbox: one column whatever the layout, the style's type, marks and button. */
function Newsletter({ ctx }: { ctx: Ctx }) {
  const { c, d } = ctx;
  const email: Ctx = { c: { ...c, scale: c.scale === "loud" ? "regular" : c.scale, layout: "inline" }, d: d === 0 ? 1 : d };
  const mid = centred(ctx);
  return (
    <div className={`flex flex-col ${mid ? "items-center text-center" : "items-start"}`} style={{ padding: px(d === 2 ? 24 : 48), gap: px(24) }}>
      <span className="text-small text-ds-fg-muted">Ilo Odena · Letter 14</span>
      {c.structure === "ruled" && <div className="w-full border-t border-ds-fg" />}
      <Label ctx={email}>Letter</Label>
      <h1 className="text-display text-ds-fg" style={{ ...display(email), fontSize: px(c.scale === "small" ? 24 : c.scale === "loud" ? 52 : 40) }}>
        Forty versions before coffee
      </h1>
      <Photo src={PHOTOS[0]} ratio="16 / 9" className={c.structure === "ruled" || c.structure === "boxed" ? "" : "rounded-ds-lg"} />
      <p className="text-prose text-ds-fg" style={{ ...text(email), lineHeight: 1.6 }}>
        {PARAGRAPHS[1]}
      </p>
      <DsButton variant="primary" iconRight={ArrowRight}>
        Read it on the site
      </DsButton>
      <div className="w-full border-t border-ds-border pt-4 text-small text-ds-fg-muted">You're getting this because you subscribed. Unsubscribe any time.</div>
    </div>
  );
}

/** A favicon in the style: its button colour and the brand's initial. */
function Favicon({ size = 28 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center bg-ds-button text-ds-on-button" style={{ width: size, height: size, borderRadius: "var(--ds-radius-pill)", fontSize: size * 0.5, fontFamily: "var(--ds-font-display)" }}>
      I
    </span>
  );
}

/** The picture a link carries when it's shared: the headline as a poster, in the style. */
function SharePoster({ ctx, ratio, label }: { ctx: Ctx; ratio: string; label?: boolean }) {
  const { c } = ctx;
  const mid = centred(ctx) && c.layout !== "full";
  return (
    <div className={`flex flex-col justify-between bg-ds-bg ${mid ? "items-center text-center" : "items-start"} ${c.structure === "boxed" ? "border border-ds-border" : ""}`} style={{ aspectRatio: ratio, padding: 36 }}>
      <div className={`flex w-full items-center gap-ds-8 ${mid ? "justify-center" : "justify-between"}`}>
        <span className="text-p text-ds-fg">Ilo Odena</span>
        {label !== false && !mid && <Label ctx={ctx} n={c.numbered ? 14 : undefined}>Essay</Label>}
      </div>
      <h2 className="text-display text-ds-fg" style={{ fontSize: c.scale === "small" ? 26 : c.scale === "loud" ? 64 : 46, lineHeight: c.scale === "loud" ? 0.98 : 1.08, letterSpacing: c.scale === "loud" ? "-0.03em" : undefined }}>
        {HEADLINE}
      </h2>
      <div className={`w-full text-small text-ds-fg-muted ${c.structure === "ruled" ? "border-t border-ds-fg pt-3" : ""}`}>iloodena.com</div>
    </div>
  );
}

/**
 * How the style shows up where it doesn't control the page: a search result,
 * an AI answer that cites it, a shared link and a post. The surroundings are
 * the platform's (a neutral card here); what the style contributes is the
 * favicon, the picture and the words.
 */
function Outside({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-6" style={{ background: "#FFFFFF", color: "#1F1F1F", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontSize: 14, lineHeight: 1.45 }}>
      {children}
    </div>
  );
}

function SearchResult() {
  return (
    <Outside>
      <div className="flex items-center gap-2 rounded-full border px-4 py-2" style={{ borderColor: "#DADCE0", color: "#5F6368" }}>
        <Search className="size-4" /> tasteful AI design
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Favicon />
        <div className="flex flex-col">
          <span>Ilo Odena</span>
          <span style={{ color: "#5F6368", fontSize: 12 }}>https://iloodena.com › writing</span>
        </div>
      </div>
      <span style={{ color: "#1A0DAB", fontSize: 20, lineHeight: 1.3 }}>{HEADLINE} · Ilo Odena</span>
      <span style={{ color: "#4D5156" }}>12 Nov 2026 — {LEAD}</span>
    </Outside>
  );
}

function AiAnswer() {
  return (
    <Outside>
      <div className="flex items-center gap-2" style={{ color: "#5F6368" }}>
        <Sparkles className="size-4" /> Answer
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.55 }}>
        One approach is to keep a short list of decisions that stay human and hand the rest to the model. The designer Ilo Odena describes choosing the type, what is left empty and the one loud thing on a page herself, and letting AI produce everything else.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "#F1F3F4" }}>
          <Favicon size={18} /> iloodena.com
        </span>
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "#F1F3F4", color: "#5F6368" }}>
          +2 sources
        </span>
      </div>
    </Outside>
  );
}

function LinkCard({ ctx }: { ctx: Ctx }) {
  return (
    <Outside>
      <span style={{ color: "#5F6368" }}>Shared in a chat or a feed</span>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#DADCE0" }}>
        <div className={DS_THEME_SCOPE}>
          <SharePoster ctx={ctx} ratio="1200 / 630" />
        </div>
        <div className="flex flex-col gap-1 p-3">
          <span style={{ color: "#5F6368", fontSize: 12 }}>iloodena.com</span>
          <span style={{ fontWeight: 600 }}>{HEADLINE}</span>
        </div>
      </div>
    </Outside>
  );
}

type FrameDef = { name: string; width: number; render: (ctx: Ctx) => React.ReactNode; themed?: boolean };
type Row = { name: string; frames: (c: DsComposition) => FrameDef[] };

const page = (Page: React.ComponentType<{ ctx: Ctx }>) => (c: DsComposition): FrameDef[] =>
  DEVICES.map((device, d) => ({ name: `${device.name} · ${device.width}`, width: device.width, render: () => <Page ctx={{ c, d: d as Device }} /> }));

const ROWS: Row[] = [
  { name: "Home page", frames: page(HomePage) },
  { name: "Article", frames: page(ArticlePage) },
  { name: "Product page", frames: page(ProductPage) },
  {
    name: "Newsletter",
    frames: (c) => [
      { name: "Email · 640", width: 640, render: () => <Newsletter ctx={{ c, d: 1 }} /> },
      { name: "Email on a phone · 390", width: 390, render: () => <Newsletter ctx={{ c, d: 2 }} /> },
    ],
  },
  {
    name: "Out in the world",
    frames: (c) => [
      { name: "Search result", width: 620, themed: false, render: () => <SearchResult /> },
      { name: "AI answer", width: 620, themed: false, render: () => <AiAnswer /> },
      { name: "Shared link", width: 520, themed: false, render: () => <LinkCard ctx={{ c, d: 1 }} /> },
      { name: "Post · 1080 × 1080", width: 540, render: () => <SharePoster ctx={{ c, d: 1 }} ratio="1 / 1" /> },
      { name: "Story · 1080 × 1920", width: 360, render: () => <SharePoster ctx={{ c, d: 2 }} ratio="9 / 16" /> },
    ],
  },
];

const ZOOMS = [0.15, 0.25, 0.33, 0.5, 0.67, 0.8, 1];
const START_ZOOM = 0.33;

export function BoardSection() {
  const { theme, setTheme, pickedMode } = useThemeEditor();
  const c = theme.composition;
  const [zoom, setZoom] = React.useState(START_ZOOM);
  const scroller = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const step = (dir: 1 | -1) =>
    setZoom((z) => {
      const i = ZOOMS.findIndex((v) => v >= z - 0.001);
      return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? ZOOMS.length - 1 : i) + dir))];
    });

  // Pinch, or ⌘/Ctrl and the wheel, zooms; the page itself must not.
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(1, Math.max(0.1, Math.round(z * (e.deltaY > 0 ? 0.92 : 1.08) * 100) / 100)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const setComposition = (next: Partial<DsComposition>) => setTheme({ ...theme, composition: { ...c, ...next } });
  const openPoint = DS_STARTING_POINTS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme))?.id;

  return (
    <>
      <div
        ref={scroller}
        data-slot="ds-board"
        className={`absolute inset-0 overflow-auto select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={(e) => {
          // A drag moves the board; a click on a control inside a frame is that control's.
          if (e.button !== 0 || (e.target as HTMLElement).closest("button, a, input, textarea, [role=switch]")) return;
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
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <div className="flex w-max flex-col" style={{ zoom, padding: 160, gap: 240 }}>
          {ROWS.map((row) => (
            <div key={row.name} className="flex flex-col" style={{ gap: 28 / zoom }}>
              {/* Names stay readable at any zoom: the UI's own type, sized against it. */}
              <div className="whitespace-nowrap text-ds-fg" style={{ fontSize: 15 / zoom, lineHeight: 1.2 }}>
                {row.name}
              </div>
              <div className="flex items-start" style={{ gap: 120 }}>
                {row.frames(c).map((frame) => (
                  <div key={frame.name} className="flex shrink-0 flex-col" style={{ gap: 10 / zoom, width: frame.width }}>
                    <div className="whitespace-nowrap text-ds-fg-subtle" style={{ fontSize: 12 / zoom, lineHeight: 1.2 }}>
                      {frame.name}
                    </div>
                    <div
                      data-slot="ds-board-frame"
                      data-ds-mode={frame.themed === false ? undefined : (pickedMode ?? undefined)}
                      className={`${frame.themed === false ? "" : `${DS_THEME_SCOPE} bg-ds-bg`} overflow-hidden shadow-ds-raised`}
                      style={{ width: frame.width }}
                    >
                      {frame.render({ c, d: 0 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom, in the board's corner, over it. */}
      <div className="absolute bottom-4 left-4 flex items-center gap-ds-4 rounded-ds-pill bg-ds-bg p-1 shadow-ds-raised">
        <DsButton size="small" variant="text" iconLeft={Minus} aria-label="Zoom out" onClick={() => step(-1)} />
        <button type="button" className="min-w-12 text-center text-small text-ds-fg tabular-nums" onClick={() => setZoom(START_ZOOM)} title="Back to the starting zoom">
          {Math.round(zoom * 100)}%
        </button>
        <DsButton size="small" variant="text" iconLeft={Plus} aria-label="Zoom in" onClick={() => step(1)} />
      </div>

      <InPanel>
        <PanelSection title="Starting points">
          <p className="text-small text-ds-fg-muted">A whole style to begin from. Picking one replaces this theme's look; Undo brings it back.</p>
          <div className="flex flex-col gap-ds-4" role="group" aria-label="Starting points">
            {DS_STARTING_POINTS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={openPoint === p.id}
                onClick={() => setTheme(p.theme)}
                className="ds-focus flex items-baseline justify-between gap-ds-8 rounded-ds-md px-3 py-2 text-left hover:bg-ds-surface-subtle aria-pressed:bg-ds-surface"
              >
                <span className="text-p text-ds-fg">{p.name}</span>
                <span className="truncate text-small text-ds-fg-muted">{p.kind}</span>
              </button>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="In words">
          <DsField label="Reference" description="The style in one sentence. A specific thing to picture, not adjectives." className="w-full">
            <DsTextarea
              rows={3}
              value={theme.brief.reference}
              placeholder="A Swiss poster from the 1960s, set as a website."
              onChange={(e) => setTheme({ ...theme, brief: { ...theme.brief, reference: e.target.value } })}
            />
          </DsField>
          <DsField label="Signature moves" description="The few gestures that make it recognisable, one a line." className="w-full">
            <DsTextarea
              rows={5}
              value={theme.brief.moves.join("\n")}
              placeholder={"Small labels in brackets.\nA hairline opens each section."}
              onChange={(e) => setTheme({ ...theme, brief: { ...theme.brief, moves: e.target.value.split("\n") } })}
            />
          </DsField>
        </PanelSection>

        <PanelSection title="Composition">
          {DS_COMPOSITION_CHOICES.map((choice) => (
            <div key={choice.key} className="flex flex-col gap-ds-4">
              <span className="text-small text-ds-fg-muted">{choice.label}</span>
              <div className="flex flex-wrap gap-ds-4" role="group" aria-label={choice.label}>
                {choice.options.map((o) => (
                  <DsButton key={o.id} size="small" variant="text" pressed={c[choice.key] === o.id} title={o.says} onClick={() => setComposition({ [choice.key]: o.id })}>
                    {o.label}
                  </DsButton>
                ))}
              </div>
            </div>
          ))}
          <div className="flex h-9 items-center gap-ds-8">
            <label htmlFor="board-numbered" className="text-p text-ds-fg">
              Numbered parts
            </label>
            <DsSwitch id="board-numbered" checked={c.numbered} onCheckedChange={(numbered) => setComposition({ numbered })} />
          </div>
          <p className="text-small text-ds-fg-muted">Colours, type and buttons are on the Theme page. Export, top right, hands all of it over in words.</p>
        </PanelSection>
      </InPanel>
    </>
  );
}
