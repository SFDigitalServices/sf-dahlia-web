/* eslint-disable import/export --
 * Names exported both here and by the star re-export are intentional overrides:
 * per ES module semantics, explicit named exports take precedence over `export *`.
 */
/**
 * Vendored ui-components barrel (see docs/uic-migration-plan.md).
 *
 * Everything still comes from @bloom-housing/ui-components via the star
 * re-export below; vendored local copies are listed as explicit named
 * re-exports, which take precedence over the star export. As components
 * are migrated, add their names here. When the star export is gone, the
 * package can be uninstalled.
 */
export * from "@bloom-housing/ui-components"

// Type-only names must use `export type` so babel/webpack drop them at runtime.
export { t, addTranslation } from "./translator"
export { Icon, IconFillColors } from "./Icon"
export type { IconFill, IconSize, IconTypes, UniversalIconType, IconProps } from "./Icon"
export {
  AppearanceStyleType,
  AppearanceSizeType,
  AppearanceBorderType,
  AppearanceShadeType,
  classNamesForAppearanceTypes,
} from "./AppearanceTypes"
export type { AppearanceProps } from "./AppearanceTypes"
export { Button, buttonClassesForProps, buttonInner } from "./Button"
export type { ButtonProps } from "./Button"
export { LinkButton } from "./LinkButton"
export type { LinkButtonProps } from "./LinkButton"
export { Heading } from "./Heading"
export type { HeadingProps, HeaderType } from "./Heading"
export { NavigationContext } from "./NavigationContext"
export type {
  NavigationContextProps,
  LinkProps,
  GenericRouter,
  GenericRouterOptions,
} from "./NavigationContext"
export { isExternalLink, isInternalLink } from "./links"
export { Desktop, Mobile } from "./ResponsiveWrappers"
