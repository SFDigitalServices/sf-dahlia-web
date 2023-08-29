import React from "react"
import { Message, t } from "@bloom-housing/ui-components"
import { RESERVED_COMMUNITY_TYPES } from "../constants"
// import { renderInlineMarkup, renderMarkup } from "../../util/languageUtil"
import { renderMarkup } from "../../util/languageUtil"

export interface ListingDetailsReservedBannerProps {
  reservedCommunityMinimumAge?: number
  reservedCommunityType?: string
  customListingType?: string
  scrollToRef
}

const handleClick = (scrollToRef) => {
  scrollToRef.current?.scrollIntoView()
}

const buttonStyle = {
  background: "none",
  border: "none",
  padding: "0",
  font: "inherit",
  cursor: "pointer",
  // text-decoration: "underline",
  color: "blue",
}

export const ListingDetailsReservedBanner = ({
  reservedCommunityMinimumAge,
  reservedCommunityType,
  customListingType,
  scrollToRef,
}: ListingDetailsReservedBannerProps) => {
  // const scrollToComponent = () => {
  //   scrollToRef.current?.scrollIntoView({ behavior: "smooth" })
  // }

  console.log(`customListingType = ${customListingType}`)

  if (customListingType) {
    // const getContent = () => renderInlineMarkup(t(`listings.customListingType.educator.banner`))

    const element = () => {
      // console.log(t(`listings.customListingType.educator.banner`))
      // console.log("vs")
      // console.log(
      //   renderMarkup(
      //     t(`listings.customListingType.educator.banner`),
      //     "<div><p><br><ol><ul><li><b><hr><a>"
      //   )
      // )
      // console.log(<b>heelo</b>)
      // console.log("hello")
      // console.log(`host = ${window.location.host}#listing-detail-eligibility`)
      console.log(`path is a = ${window.location.href}#listing-detail-eligibility`)
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
          <br />
          <div>
            {/* <a href="#" onClick={scrollToComponent}>
              Scroll to Component
            </a> */}
            <button style={buttonStyle} onClick={() => handleClick(scrollToRef)}>
              Scroll
            </button>
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
