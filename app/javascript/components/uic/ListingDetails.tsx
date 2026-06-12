// Vendored from @bloom-housing/ui-components src/page_components/listing/ListingDetails.tsx
import * as React from "react"
import {
  ResponsiveContentList,
  ResponsiveContentItem,
  ResponsiveContentItemHeader,
  ResponsiveContentItemBody,
} from "./ResponsiveContentList"
import { ListingDetailHeader, ListingDetailHeaderProps } from "./ListingDetailHeader"
import "./ListingDetails.scss"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ListingDetails = (props: any) => (
  <div className="details">
    <ResponsiveContentList>{props.children}</ResponsiveContentList>
  </div>
)

export const ListingDetailItem = (props: ListingDetailHeaderProps) => (
  <ResponsiveContentItem desktopClass={props.desktopClass}>
    <ResponsiveContentItemHeader>
      <ListingDetailHeader
        title={props.title}
        subtitle={props.subtitle}
        imageSrc={props.imageSrc}
        imageAlt={props.imageAlt}
        hideHeader={props.hideHeader}
      />
    </ResponsiveContentItemHeader>
    <ResponsiveContentItemBody>{props.children}</ResponsiveContentItemBody>
  </ResponsiveContentItem>
)
