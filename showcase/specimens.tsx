"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import * as Popover from "@radix-ui/react-popover";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  File,
  Bookmark,
  Component as ComponentIcon,
  Filter,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsCheckboxMark, DsCheckbox } from "../primitives/checkbox";
import { DsDatePicker } from "../primitives/date-picker";
import { DsConfirmDialog, DsDialog, DsDialogActions, DsDialogCancel } from "../primitives/dialog";
import { DsSidePanel } from "../primitives/side-panel";
import { DsDivider } from "../primitives/divider";
import {
  DsDropdown,
  DsDropdownCheckboxItem,
  DsDropdownContent,
  DsDropdownLabel,
  DsDropdownItem,
  DsDropdownRadioGroup,
  DsDropdownRadioItem,
  DsDropdownSeparator,
  DsDropdownTrigger,
} from "../primitives/dropdown";
import { DS_FIELDS_CLASS, DsField, DsInput, DsSearch, DsTextarea } from "../primitives/field";
import { DsRichText } from "../primitives/rich-text";
import { DsListRow } from "../primitives/list-row";
import { DsMultiSelect } from "../primitives/multi-select";
import { DsNavGroup, DsNavItem } from "../primitives/nav-item";
import { DsPill } from "../primitives/pill";
import { DsRadio, DsRadioGroup, DsRadioMark } from "../primitives/radio";
import { DsSelect } from "../primitives/select";
import { DS_ACCENTS } from "../accents";
import { DsSwitch } from "../primitives/switch";
import { DsToast, DsToastAction, DsToaster, dsToast } from "../primitives/toast";
import { DsTooltip } from "../primitives/tooltip";
import { cn } from "../cn";
import { DS_TRAY_CLASS, DsColourDot, DsMenuItem, DsMenuSeparator, DsTray } from "../primitives/tray";
import { DsMediaTile } from "../components/media-tile";
import { DsNewsletterBlock } from "../blocks/newsletter";
import { DsPlaceholder } from "../components/placeholder";
import { DsEmptyState } from "../components/empty-state";
import { DsInfoCard } from "../components/info-card";
import { DsCopyField } from "../primitives/copy-field";
import { useDsOptionsSlot } from "./ds-shell";

const CATEGORIES = ["Design", "Product", "Design Systems", "Photography", "Portrait", "Still life"].map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, "-"),
  label,
}));

/** The same categories, each with its accent as a colour dot. */
const COLOURED_CATEGORIES = CATEGORIES.map((c, i) => ({
  ...c,
  indicator: <DsColourDot color={DS_ACCENTS[(i * 5) % DS_ACCENTS.length].value} />,
}));

/** Soft placeholder thumbnail for list-row previews. */
const THUMBNAIL =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7c6d6"/><stop offset="1" stop-color="#9fb4c9"/></linearGradient></defs><rect width="48" height="48" fill="url(#g)"/></svg>'
  );

/** Stacked on/off rows under a specimen, one per option. */
function Controls<T extends Record<string, boolean>>({
  options,
  labels,
  onChange,
}: {
  options: T;
  labels: Record<keyof T & string, string>;
  onChange: (next: T) => void;
}) {
  const baseId = useId();
  return (
    <div className="flex min-w-48 flex-col">
      {(Object.keys(labels) as (keyof T & string)[]).map((key) => (
        <div key={key} className="flex h-9 items-center justify-between gap-6 px-3">
          <label htmlFor={`${baseId}-${key}`} className="text-p text-ds-fg">
            {labels[key]}
          </label>
          <DsSwitch
            id={`${baseId}-${key}`}
            checked={options[key]}
            onCheckedChange={(checked) => onChange({ ...options, [key]: checked })}
          />
        </div>
      ))}
    </div>
  );
}

/*
 * A specimen fills the /parabola canvas: the component centred. Its options sit in
 * an "Options" dropdown (a regular button opening a tray) at the right of the
 * page header; see DsCanvas.
 */
function Specimen({
  preview,
  controls,
  wide,
}: {
  preview: React.ReactNode;
  /** Options to flip; leave out when there's nothing to configure. */
  controls?: React.ReactNode;
  /** Let the preview use the canvas width instead of a 360px column. */
  wide?: boolean;
}) {
  const slot = useDsOptionsSlot();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={cn("flex w-full flex-col items-center", !wide && "max-w-[360px]")}>{preview}</div>
      {controls &&
        slot &&
        createPortal(
          <Popover.Root>
            <Popover.Trigger asChild>
              <DsButton iconRight={ChevronDown}>Options</DsButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="end" sideOffset={6} className={DS_TRAY_CLASS}>
                {controls}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>,
          slot
        )}
    </div>
  );
}

export function IconOnlyButton() {
  const [o, setO] = useState({ small: false, destructive: false, pressed: false, tooltip: true, focus: false });
  const button = (
    <DsButton
      size={o.small ? "small" : "default"}
      destructive={o.destructive}
      iconLeft={o.destructive ? Trash2 : Filter}
      aria-label={o.destructive ? "Delete" : "Filter"}
      pressed={o.pressed}
      data-focus={o.focus || undefined}
    />
  );
  return (
    <Specimen
      preview={o.tooltip ? <DsTooltip content="Filter">{button}</DsTooltip> : button}
      controls={
        <Controls options={o} labels={{ small: "Small", destructive: "Destructive", pressed: "Pressed", tooltip: "Tooltip", focus: "Focus" }} onChange={setO} />
      }
    />
  );
}

export function LabelButton() {
  const [o, setO] = useState({
    small: false,
    destructive: false,
    primary: false,
    danger: false,
    pressed: false,
    iconLeft: false,
    iconRight: false,
    meta: false,
    disabled: false,
    loading: false,
    focus: false,
  });
  return (
    <Specimen
      preview={
        <DsButton
          variant={o.danger ? "danger" : o.primary ? "primary" : "default"}
          size={o.small ? "small" : "default"}
          destructive={o.destructive}
          pressed={o.pressed}
          iconLeft={o.iconLeft ? File : undefined}
          iconRight={o.iconRight ? ChevronRight : undefined}
          meta={o.meta ? 16 : undefined}
          disabled={o.disabled}
          loading={o.loading}
          data-focus={o.focus || undefined}
        >
          Documents
        </DsButton>
      }
      controls={
        <Controls
          options={o}
          labels={{
            small: "Small",
            destructive: "Destructive",
            primary: "Primary",
            danger: "Danger",
            pressed: "Pressed",
            iconLeft: "Icon left",
            iconRight: "Icon right",
            meta: "Meta",
            disabled: "Disabled",
            loading: "Loading",
            focus: "Focus",
          }}
          onChange={(next) => setO(exclusive(o, next, ["primary", "danger", "pressed"]))}
        />
      }
    />
  );
}

export function TextButton() {
  const [o, setO] = useState({ small: false, destructive: false, iconLeft: false, iconRight: false, meta: false, focus: false });
  return (
    <Specimen
      preview={
        <DsButton
          variant="text"
          size={o.small ? "small" : "default"}
          destructive={o.destructive}
          iconLeft={o.iconLeft ? File : undefined}
          iconRight={o.iconRight ? ChevronRight : undefined}
          meta={o.meta ? 24 : undefined}
          data-focus={o.focus || undefined}
        >
          Read more
        </DsButton>
      }
      controls={
        <Controls
          options={o}
          labels={{ small: "Small", destructive: "Destructive", iconLeft: "Icon left", iconRight: "Icon right", meta: "Meta", focus: "Focus" }}
          onChange={setO}
        />
      }
    />
  );
}

const PILLS = [
  { variant: "dark", label: "Draft" },
  { variant: "light", label: "Published" },
  { variant: "highlight", label: "Claude" },
] as const;

export function Pill() {
  const [o, setO] = useState({ iconLeft: false, iconRight: false, removable: false });
  const [removed, setRemoved] = useState<string[]>([]);
  return (
    <Specimen
      preview={
        <div className="flex min-h-[22px] flex-wrap items-center justify-center gap-2">
          {PILLS.filter((p) => !removed.includes(p.label)).map((p) => (
            <DsPill
              key={p.label}
              variant={p.variant}
              iconLeft={o.iconLeft ? GripVertical : undefined}
              iconRight={o.iconRight ? ChevronRight : undefined}
              onRemove={o.removable ? () => setRemoved([...removed, p.label]) : undefined}
            >
              {p.label}
            </DsPill>
          ))}
        </div>
      }
      controls={
        <Controls
          options={o}
          labels={{ iconLeft: "Icon left", iconRight: "Icon right", removable: "Removable" }}
          onChange={(next) => {
            // Turning Removable off brings removed pills back.
            if (!next.removable) setRemoved([]);
            setO(next);
          }}
        />
      }
    />
  );
}

export function Checkbox() {
  const [o, setO] = useState({ checked: false, label: false, disabled: false, focus: false });
  const id = useId();
  return (
    <Specimen
      preview={
        <div className="flex items-center gap-2">
          <DsCheckbox
            id={id}
            checked={o.checked}
            onCheckedChange={(checked) => setO({ ...o, checked: checked === true })}
            disabled={o.disabled}
            data-focus={o.focus || undefined}
            aria-label={o.label ? undefined : "Select"}
          />
          {o.label && (
            <label htmlFor={id} className="text-p text-ds-fg">
              Pages (2)
            </label>
          )}
        </div>
      }
      controls={
        <Controls
          options={o}
          labels={{ checked: "Checked", label: "Label", disabled: "Disabled", focus: "Focus" }}
          onChange={setO}
        />
      }
    />
  );
}

export function SearchField() {
  const [o, setO] = useState({ label: false, description: false, focus: false, fill: false });
  return (
    <Specimen
      wide={o.fill}
      preview={
        <DsField
          label={o.label && "Search"}
          description={o.description && "Posts, pages and media"}
          className={o.fill ? "w-full" : undefined}
        >
          <DsSearch showFocus={o.focus} />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{ label: "Label", description: "Description", focus: "Focus", fill: "Fill the row" }}
          onChange={setO}
        />
      }
    />
  );
}

export function InputField() {
  const [o, setO] = useState({
    iconLeft: false,
    iconRight: false,
    meta: false,
    label: false,
    required: false,
    description: false,
    error: false,
    disabled: false,
    focus: false,
  });
  const [value, setValue] = useState("");

  // Description and error share the line under the field, so one switches the other off.
  const update = (next: typeof o) => {
    if (next.error && !o.error) next = { ...next, description: false };
    if (next.description && !o.description) next = { ...next, error: false };
    setO(next);
  };
  return (
    <Specimen
      preview={
        <DsField
          label={o.label && "Title"}
          required={o.required}
          description={o.description && "Keep it short"}
          error={o.error && "Add a title to publish"}
        >
          <DsInput
            placeholder="Post title"
            maxLength={80}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onClear={() => setValue("")}
            showFocus={o.focus}
            disabled={o.disabled}
            iconLeft={o.iconLeft ? Calendar : undefined}
            iconRight={o.iconRight ? ChevronDown : undefined}
            meta={o.meta ? `${value.length}/80` : undefined}
          />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{
            iconLeft: "Icon left",
            iconRight: "Icon right",
            meta: "Meta",
            label: "Label",
            required: "Required",
            description: "Description",
            error: "Error",
            disabled: "Disabled",
            focus: "Focus",
          }}
          onChange={update}
        />
      }
    />
  );
}

/** Options that can't combine: turning one of `keys` on turns the others off. */
function exclusive<T extends Record<string, boolean>>(prev: T, next: T, keys: (keyof T)[]): T {
  const turnedOn = keys.find((k) => next[k] && !prev[k]);
  if (!turnedOn) return next;
  return { ...next, ...Object.fromEntries(keys.filter((k) => k !== turnedOn).map((k) => [k, false])) };
}

/** Description and error share the line under a field: turning one on turns the other off. */
function exclusiveNote<T extends { description: boolean; error: boolean }>(prev: T, next: T): T {
  if (next.error && !prev.error) return { ...next, description: false };
  if (next.description && !prev.description) return { ...next, error: false };
  return next;
}

export function Radio() {
  const [o, setO] = useState({ disabled: false, focus: false });
  const [value, setValue] = useState("published");
  const ids = { draft: useId(), published: useId(), scheduled: useId() };
  return (
    <Specimen
      preview={
        <DsRadioGroup value={value} onValueChange={setValue} disabled={o.disabled} aria-label="Status">
          {(["draft", "published", "scheduled"] as const).map((v, i) => (
            <div key={v} className="flex items-center gap-2">
              <DsRadio id={ids[v]} value={v} data-focus={(o.focus && i === 0) || undefined} />
              <label htmlFor={ids[v]} className="text-p text-ds-fg capitalize">
                {v}
              </label>
            </div>
          ))}
        </DsRadioGroup>
      }
      controls={<Controls options={o} labels={{ disabled: "Disabled", focus: "Focus" }} onChange={setO} />}
    />
  );
}

export function TextareaField() {
  const [o, setO] = useState({ label: false, description: false, error: false, focus: false, fill: false });
  return (
    <Specimen
      wide={o.fill}
      preview={
        <DsField
          label={o.label && "Excerpt"}
          description={o.description && "Shown under the title in the feed"}
          error={o.error && "Keep it under 200 characters"}
          className={o.fill ? "w-full" : undefined}
        >
          <DsTextarea placeholder="Write something…" showFocus={o.focus} />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{ label: "Label", description: "Description", error: "Error", focus: "Focus", fill: "Fill the row" }}
          onChange={(next) => setO(exclusiveNote(o, next))}
        />
      }
    />
  );
}

export function SelectField() {
  const [o, setO] = useState({ label: false, description: false, error: false, disabled: false, focus: false, colours: false });
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <Specimen
      preview={
        <DsField
          label={o.label && "Category"}
          description={o.description && "Where the post appears"}
          error={o.error && "Pick a category"}
        >
          <DsSelect options={o.colours ? COLOURED_CATEGORIES : CATEGORIES} value={value} onValueChange={setValue} placeholder="Uncategorized" disabled={o.disabled} showFocus={o.focus} />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{ label: "Label", description: "Description", error: "Error", disabled: "Disabled", focus: "Focus", colours: "Colour dots" }}
          onChange={(next) => setO(exclusiveNote(o, next))}
        />
      }
    />
  );
}

export function MultiSelectField() {
  const [o, setO] = useState({ label: false, description: false, error: false, disabled: false, focus: false });
  const [options, setOptions] = useState(CATEGORIES);
  const [value, setValue] = useState<string[]>(["design", "photography"]);
  return (
    <Specimen
      preview={
        <DsField
          label={o.label && "Categories"}
          description={o.description && "Type to search or create"}
          error={o.error && "Pick at least one category"}
        >
          <DsMultiSelect
            options={options}
            value={value}
            onValueChange={setValue}
            onCreate={(label) => {
              const created = { value: label.toLowerCase().replace(/\s+/g, "-"), label };
              setOptions([...options, created]);
              setValue([...value, created.value]);
            }}
            placeholder="Uncategorized"
            disabled={o.disabled}
            showFocus={o.focus}
          />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{ label: "Label", description: "Description", error: "Error", disabled: "Disabled", focus: "Focus" }}
          onChange={(next) => setO(exclusiveNote(o, next))}
        />
      }
    />
  );
}

export function DateField() {
  const [o, setO] = useState({ label: false, description: false, error: false, disabled: false, focus: false });
  const [value, setValue] = useState<Date | null>(() => new Date());
  return (
    <Specimen
      preview={
        <DsField
          label={o.label && "Publishing date"}
          description={o.description && "Posts are listed by this date"}
          error={o.error && "Pick a date"}
        >
          <DsDatePicker value={value} onValueChange={setValue} disabled={o.disabled} showFocus={o.focus} />
        </DsField>
      }
      controls={
        <Controls
          options={o}
          labels={{ label: "Label", description: "Description", error: "Error", disabled: "Disabled", focus: "Focus" }}
          onChange={(next) => setO(exclusiveNote(o, next))}
        />
      }
    />
  );
}

/**
 * A form as the admin lays one out: every field at the standard width,
 * left-aligned and wrapping as the canvas narrows; a long text fills its row.
 */
export function FieldsForm() {
  const [o, setO] = useState({ fill: true });
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | null>(() => new Date());
  return (
    <Specimen
      wide
      preview={
        <div className={cn(DS_FIELDS_CLASS, "w-full")}>
          <DsField label="Title" required>
            <DsInput placeholder="Post title" />
          </DsField>
          <DsField label="Category">
            <DsSelect options={CATEGORIES} value={category} onValueChange={setCategory} placeholder="Uncategorized" />
          </DsField>
          <DsField label="Publishing date">
            <DsDatePicker value={date} onValueChange={setDate} />
          </DsField>
          <DsField label="Tags" description="Separated by commas">
            <DsInput placeholder="film, travel" />
          </DsField>
          <DsField
            label="Notes"
            description={o.fill ? "Fills its row (w-full on the field)" : "At the standard width"}
            className={o.fill ? "w-full" : undefined}
          >
            <DsTextarea placeholder="Anything longer" />
          </DsField>
        </div>
      }
      controls={<Controls options={o} labels={{ fill: "Notes fill the row" }} onChange={setO} />}
    />
  );
}

/** Every kind of menu item, drawn statically in a tray. */
export function Tray() {
  return (
    <Specimen
      preview={
        <DsTray className="w-full">
          <DsMenuItem iconLeft={Pencil}>Icon</DsMenuItem>
          <DsMenuItem highlighted iconLeft={Copy} meta="⌘D">
            Highlighted, with meta
          </DsMenuItem>
          <DsMenuItem trailing={<Check aria-hidden />}>Single choice (check)</DsMenuItem>
          <DsMenuItem indicator={<DsRadioMark checked />}>Single choice (radio)</DsMenuItem>
          <DsMenuItem indicator={<DsCheckboxMark checked />}>Multiple choice</DsMenuItem>
          <DsMenuItem indicator={<DsColourDot color="#E19A3C" />}>Colour dot</DsMenuItem>
          <DsMenuItem disabled iconLeft={File}>
            Disabled
          </DsMenuItem>
          <DsMenuSeparator />
          <DsMenuItem tone="subtle" iconLeft={Plus}>
            Create “design system”
          </DsMenuItem>
          <DsMenuItem tone="danger" iconLeft={Trash2}>
            Delete
          </DsMenuItem>
        </DsTray>
      }
    />
  );
}

export function Dropdown() {
  const [show, setShow] = useState({ thumbnails: true, dates: false });
  const [sort, setSort] = useState("newest");
  return (
    <Specimen
      preview={
        <DsDropdown>
          <DsDropdownTrigger asChild>
            <DsButton iconLeft={MoreVertical} aria-label="More" />
          </DsDropdownTrigger>
          <DsDropdownContent>
            <DsDropdownItem iconLeft={Pencil}>Edit</DsDropdownItem>
            <DsDropdownItem iconLeft={Copy}>Duplicate</DsDropdownItem>
            <DsDropdownSeparator />
            <DsDropdownCheckboxItem
              checked={show.thumbnails}
              onCheckedChange={(c) => setShow({ ...show, thumbnails: c === true })}
            >
              Show thumbnails
            </DsDropdownCheckboxItem>
            <DsDropdownCheckboxItem checked={show.dates} onCheckedChange={(c) => setShow({ ...show, dates: c === true })}>
              Show dates
            </DsDropdownCheckboxItem>
            <DsDropdownSeparator />
            <DsDropdownLabel>Sort by</DsDropdownLabel>
            <DsDropdownRadioGroup value={sort} onValueChange={setSort}>
              <DsDropdownRadioItem value="newest">Newest first</DsDropdownRadioItem>
              <DsDropdownRadioItem value="oldest">Oldest first</DsDropdownRadioItem>
            </DsDropdownRadioGroup>
            <DsDropdownSeparator />
            <DsDropdownItem tone="danger" iconLeft={Trash2}>
              Delete
            </DsDropdownItem>
          </DsDropdownContent>
        </DsDropdown>
      }
    />
  );
}

export function RichText() {
  const [html, setHtml] = useState(
    "<h2>The problem</h2><p>People couldn't picture what a <strong>travel experience</strong> was, and thought it was just tickets.</p><ul><li>Select text to format it</li><li>Type <code>## </code> for a title, <code>- </code> for a list</li></ul>"
  );
  return (
    <Specimen
      preview={
        <div className="flex w-full flex-col gap-6">
          <DsRichText value={html} onValueChange={setHtml} aria-label="Example text" />
        </div>
      }
    />
  );
}

export function Divider() {
  return (
    <Specimen
      preview={
        <div className="flex w-full flex-col gap-4">
          <p className="text-p text-ds-fg-muted">Above</p>
          <DsDivider />
          <p className="text-p text-ds-fg-muted">Below</p>
        </div>
      }
    />
  );
}

export function NavFade() {
  const [o, setO] = useState({ subnav: false });
  const rows = Array.from({ length: 12 }, (_, i) => `Row ${i + 1}`);
  return (
    <Specimen
      wide
      preview={
        <div className="relative h-[360px] w-full max-w-[420px] overflow-y-auto rounded-ds-lg border border-ds-border bg-ds-bg">
          {/* The bar floats: controls on top, the style behind, clicks passing through. */}
          <div className="pointer-events-none sticky top-0 z-10 flex flex-col ds-nav-fade px-5 pt-5 pb-10 [&>*]:pointer-events-auto">
            <div className="flex items-center gap-2">
              <DsButton iconLeft={X} aria-label="Close" />
              <span className="flex-1 text-p text-ds-fg">Title</span>
              <DsButton iconLeft={MoreVertical} aria-label="More" />
            </div>
            {o.subnav && <DsSearch aria-label="Search" className="mt-5 w-full" />}
          </div>
          <ul className="flex flex-col px-5 pb-5">
            {rows.map((row) => (
              <li key={row} className="py-3 text-p text-ds-fg-muted">
                {row}
              </li>
            ))}
          </ul>
        </div>
      }
      controls={<Controls options={o} labels={{ subnav: "Sub-nav" }} onChange={setO} />}
    />
  );
}

export function ListRow() {
  const [o, setO] = useState({ checkbox: false, thumbnail: false, pill: false, detail: false, actions: false, selected: false });
  const [checked, setChecked] = useState(false);
  const id = useId();
  return (
    <Specimen
      preview={
        <DsListRow
          leading={o.checkbox && <DsCheckbox id={id} checked={checked} onCheckedChange={(c) => setChecked(c === true)} aria-label="Select Georgiana" />}
          thumbnail={o.thumbnail ? THUMBNAIL : undefined}
          title="Georgiana"
          pill={o.pill && <DsPill variant="highlight">Claude</DsPill>}
          meta="Dec 2, 2026 at 16:02"
          detail={o.detail && "Published"}
          actions={o.actions && <DsButton size="small" variant="text" iconLeft={MoreVertical} aria-label="More" />}
          selected={o.selected}
        />
      }
      controls={
        <Controls
          options={o}
          labels={{ checkbox: "Checkbox", thumbnail: "Thumbnail", pill: "Pill", detail: "Detail", actions: "Actions", selected: "Selected" }}
          onChange={setO}
        />
      }
    />
  );
}

export function NavItem() {
  const [o, setO] = useState({ icon: true, meta: true, open: true, selected: true });
  const [current, setCurrent] = useState("Default");
  const children = ["Default", "Rounded", "With custom icon", "Outlined"];
  return (
    <Specimen
      preview={
        <nav aria-label="Example" className="flex w-[200px] flex-col">
          <DsNavGroup
            label="Accordion"
            iconLeft={o.icon ? ComponentIcon : undefined}
            meta={o.meta ? children.length : undefined}
            open={o.open}
            onOpenChange={(open) => setO({ ...o, open })}
          >
            {children.map((child) => (
              <DsNavItem
                key={child}
                size="small"
                iconLeft={o.icon ? Bookmark : undefined}
                selected={o.selected && current === child}
                onClick={() => setCurrent(child)}
              >
                {child}
              </DsNavItem>
            ))}
          </DsNavGroup>
          <DsNavItem iconLeft={o.icon ? ComponentIcon : undefined} meta={o.meta ? 28 : undefined}>
            Categories
          </DsNavItem>
          <DsNavItem iconLeft={o.icon ? ComponentIcon : undefined} meta={o.meta ? "1,256" : undefined}>
            Media
          </DsNavItem>
        </nav>
      }
      controls={
        <Controls
          options={o}
          labels={{ icon: "Icons", meta: "Meta", open: "Group open", selected: "Selected" }}
          onChange={setO}
        />
      }
    />
  );
}

export function Toast() {
  const [o, setO] = useState({ description: true, action: true, label: false });
  const action = o.action ? (
    o.label ? (
      <DsToastAction>Undo</DsToastAction>
    ) : (
      <DsToastAction iconOnly aria-label="Done">
        <Check aria-hidden />
      </DsToastAction>
    )
  ) : undefined;
  return (
    <Specimen
      preview={
        <div className="flex w-full flex-col items-center gap-6">
          <DsToast title="Toast messaging" description={o.description ? "Description of toast" : undefined} action={action} />
          <DsButton
            onClick={() =>
              dsToast("Block removed", {
                description: o.description ? "It's gone from this post" : undefined,
                action: o.action ? { label: "Undo", onClick: () => dsToast("Restored") } : undefined,
              })
            }
          >
            Show a toast
          </DsButton>
          <DsToaster />
        </div>
      }
      controls={
        <Controls
          options={o}
          labels={{ description: "Description", action: "Action", label: "Labelled action" }}
          onChange={setO}
        />
      }
    />
  );
}

export function Dialog() {
  const [o, setO] = useState({ destructive: true, description: true, threeActions: false });
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Specimen
      preview={
        <>
          <DsButton onClick={() => setOpen(true)}>Open dialog</DsButton>
          {o.threeActions ? (
            <DsDialog
              open={open}
              onOpenChange={setOpen}
              title="Unsaved changes"
              description={o.description ? "You have changes that aren't saved yet. What would you like to do?" : undefined}
            >
              <DsDialogActions>
                <DsButton variant="primary" onClick={close}>Save draft</DsButton>
                <DsButton destructive onClick={close}>Discard changes</DsButton>
                <DsDialogCancel asChild>
                  <DsButton>Cancel</DsButton>
                </DsDialogCancel>
              </DsDialogActions>
            </DsDialog>
          ) : (
            <DsConfirmDialog
              open={open}
              onOpenChange={setOpen}
              title={o.destructive ? "Delete post?" : "Publish post?"}
              description={
                o.description
                  ? o.destructive
                    ? "This post will be deleted for good. This can't be undone."
                    : "This will make your post visible to everyone on your site."
                  : undefined
              }
              confirmLabel={o.destructive ? "Delete" : "Publish"}
              destructive={o.destructive}
              onConfirm={close}
            />
          )}
        </>
      }
      controls={
        <Controls
          options={o}
          labels={{ destructive: "Destructive", description: "Description", threeActions: "Three actions" }}
          onChange={setO}
        />
      }
    />
  );
}

export function SidePanel() {
  const [o, setO] = useState({ header: true, description: true, overlay: true });
  const [open, setOpen] = useState(false);
  return (
    <Specimen
      preview={
        <>
          <DsButton onClick={() => setOpen(true)}>Open side panel</DsButton>
          <DsSidePanel
            open={open}
            onOpenChange={setOpen}
            title={o.header ? "Page settings" : undefined}
            description={o.header && o.description ? "How this page is found and shared." : undefined}
            label="Page settings"
            overlay={o.overlay}
          >
            <div className={cn("flex flex-col gap-4", !o.header && "p-5")}>
              <DsField label="Title">
                <DsInput defaultValue="About" />
              </DsField>
              <DsField label="Description">
                <DsTextarea defaultValue="Who we are and what we make." />
              </DsField>
              <DsButton variant="primary" className="self-start" onClick={() => setOpen(false)}>
                Done
              </DsButton>
            </div>
          </DsSidePanel>
        </>
      }
      controls={
        <Controls
          options={o}
          labels={{ header: "Header", description: "Description", overlay: "Overlay" }}
          onChange={(next) => setO({ ...next, description: next.header && next.description })}
        />
      }
    />
  );
}

export function Tooltip() {
  return (
    <Specimen
      preview={
        <div className="flex items-center gap-2">
          <DsTooltip content="Edit">
            <DsButton iconLeft={Pencil} aria-label="Edit" />
          </DsTooltip>
          <DsTooltip content="Duplicate">
            <DsButton iconLeft={Copy} aria-label="Duplicate" />
          </DsTooltip>
          <DsTooltip content="Move to trash" side="bottom">
            <DsButton iconLeft={Trash2} aria-label="Move to trash" />
          </DsTooltip>
        </div>
      }
    />
  );
}

/** Components › Placeholder: the grey stand-in for media still to come, at common ratios. */
export function Placeholder() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
      <DsPlaceholder ratio="3/2" note="3:2 — a wide photo" className="col-span-2" />
      <DsPlaceholder ratio="4/5" note="4:5 — a portrait" />
      <DsPlaceholder ratio="1/1" note="1:1 — a square" />
      <DsPlaceholder className="col-span-2 h-24" />
    </div>
  );
}

/** Components › Media tile: a post in a feed (with description) and in a grid (without), text only too. */
export function MediaTile() {
  return (
    <div className="grid w-full max-w-3xl items-start gap-10 sm:grid-cols-2">
      <DsMediaTile
        href="#"
        title="Curtain dress"
        meta="Photography"
        description="A studio day with a dress made from old theatre curtains, shot on film and digital."
        media={<DsPlaceholder className="absolute inset-0 rounded-none p-0" />}
        mediaStyle={{ aspectRatio: 4 / 5 }}
      />
      <div className="flex flex-col gap-10">
        <DsMediaTile
          href="#"
          title="The UI is the fallback"
          meta="Design"
          media={<DsPlaceholder className="absolute inset-0 rounded-none p-0" />}
          mediaStyle={{ aspectRatio: 3 / 2 }}
        />
        <DsMediaTile href="#" title="Current state of affairs" meta="Journal" description="A text-only post: no media box." />
      </div>
    </div>
  );
}

/**
 * Blocks › Newsletter: the sign-up form, live. It posts to this install's
 * `/api/subscribe`, so an address typed here really joins the list.
 */
export function Newsletter() {
  const [o, setO] = useState({ text: true });
  return (
    <Specimen
      wide
      preview={
        <div className="w-full max-w-[661px]">
          <DsNewsletterBlock
            heading="Get new work by email"
            text={o.text ? "A note when something new goes up: a series, a case study, a journal entry. A few a year, no more." : undefined}
            buttonLabel="Subscribe"
            list="news"
            source="/parabola"
          />
        </div>
      }
      controls={<Controls options={o} labels={{ text: "Line of copy" }} onChange={setO} />}
    />
  );
}

/** Components › States › Empty state: one line, centred, with or without an action. */
export function EmptyState() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <div className="flex h-64 flex-col rounded-ds-lg border border-ds-border">
        <DsEmptyState action={<DsButton>New post</DsButton>}>No posts yet</DsEmptyState>
      </div>
      <div className="flex h-64 flex-col rounded-ds-lg border border-ds-border">
        <DsEmptyState>Choose a post or create a new one</DsEmptyState>
      </div>
    </div>
  );
}

/** Components › States › Info card: a side note with an icon, here another way to do the thing. */
export function InfoCard() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <DsInfoCard title="Set up with AI">
        <DsCopyField className="w-full" value="Set up Darmio for me. Follow SETUP.md in the Darmio folder." />
      </DsInfoCard>
      <DsInfoCard title="Not live yet">
        <p>Changes to a published post wait until you publish them.</p>
      </DsInfoCard>
    </div>
  );
}

/** Fields › Copy: a read-only value with a copy button inside, on one cut-short line or wrapped. */
export function CopyField() {
  return (
    <div className={DS_FIELDS_CLASS}>
      <DsField label="Prompt">
        <DsCopyField value="Set up Darmio for me. Follow SETUP.md in the Darmio folder: it says what to ask me and what to do." />
      </DsField>
      <DsField label="Command">
        <DsCopyField mono value="npm run reset-password -- you@example.com" />
      </DsField>
      <DsField label="Prompt, wrapped" description="wrap: the whole text, the box growing downward; past ten lines it's cut short.">
        <DsCopyField wrap value="Set up Darmio for me. Follow SETUP.md in the Darmio folder: it says what to ask me and what to do." />
      </DsField>
    </div>
  );
}
