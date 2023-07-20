import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
import { renderInlineMarkup, renderMarkup } from "../../util/languageUtil"

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

  const content = () => (
    <div style={{textTransform: "none"}}>
      <p>This is my list</p>
      <br />
      <ul style={{listStyleType: "disc", paddingLeft: "1em"}}>
        <li>hello <b>world</b></li>
        <li>Good Bye</li>
      </ul>
    </div>
  )

  const contentString = () => (
     // "<div style={{textTransform: \"none\"}}><p>This is my list</p><br /><ul style={{listStyleType: \"disc\", paddingLeft: \"1em\"}}><li>hello <b>world</b></li><li>Good Bye</li></ul></div>"
    `
    This is my list

    - item one
    - item two
    `
  )

  const renderString = () => renderMarkup(contentString(), "<div><p><br><ul><li><b>")

  return (
    <div className="md:pr-8 md:w-2/3 mt-4 w-full">
      <Message warning={true}>{content()}</Message>
    </div>
  )
}
