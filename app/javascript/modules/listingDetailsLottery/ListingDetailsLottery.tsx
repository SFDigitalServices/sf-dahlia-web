import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailItem, t } from "@bloom-housing/ui-components"
import { ListingDetailsLotteryResults } from "./ListingDetailsLotteryResults"
import { isLotteryComplete } from "../../util/listingUtil"

export interface ListingDetailsLotteryProps {
  imageSrc: string
  listing: RailsListing
}

export const ListingDetailsLottery = ({ imageSrc, listing }: ListingDetailsLotteryProps) => {
  return (
    listing &&
    isLotteryComplete(listing) && (
      <ListingDetailItem
        imageAlt={""}
        imageSrc={imageSrc}
        title={t("lottery")}
        subtitle={t("lottery.lotteryInfoSubheader")}
      >
        <ListingDetailsLotteryResults listing={listing} />
      </ListingDetailItem>
    )
  )
}
