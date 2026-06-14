/**
 * Vendored ui-components barrel (see docs/uic-migration-plan.md).
 *
 * Every symbol the app uses is now a local vendored copy re-exported below;
 * the @bloom-housing/ui-components package has been removed. This file is the
 * single import surface (`@uic`) for all former package components.
 */

// Type-only names must use `export type` so babel/webpack drop them at runtime.
export {
  t,
  addTranslation,
  createTranslationInstance,
  setActiveTranslationInstance,
  locale,
} from "./translator"
export type { TranslationBundle } from "./translator"
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

// Phase 4: tables, overlays, cards, header/footer, alerts
export {
  StandardTable,
  Row,
  HeaderCell,
  Cell,
  TableThumbnail,
} from "./StandardTable"
export type {
  TableHeaders,
  TableHeadersOptions,
  StandardTableCell,
  StandardTableData,
  StandardTableProps,
} from "./StandardTable"
export { MinimalTable } from "./MinimalTable"
export type { MinimalTableProps } from "./MinimalTable"
export { StackedTable } from "./StackedTable"
export type { StackedTableRow, StackedTableProps } from "./StackedTable"
export { CategoryTable } from "./CategoryTable"
export type { CategoryTableSection, CategoryTableProps } from "./CategoryTable"
export { getTranslationWithArguments } from "./getTranslationWithArguments"
export { Overlay } from "./Overlay"
export type { OverlayProps } from "./Overlay"
export { Modal } from "./Modal"
export type { ModalProps } from "./Modal"
export { LoadingOverlay } from "./LoadingOverlay"
export { LocalizedLink } from "./LocalizedLink"
export { useFallbackImage } from "./useFallbackImage"
export { ApplicationStatus } from "./ApplicationStatus"
export type { ApplicationStatusProps } from "./ApplicationStatus"
export { Tooltip } from "./Tooltip"
export type { TooltipProps, TooltipPosition } from "./Tooltip"
export { ImageCard } from "./ImageCard"
export type {
  ImageCardProps,
  ImageItem,
  ImageTag,
  ImageTagTooltip,
  StatusBarType,
} from "./ImageCard"
export { ListingCard } from "./ListingCard"
export type {
  ListingCardProps,
  ListingCardHeader,
  ListingCardContentProps,
  ListingFooterButton,
  CardTag,
} from "./ListingCard"
export { AlertBox } from "./AlertBox"
export type { AlertBoxProps } from "./AlertBox"
export { colorClasses } from "./alertTypes"
export type { AlertTypes } from "./alertTypes"
export { SiteAlert, setSiteAlertMessage, clearSiteAlertMessage } from "./SiteAlert"
export { Card, CardHeader, CardSection, CardFooter } from "./Card"
export type { CardProps, CardHeaderProps, CardSectionProps, CardFooterProps } from "./Card"
export type { DOBFieldValues } from "./DOBFieldValues"
export { LanguageNav } from "./LanguageNav"
export type { LangItem, LanguageNavProps } from "./LanguageNav"
export { SiteFooter } from "./SiteFooter"
export type { FooterProps } from "./SiteFooter"
export { FooterNav } from "./FooterNav"
export type { FooterNavProps } from "./FooterNav"
export { FooterSection } from "./FooterSection"
export type { FooterSectionProps } from "./FooterSection"
export { SiteHeader } from "./SiteHeader"
export type { SiteHeaderProps, MenuLink } from "./SiteHeader"
