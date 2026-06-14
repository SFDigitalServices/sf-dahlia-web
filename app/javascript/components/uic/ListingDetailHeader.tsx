// Vendored from @bloom-housing/ui-components src/page_components/listing/ListingDetailHeader.tsx
import * as React from "react"
import { Icon } from "./Icon"
import "./ListingDetailHeader.css"

export interface ListingDetailHeaderProps {
  imageAlt: string
  imageSrc: string
  subtitle: string
  title: string
  children?: React.ReactNode
  hideHeader?: boolean
  desktopClass?: string
}

const ListingDetailHeader = (props: ListingDetailHeaderProps) => (
  <header className={`detail-header ${props.hideHeader ? "md:hidden" : ""}`}>
    <span className={"detail-header__image-container"}>
      <img alt={props.imageAlt} className="detail-header__image " src={props.imageSrc} />
    </span>
    <hgroup className="detail-header__hgroup">
      <h2 className="detail-header__title">{props.title}</h2>
      <span className="detail-header__subtitle">{props.subtitle}</span>
      <Icon symbol="arrowDown" size="medium" />
    </hgroup>
  </header>
)

export { ListingDetailHeader as default, ListingDetailHeader }
