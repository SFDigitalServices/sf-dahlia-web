import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"

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

  const message =
    detailBanner ? detailBanner : undefined

  return (
    <div className="md:pr-8 md:w-2/3 mt-4 w-full">
      <Message warning={true}>{message}</Message>
    </div>
  )
}
