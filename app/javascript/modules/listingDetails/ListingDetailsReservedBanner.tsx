import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
// import { renderInlineMarkup, renderMarkup } from "../../util/languageUtil"
import { getCustomListingType, renderMarkup } from "../../util/languageUtil"
import { RailsListing } from "../listings/SharedHelpers"

export interface ListingDetailsReservedBannerProps {
  listing: RailsListing
}

const buildMessage = (listing: RailsListing) => {
  if (listing.Custom_Listing_Type && getCustomListingType(listing.Custom_Listing_Type)) {
    return (
      <Message warning={true}>
        {renderMarkup(`${t("listings.customListingType.educator.banner")}`)}
        {renderMarkup(
          t(`listings.customListingType.educator.banner.link.content`, {
            url: `#listing-detail-eligibility`,
          })
        )}
      </Message>
    )
  } else {
    if (
      !listing.Reserved_community_type ||
      listing.Reserved_community_type === RESERVED_COMMUNITY_TYPES.HABITAT ||
      !Object.values(RESERVED_COMMUNITY_TYPES).includes(listing.Reserved_community_type)
    )
      return null

    const message =
      listing.Reserved_community_type === RESERVED_COMMUNITY_TYPES.SENIOR
        ? t(`listings.allUnitsReservedFor.${listing.Reserved_community_type}`, {
            age: listing.Reserved_community_minimum_age,
          })
        : t(`listings.allUnitsReservedFor.${listing.Reserved_community_type}`)

    return <Message warning={true}>{message}</Message>
  }
}

export const ListingDetailsReservedBanner = ({ listing }: ListingDetailsReservedBannerProps) => {
  return (
    <div className="md:pr-8 md:w-2/3 mt-4 w-full mb-8 md:mb-0 md:pl-4 lg:pl-0">
      {buildMessage(listing)}
    </div>
  )
}
