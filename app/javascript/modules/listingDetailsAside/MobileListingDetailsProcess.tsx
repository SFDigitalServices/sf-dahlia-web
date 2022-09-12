import React from "react"
import { ListingDetailItem, t, Mobile } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import { isOpen } from "../../util/listingUtil"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"
import { ListingDetailsLotteryInfo } from "../listingDetailsLottery/LotteryDetailsLotteryInfo"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
}

export const MobileListingDetailsProcess = ({ listing, imageSrc }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = isOpen(listing)
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
          <ListingDetailsProcess listing={listing} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
