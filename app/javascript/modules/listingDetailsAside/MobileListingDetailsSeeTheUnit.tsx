import React from "react"
import { ListingDetailItem, t, Mobile } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsSeeTheUnit } from "./ListingDetailsSeeTheUnit"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
}

export const MobileListingDetailsSeeTheUnit = ({
  listing,
  imageSrc,
}: ListingDetailsSidebarProps) => {
  return (
    listing && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t("label.seeTheUnit")}
          hideHeader={true}
          desktopClass="header-hidden"
          subtitle=""
        >
          <ListingDetailsInfoSession listing={listing} />
          <ListingDetailsSeeTheUnit listing={listing} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
