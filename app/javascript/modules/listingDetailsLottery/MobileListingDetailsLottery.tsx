import React from "react"
import { ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryResults } from "./ListingDetailsLotteryResults"
import { ListingDetailsProcess } from "../listingDetailsAside/ListingDetailsProcess"
import { isOpen } from "../../util/listingUtil"
import { ListingDetailsLotteryInfo } from "./LotteryDetailsLotteryInfo"
import { ListingDetailsWaitlist } from "../listingDetailsAside/ListingDetailsWaitlist"
import { ListingDetailsOpenHouses } from "../listingDetailsAside/ListingDetailsOpenHouses"

export interface ListingDetailsLotteryProps {
  imageSrc: string
  listing: RailsListing
  whatToExpectContent: string
}

export const MobileListingDetailsLottery = ({ imageSrc, listing, whatToExpectContent }: ListingDetailsLotteryProps) => {
  const isApplicationOpen = isOpen(listing)

  return (
    listing &&
    !isApplicationOpen && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t("lottery")}
          subtitle={t("lottery.lotteryInfoSubheader")}
        >
          <ListingDetailsLotteryInfo listing={listing} />
          <ListingDetailsLotteryResults listing={listing} />
          <ListingDetailsWaitlist listing={listing} />
          <ListingDetailsOpenHouses listing={listing} />
          <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} whatToExpectContent={whatToExpectContent} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
