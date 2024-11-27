import React from "react"
import { ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryResults } from "./ListingDetailsLotteryResults"
import { ListingDetailsProcess } from "../listingDetailsAside/ListingDetailsProcess"
import { isFcfsSalesListing, isOpen } from "../../util/listingUtil"
import { ListingDetailsLotteryInfo } from "./LotteryDetailsLotteryInfo"
import { ListingDetailsWaitlist } from "../listingDetailsAside/ListingDetailsWaitlist"
import { ListingDetailsOpenHouses } from "../listingDetailsAside/ListingDetailsOpenHouses"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

export interface ListingDetailsLotteryProps {
  imageSrc: string
  listing: RailsListing
}

export const MobileListingDetailsLottery = ({ imageSrc, listing }: ListingDetailsLotteryProps) => {
  const { unleashFlag: isSalesFcfsEnabled } = useFeatureFlag("FCFS", false)
  const shouldNotRenderForFcfs = isSalesFcfsEnabled && isFcfsSalesListing(listing)
  const shouldRenderComponent = shouldNotRenderForFcfs ? false : !isOpen(listing)

  return (
    listing &&
    !shouldNotRenderForFcfs && (
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
          <ListingDetailsProcess listing={listing} isApplicationOpen={shouldRenderComponent} />
        </ListingDetailItem>
      </Mobile>
    )
  )
}
