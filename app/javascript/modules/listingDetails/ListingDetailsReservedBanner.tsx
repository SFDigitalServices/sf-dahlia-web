import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
import { renderInlineMarkup, renderMarkup } from "../../util/languageUtil"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
  detailBanner?: string
}

export const ListingDetailsReservedBanner = ({
  reservedCommunityMinimumAge,
  reservedCommunityType,
  detailBanner,
}: ListingDetailsReservedBannerProps) => {
  if (!reservedCommunityType || reservedCommunityType === RESERVED_COMMUNITY_TYPES.HABITAT)
    return null

  if (!Object.values(RESERVED_COMMUNITY_TYPES).includes(reservedCommunityType)) {
    return null
  }

  const renderString = () => renderMarkup(detailBanner, "<div><p><br><ul><li><b><hr>")

  if(detailBanner) {
    return (
      <div className="md:pr-8 md:w-2/3 mt-4 w-full">
        <Message warning={true}>{renderString()}</Message>
      </div>
    )
  } else {
    return null
  }
}
