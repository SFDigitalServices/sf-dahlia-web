import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
import { getCustomListingType } from "../../util/languageUtil"
import "./ListingDetailsReservedBanner.scss"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
  customListingType?: string
}

const buildMultiLineMessage = (): React.JSX.Element => {
  return (
    <div className="educator1-banner">
      <b>{`${t("listings.customListingType.educator.banner.header")}`}</b>
      <p>
        <a target="_self" href="#listing-details-eligibility">
          {`${t("listings.customListingType.educator.banner.body")}`}
        </a>
      </p>
    </div>
  )
}

const buildMessage = (
  reservedCommunityMinimumAge?: number,
  reservedCommunityType?: string,
  customListingType?: string
): React.JSX.Element => {
  if (customListingType && getCustomListingType(customListingType)) {
    return <Message warning={true}>{buildMultiLineMessage()}</Message>
  }

  if (
    !reservedCommunityType ||
    reservedCommunityType === RESERVED_COMMUNITY_TYPES.HABITAT ||
    !Object.values(RESERVED_COMMUNITY_TYPES).includes(reservedCommunityType)
  )
    return null

  const content: string =
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
  const message: React.JSX.Element = buildMessage(
    reservedCommunityMinimumAge,
    reservedCommunityType,
    customListingType
  )
  if (!message) return
  return <div className="md:pr-8 md:w-2/3 mt-4 w-full mb-8 md:mb-0 md:pl-4 lg:pl-0">{message}</div>
}
