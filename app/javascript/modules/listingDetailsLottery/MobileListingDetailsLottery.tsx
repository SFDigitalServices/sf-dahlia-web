import React from "react"
import { ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryResults } from "./ListingDetailsLotteryResults"
import { ListingDetailsProcess } from "../listingDetailsAside/ListingDetailsProcess"
import { isOpen } from "../../util/listingUtil"

export interface ListingDetailsLotteryProps {
  imageSrc: string
  listing: RailsListing
}

export const MobileListingDetailsLottery = ({ imageSrc, listing }: ListingDetailsLotteryProps) => {
  return (
    listing &&
    !isOpen(listing) && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t("lottery")}
          subtitle={t("lottery.lotteryInfoSubheader")}
        >
          <ListingDetailsLotteryResults listing={listing} />
          <ListingDetailsProcess listing={listing} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
