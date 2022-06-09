import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
}

export const ListingDetailsReservedBanner = ({
  reservedCommunityMinimumAge,
  reservedCommunityType,
}: ListingDetailsReservedBannerProps) => {
  if (!reservedCommunityType || reservedCommunityType === RESERVED_COMMUNITY_TYPES.HABITAT)
    return null

  let message
  switch (reservedCommunityType) {
    case RESERVED_COMMUNITY_TYPES.SENIOR:
      message = t(`listings.allUnitsReservedFor.${reservedCommunityType}`, {
        age: reservedCommunityMinimumAge,
      })
      break
    default:
      message = t(`listings.allUnitsReservedFor.${reservedCommunityType}`)
  }

  return (
    <div className="md:pr-8 md:w-2/3 mt-4 w-full">
      <Message warning={true}>{message}</Message>
    </div>
  )
}
