import { DS_ACCENTS } from "../accents";
import { PAGE, ROLES, type Value } from "./colour-roles";

function Swatch({ value, page }: { value: Value; page: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-ds-md ring-1 ring-inset ring-ds-fg/10"
        style={{ backgroundColor: page }}
      >
        <div className="size-6 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: value.css }} />
      </div>
      <span className="text-small text-ds-fg-muted">{value.label}</span>
    </div>
  );
}

/**
 * Colours › Main: the UI palette by role, each token in light and dark side by
 * side (the same tokens in both themes; the theme toggle swaps which value is
 * live), then the one elevation.
 */
export function MainColoursSection() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-10">
      <div className="grid grid-cols-[1fr_9rem_9rem] items-center gap-x-4 -mb-6 text-small text-ds-fg-subtle max-sm:grid-cols-[1fr_8rem_8rem]">
        <span />
        <span>Light</span>
        <span>Dark</span>
      </div>

      {ROLES.map(({ role, note, colours }) => (
        <section key={role} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-ds-fg">{role}</h2>
            <p className="text-small text-ds-fg-muted">{note}</p>
          </div>
          {colours.map(({ name, token, light, dark }) => (
            <div key={token} className="grid grid-cols-[1fr_9rem_9rem] items-center gap-x-4 max-sm:grid-cols-[1fr_8rem_8rem]">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-p text-ds-fg">{name}</span>
                <span className="truncate text-small text-ds-fg-subtle">{token}</span>
              </div>
              <Swatch value={light} page={PAGE.light} />
              <Swatch value={dark} page={PAGE.dark} />
            </div>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 text-ds-fg">Elevation</h2>
          <p className="text-small text-ds-fg-muted">Not a colour; used by trays and menus</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-12 w-20 shrink-0 rounded-ds-lg border border-ds-border bg-ds-bg shadow-ds-raised" />
          <div className="flex flex-col">
            <span className="text-p text-ds-fg">Raised</span>
            <span className="text-small text-ds-fg-subtle">shadow-ds-raised</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Colours › Accent: what content wears (category colours). */
export function AccentColoursSection() {
  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-h3 text-ds-fg">Accent</p>
        <p className="text-small text-ds-fg-muted">For content, e.g. category colours; the same in both themes</p>
      </div>

      {DS_ACCENTS.map(({ name, token, value }) => (
        <div key={name} className="flex max-w-full flex-col items-center gap-2">
          <div className="size-8 rounded-full" style={{ backgroundColor: `var(${token})` }} />
          <p className="text-small text-ds-fg-muted">
            {name}: {value}
          </p>
        </div>
      ))}
    </div>
  );
}
