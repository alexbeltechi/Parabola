/**
 * Parabola, the design system (showcase: /parabola). Import from here:
 *   import { DsButton, DsField, DsInput } from "@beltechi/parabola";
 *
 * Naming: "Parabola" is the brand (the folder, the URL, the docs); `ds` is its
 * code namespace and stays short and brand-free: `Ds*` components, `--ds-*`
 * tokens, `*-ds-*` Tailwind utilities, `ds-*` CSS utilities. New pieces
 * follow the same prefixes.
 *
 * Named re-exports (not `export *`), so the client components keep their own
 * "use client" boundary when a server component imports the barrel.
 */
export { DS_ACCENTS, type DsAccent } from "./accents";
export { cn } from "./cn";
export { DS_GUTTER_PX, DS_SPACES, type DsSpace } from "./spacing";
export {
  DS_FONTS,
  DS_DEFAULT_FONT,
  DS_DEFAULT_DISPLAY_FONT,
  dsFont,
  dsCustomFont,
  dsCustomFontFromInput,
  dsGoogleFontsUrl,
  dsGoogleWeights,
  dsNearestWeight,
  dsWeightName,
  DS_WEIGHT_NAMES,
  type DsFont,
  type DsCustomFont,
} from "./fonts";
export {
  DS_DEFAULT_THEME,
  DS_TEXT_STYLES,
  DS_TEXT_STYLE_DEFAULTS,
  dsApplyTheme,
  dsThemeCss,
  dsThemeFont,
  dsThemeFonts,
  dsThemeVars,
  parseDsThemeConfig,
  type DsFamilyRole,
  type DsTextStyle,
  type DsTextStyleConfig,
  type DsThemeConfig,
} from "./theme";
export { DsThemeStyle } from "./theme-style";
export {
  DsProvider,
  DsLink,
  useDsSetTheme,
  useDsThemeConfig,
  type DsLinkComponent,
  type DsLinkProps,
} from "./provider";
export { DsButton, dsButtonVariants, type DsButtonProps } from "./primitives/button";
export { DS_COLUMNS_CLASS } from "./primitives/columns";
export { DsCheckbox, DsCheckboxMark } from "./primitives/checkbox";
export { DsDatePicker } from "./primitives/date-picker";
export { DsDialog, DsDialogActions, DsDialogCancel, DsConfirmDialog, useDsConfirm } from "./primitives/dialog";
export { DsDivider } from "./primitives/divider";
export {
  DsDropdown,
  DsDropdownTrigger,
  DsDropdownContent,
  DsDropdownItem,
  DsDropdownCheckboxItem,
  DsDropdownRadioGroup,
  DsDropdownRadioItem,
  DsDropdownLabel,
  DsDropdownSeparator,
} from "./primitives/dropdown";
export {
  DsField,
  DsInput,
  DsSearch,
  DsTextarea,
  useDsField,
  DS_FIELD_BOX_CLASS,
  DS_FIELD_BARE_CLASS,
  DS_FIELD_INPUT_CLASS,
  DS_FIELD_CLEAR_CLASS,
  DS_FIELD_WIDTH_CLASS,
  DS_FIELDS_CLASS,
  type DsInputProps,
  type DsControlProps,
} from "./primitives/field";
export { DsListRow } from "./primitives/list-row";
export { DsMultiSelect, type DsMultiSelectOption } from "./primitives/multi-select";
export { DsNavItem, DsNavGroup, dsNavItemVariants } from "./primitives/nav-item";
export { DsNavBar, DsMenu } from "./primitives/nav";
export { DsPill, dsPillVariants } from "./primitives/pill";
export { DS_PROSE_CLASS } from "./primitives/prose";
export { DsRadioGroup, DsRadio, DsRadioMark } from "./primitives/radio";
export { DsSelect, type DsSelectOption } from "./primitives/select";
export { DsSidePanel } from "./primitives/side-panel";
export { DsSwitch } from "./primitives/switch";
export { DsThemeToggle } from "./primitives/theme-toggle";
export { DsToaster, DsToast, DsToastAction, dsToast } from "./primitives/toast";
export { DsCopyField } from "./primitives/copy-field";
export { DsProgress, dsSegmentColor, type DsProgressSegment } from "./primitives/progress";
export { DsTooltip } from "./primitives/tooltip";
export {
  DsTray,
  DsMenuItem,
  DsMenuItemContent,
  DsMenuSeparator,
  DsColourDot,
  DS_TRAY_CLASS,
  dsMenuItemVariants,
  type DsMenuItemContentProps,
} from "./primitives/tray";

// Components (see components/).
export { DsMediaTile } from "./components/media-tile";
export { DsPlaceholder } from "./components/placeholder";
export { DsEmptyState } from "./components/empty-state";
export { DsInfoCard } from "./components/info-card";
export { DsLinkList, type DsLinkListItem } from "./components/link-list";
export { DsFontPairing, dsFontOptions } from "./components/font-pairing";
