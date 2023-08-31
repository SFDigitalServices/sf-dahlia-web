import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
import { getCustomListingType, renderInlineMarkup } from "../../util/languageUtil"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
  customListingType?: string
}

const buildMessage = (
  reservedCommunityMinimumAge?: number,
  reservedCommunityType?: string,
  customListingType?: string
) => {
  if (customListingType && getCustomListingType(customListingType)) {
    return (
      <Message warning={true}>
        {renderInlineMarkup(`${t("listings.customListingType.educator.banner")}`, "<p><b>")}
        {renderInlineMarkup(
          t(`listings.customListingType.educator.banner.link.content`, {
            url: `#listing-details-eligibility`,
          }),
          "<p><a>"
        )}
      </Message>
    )
  }

  if (
    !reservedCommunityType ||
    reservedCommunityType === RESERVED_COMMUNITY_TYPES.HABITAT ||
    !Object.values(RESERVED_COMMUNITY_TYPES).includes(reservedCommunityType)
  )
    return null

  const content =
    reservedCommunityType === RESERVED_COMMUNITY_TYPES.SENIOR
      ? t(`listings.allUnitsReservedFor.${reservedCommunityType}`, {
          age: reservedCommunityMinimumAge,
        })
      : t(`listings.allUnitsReservedFor.${reservedCommunityType}`)

  return <Message warning={true}>{content}</Message>
}

export const ListingDetailsReservedBanner = ({
  reservedCommunityMinimumAge,
  reservedCommunityType,
  customListingType,
}: ListingDetailsReservedBannerProps) => {
  const message = buildMessage(
    reservedCommunityMinimumAge,
    reservedCommunityType,
    customListingType
  )
  if (!message) return
  return <div className="md:pr-8 md:w-2/3 mt-4 w-full mb-8 md:mb-0 md:pl-4 lg:pl-0">{message}</div>
}
