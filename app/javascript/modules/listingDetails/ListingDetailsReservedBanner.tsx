import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
// import { renderInlineMarkup, renderMarkup } from "../../util/languageUtil"
import { renderMarkup } from "../../util/languageUtil"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
  customListingType?: string
}

export const ListingDetailsReservedBanner = ({
  reservedCommunityMinimumAge,
  reservedCommunityType,
  customListingType,
}: ListingDetailsReservedBannerProps) => {
  if (customListingType) {
    const element = () => {
      return (
        <div>
          <div>{renderMarkup(`${t("listings.customListingType.educator.banner")}`, "<b>")}</div>
          <br />
          <div>
            {renderMarkup(
              t(`listings.customListingType.educator.banner.link.content`, {
                url: `#listing-detail-eligibility`,
              })
            )}
          </div>
        </div>
      )
    }
    return (
      <div className="md:pr-8 md:w-2/3 mt-4 w-full mb-8 md:mb-0 md:pl-4 lg:pl-0">
        <Message warning={true}>{element()}</Message>
      </div>
    )
  }

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
