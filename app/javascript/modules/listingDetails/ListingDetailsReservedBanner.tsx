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

  if (!Object.values(RESERVED_COMMUNITY_TYPES).includes(reservedCommunityType)) {
    return null
  }

  const message =
    reservedCommunityType === RESERVED_COMMUNITY_TYPES.SENIOR
      ? t(`listings.allUnitsReservedFor.${reservedCommunityType}`, {
          age: reservedCommunityMinimumAge,
        })
      : t(`listings.allUnitsReservedFor.${reservedCommunityType}`)

  return (
    <div className="md:pr-8 md:w-2/3 mt-4 w-full mb-8 md:mb-0 md:pl-4 lg:pl-0">
      <Message warning={true}>{message}</Message>
    </div>
  )
}
