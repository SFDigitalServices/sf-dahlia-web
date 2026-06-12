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

// Phase 2: forms
export { Field } from "./Field"
export type { FieldProps } from "./Field"
export { Form } from "./Form"
export { Select } from "./Select"
export type { SelectOption } from "./Select"
export { FieldGroup } from "./FieldGroup"
export type { FieldSingle } from "./FieldGroup"
export { PhoneField } from "./PhoneField"
export { PhoneMask, formatPhoneNumber } from "./PhoneMask"
export { FormCard } from "./FormCard"
export type { FormCardProps } from "./FormCard"
export { ExpandableContent, Order } from "./ExpandableContent"
export { ErrorMessage } from "./ErrorMessage"
export { FormOptions, numberOptions } from "./formOptions"
export type { FormOptionsProps } from "./formOptions"
export { emailRegex, passwordRegex, httpsRegex, urlRegex } from "./validators"

// Phase 3: layout & listings components
export { ApplicationStatusType } from "./ApplicationStatusType"
export { MultiLineAddress } from "./MultiLineAddress"
export type { Address, MultiLineAddressProps } from "./MultiLineAddress"
export { OneLineAddress } from "./OneLineAddress"
export type { OneLineAddressProps } from "./OneLineAddress"
export { ExpandableText } from "./ExpandableText"
export type { ExpandableTextProps } from "./ExpandableText"
export { ActionBlock, ActionBlockLayout, ActionBlockBackground } from "./ActionBlock"
export { InfoCard } from "./InfoCard"
export type { InfoCardProps } from "./InfoCard"
export { Hero } from "./Hero"
export type { HeroProps } from "./Hero"
export { PageHeader } from "./PageHeader"
export type { PageHeaderProps } from "./PageHeader"
export { PreferencesList } from "./PreferencesList"
export type { ListPreference, ListPreferenceLink, PreferencesListProps } from "./PreferencesList"
export { ProgressNav } from "./ProgressNav"
export { ContentAccordion } from "./ContentAccordion"
export type { AccordionTheme } from "./ContentAccordion"
export { Description } from "./Description"
export type { DescriptionProps } from "./Description"
export { Message } from "./Message"
export type { MessageProps } from "./Message"
export { Tag } from "./Tag"
export type { TagProps } from "./Tag"
export { ListSection } from "./ListSection"
export type { ListSectionProps } from "./ListSection"
export { InfoCardGrid } from "./InfoCardGrid"
export type { InfoCardGridProps } from "./InfoCardGrid"
export { GridSection, GridCell } from "./GridSection"
export type { GridSectionProps, GridCellProps } from "./GridSection"
export { SidebarBlock } from "./SidebarBlock"
export type { SidebarBlockProps } from "./SidebarBlock"
export { OrDivider } from "./OrDivider"
export { QuantityRowSection } from "./QuantityRowSection"
export type { QuantityRow, QuantityRowSectionProps } from "./QuantityRowSection"
export { EventSection } from "./EventSection"
export type { EventType } from "./EventSection"
export { ExpandableSection } from "./ExpandableSection"
export type { ExpandableSectionProps } from "./ExpandableSection"
export { Contact } from "./Contact"
export type { ContactProps } from "./Contact"
export { ContactAddress } from "./ContactAddress"
export type { ContactAddressProps } from "./ContactAddress"
export { AdditionalFees } from "./AdditionalFees"
export type { AdditionalFeesProps } from "./AdditionalFees"
export { ListingDetails, ListingDetailItem } from "./ListingDetails"
export { ListingDetailHeader } from "./ListingDetailHeader"
export type { ListingDetailHeaderProps } from "./ListingDetailHeader"
export {
  ResponsiveContentList,
  ResponsiveContentItem,
  ResponsiveContentItemHeader,
  ResponsiveContentItemBody,
  resetAccordionUuid,
} from "./ResponsiveContentList"
