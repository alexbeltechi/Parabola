import type { ComponentType } from "react";
import {
  Blocks,
  Component,
  LayoutPanelTop,
  House,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  ListTree,
  Mail,
  Ruler,
  MousePointerClick,
  Paintbrush,
  Palette,
  SquareCheck,
  Tag,
  TextCursorInput,
  Type,
  type LucideIcon,
} from "lucide-react";
import { AccentColoursSection, MainColoursSection } from "./colours-section";
import { FontsSection } from "./fonts-section";
import { FontFamiliesSection } from "./font-families-section";
import { SpacingSection } from "./spacing-section";
import { IntroSection } from "./intro-section";
import { ThemeSection } from "./theme-section";
import { BlocksOverview, ComponentsOverview } from "./tier-overview";
import * as S from "./specimens";

export type DsPage = { slug: string; label: string; component: ComponentType };
export type DsGroup = {
  slug: string;
  label: string;
  icon: LucideIcon;
  pages: DsPage[];
  /** One page, shown as a single sidebar row instead of a collapsible group. */
  single?: boolean;
};

/** A sidebar section: Foundations, Primitives, Components or Blocks (see README). */
export type DsTier = { label?: string; groups: DsGroup[] };

/**
 * Every /parabola page, by tier and group as in the sidebar. Each page lives at
 * /parabola/<group>/<page> (group slugs are unique across tiers); adding a
 * component is one entry here.
 */
export const DS_TIERS: DsTier[] = [
  {
    groups: [
      {
        slug: "intro",
        label: "Intro",
        icon: House,
        single: true,
        pages: [{ slug: "welcome", label: "Welcome", component: IntroSection }],
      },
      {
        slug: "theme",
        label: "Theme",
        icon: Paintbrush,
        single: true,
        pages: [{ slug: "fonts", label: "Theme", component: ThemeSection }],
      },
    ],
  },
  {
    label: "Foundations",
    groups: [
      {
        slug: "colours",
        label: "Colours",
        icon: Palette,
        pages: [
          { slug: "main", label: "Main", component: MainColoursSection },
          { slug: "accent", label: "Accent", component: AccentColoursSection },
        ],
      },
      {
        slug: "typography",
        label: "Typography",
        icon: Type,
        pages: [
          { slug: "font-families", label: "Font families", component: FontFamiliesSection },
          { slug: "type-scale", label: "Type scale", component: FontsSection },
        ],
      },
      {
        slug: "spacing",
        label: "Spacing",
        icon: Ruler,
        single: true,
        pages: [{ slug: "scale", label: "Scale", component: SpacingSection }],
      },
    ],
  },
  {
    label: "Primitives",
    groups: [
      {
        slug: "buttons",
        label: "Buttons",
        icon: MousePointerClick,
        pages: [
          {
            slug: "icon-only-button",
            label: "Icon only button",
            component: S.IconOnlyButton,
          },
          {
            slug: "label-button",
            label: "Label button",
            component: S.LabelButton,
          },
          {
            slug: "text-button",
            label: "Text button",
            component: S.TextButton,
          },
        ],
      },
      {
        slug: "labels",
        label: "Labels",
        icon: Tag,
        pages: [
          { slug: "pill", label: "Pill", component: S.Pill },
          { slug: "tooltip", label: "Tooltip", component: S.Tooltip },
          { slug: "toast", label: "Toast", component: S.Toast },
          { slug: "dialog", label: "Dialog", component: S.Dialog },
          { slug: "side-panel", label: "Side panel", component: S.SidePanel },
        ],
      },
      {
        slug: "selection",
        label: "Selection",
        icon: SquareCheck,
        pages: [
          { slug: "checkbox", label: "Checkbox", component: S.Checkbox },
          { slug: "radio", label: "Radio", component: S.Radio },
        ],
      },
      {
        slug: "fields",
        label: "Fields",
        icon: TextCursorInput,
        pages: [
          { slug: "search", label: "Search", component: S.SearchField },
          { slug: "input", label: "Input", component: S.InputField },
          { slug: "textarea", label: "Textarea", component: S.TextareaField },
          { slug: "rich-text", label: "Rich text", component: S.RichText },
          { slug: "select", label: "Select", component: S.SelectField },
          {
            slug: "multi-select",
            label: "Multi-select",
            component: S.MultiSelectField,
          },
          { slug: "date-picker", label: "Date picker", component: S.DateField },
          { slug: "copy", label: "Copy", component: S.CopyField },
          { slug: "form", label: "Form", component: S.FieldsForm },
        ],
      },
      {
        slug: "navigation",
        label: "Navigation",
        icon: ListTree,
        pages: [
          { slug: "nav-item", label: "Nav item", component: S.NavItem },
          {
            slug: "dropdown-menu",
            label: "Dropdown menu",
            component: S.Dropdown,
          },
          { slug: "tray", label: "Tray and menu items", component: S.Tray },
        ],
      },
      {
        slug: "layout",
        label: "Layout",
        icon: LayoutPanelTop,
        pages: [
          { slug: "divider", label: "Divider", component: S.Divider },
          { slug: "list-row", label: "List row", component: S.ListRow },
          { slug: "nav-fade", label: "Nav fade", component: S.NavFade },
        ],
      },
    ],
  },
  {
    label: "Components",
    groups: [
      {
        slug: "components",
        label: "Overview",
        icon: Component,
        single: true,
        pages: [{ slug: "overview", label: "Components", component: ComponentsOverview }],
      },
      {
        slug: "media",
        label: "Media",
        icon: ImageIcon,
        pages: [
          { slug: "media-tile", label: "Media tile", component: S.MediaTile },
          { slug: "placeholder", label: "Placeholder", component: S.Placeholder },
        ],
      },
      {
        slug: "links",
        label: "Links",
        icon: LinkIcon,
        pages: [{ slug: "link-list", label: "Link list", component: S.LinkList }],
      },
      {
        slug: "states",
        label: "States",
        icon: Info,
        pages: [
          { slug: "empty-state", label: "Empty state", component: S.EmptyState },
          { slug: "info-card", label: "Info card", component: S.InfoCard },
          { slug: "progress", label: "Progress", component: S.Progress },
        ],
      },
    ],
  },
  {
    label: "Blocks",
    groups: [
      {
        slug: "blocks",
        label: "Overview",
        icon: Blocks,
        single: true,
        pages: [{ slug: "overview", label: "Blocks", component: BlocksOverview }],
      },
      {
        slug: "newsletter",
        label: "Newsletter",
        icon: Mail,
        single: true,
        pages: [{ slug: "sign-up", label: "Newsletter", component: S.Newsletter }],
      },
    ],
  },
];

/** Every group, in sidebar order, for routing and lookups. */
export const DS_GROUPS: DsGroup[] = DS_TIERS.flatMap((tier) => tier.groups);

export const dsHref = (group: DsGroup, page: DsPage) => `/parabola/${group.slug}/${page.slug}`;

export function findDsPage(groupSlug: string, pageSlug: string) {
  const group = DS_GROUPS.find((g) => g.slug === groupSlug);
  const page = group?.pages.find((p) => p.slug === pageSlug);
  return group && page ? { group, page } : null;
}
