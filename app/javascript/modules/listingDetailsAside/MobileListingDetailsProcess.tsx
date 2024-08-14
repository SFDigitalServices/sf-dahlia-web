import React from "react"
import { ListingDetailItem, t, Mobile } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"
import { ListingDetailsLotteryInfo } from "../listingDetailsLottery/LotteryDetailsLotteryInfo"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"
import { isRental } from "../../util/listingUtil"
import { ListingDetailsSeeTheUnit } from "./ListingDetailsSeeTheUnit"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
  isApplicationOpen: boolean
}

export const MobileListingDetailsProcess = ({
  listing,
  imageSrc,
  isApplicationOpen,
}: ListingDetailsSidebarProps) => {
  const isListingRental = isRental(listing)

  return (
    listing &&
    isApplicationOpen && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t(isListingRental ? "listings.process.header" : "label.seeTheUnit")}
          subtitle={isListingRental ? t("listings.process.subheader") : ""}
          hideHeader={true}
          desktopClass="header-hidden"
        >
          <ListingDetailsLotteryInfo listing={listing} />
          <ListingDetailsLotteryResults listing={listing} />
          {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
          {isListingRental ? (
            <>
              <ListingDetailsOpenHouses listing={listing} />
              <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} />
            </>
          ) : (
            <ListingDetailsSeeTheUnit listing={listing} />
          )}
        </ListingDetailItem>
      </Mobile>
    )
  )
}
