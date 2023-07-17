import React from "react"
import { ListingDetailItem, t, Mobile } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"
import { ListingDetailsLotteryInfo } from "../listingDetailsLottery/LotteryDetailsLotteryInfo"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
  isApplicationOpen: boolean
  whatToEpectContent: string
}

export const MobileListingDetailsProcess = ({
  listing,
  imageSrc,
  isApplicationOpen,
  whatToEpectContent
}: ListingDetailsSidebarProps) => {
  return (
    listing &&
    isApplicationOpen && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t("listings.process.header")}
          subtitle={t("listings.process.subheader")}
          hideHeader={true}
          desktopClass="header-hidden"
        >
          <ListingDetailsLotteryInfo listing={listing} />
          <ListingDetailsLotteryResults listing={listing} />
          {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
          <ListingDetailsOpenHouses listing={listing} />
          <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} whatToExpectContent={whatToEpectContent} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
