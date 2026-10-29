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
export { DS_DEFAULT_RADIUS, DS_RADII, DS_RADIUS_MAX, DS_RADIUS_TOKENS, dsRadiusPx, type DsRadius, type DsRadiusToken } from "./radius";
export {
  DS_FONTS,
  DS_DEFAULT_FONT,
  DS_DEFAULT_HEADING_FONT,
  dsFont,
  dsCustomFont,
  dsCustomFontFromInput,
  dsGoogleFontsUrl,
  dsGoogleFontsPage,
  dsGoogleWeights,
  dsNearestWeight,
  dsWeightName,
  DS_WEIGHT_NAMES,
  type DsFont,
  type DsCustomFont,
} from "./fonts";
export {
  DS_BODY_FAMILY,
  DS_DEFAULT_LIBRARY,
  DS_DEFAULT_THEME,
  DS_DEFAULT_THEME_ID,
  DS_HEADING_FAMILY,
  DS_PERMANENT_FONT,
  DS_TEXT_STYLES,
  DS_TEXT_STYLE_DEFAULTS,
  dsActiveTheme,
  dsApplyTheme,
  dsClearAppliedTheme,
  DS_THEME_SCOPE,
  dsThemeCss,
  dsThemeDarkVars,
  dsThemeEntryId,
  dsFamily,
  dsFamilyFont,
  dsFamilyId,
  dsRemoveFamily,
  dsThemeFont,
  dsThemeFonts,
  dsThemeVars,
  parseDsThemeConfig,
  parseDsThemeExport,
  dsThemeExport,
  parseDsThemeLibrary,
  type DsFontFamily,
  type DsTextStyle,
  type DsTextStyleConfig,
  type DsThemeConfig,
  type DsThemeEntry,
  type DsThemeLibrary,
} from "./theme";
export {
  DS_BASE_COLOURS,
  DS_ACCENT_COLOURS,
  DS_ICON_LIBRARIES,
  DS_DEFAULT_BASE_COLOUR,
  DS_DEFAULT_ACCENT_COLOUR,
  DS_DEFAULT_COLOURS,
  dsAccentColour,
  dsAccentTokens,
  dsBaseColour,
  dsBaseTokens,
  dsColourShown,
  dsColourTokens,
  dsShift,
  dsWarmth,
  dsWithWarmth,
  dsHexToHsl,
  dsHslToHex,
  DS_SHIFT_MAX,
  dsCounterpart,
  dsInkCounterpart,
  dsLuminance,
  dsHexToHsv,
  dsHsvToHex,
  dsIsHex,
  dsMix,
  dsNormalizeHex,
  type DsAccentColour,
  type DsBaseColour,
  type DsColourKind,
  type DsThemeColour,
  type DsThemeColours,
} from "./colours";
export { DsThemeStyle } from "./theme-style";
export {
  DsProvider,
  DsLink,
  DsModeScope,
  useDsSetTheme,
  useDsThemeLibrary,
  type DsLinkComponent,
  type DsLinkProps,
} from "./provider";
export { DsAccordion, DsAccordionGroup } from "./primitives/accordion";
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
export { DsTopBar, type DsTopBarSurface } from "./primitives/top-bar";
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
export { DsColourPicker } from "./components/colour-picker";
export { DsColourWheel, type DsWheelPoint } from "./components/colour-wheel";
