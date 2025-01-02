import React from "react"
import { ListingDetailItem, SidebarBlock, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import {
  getFcfsSalesListingState,
  isFcfsSalesListing,
  isOpen,
  isRental,
  isSale,
} from "../../util/listingUtil"
import { ListingDetailsApply } from "./ListingDetailsApply"
import { ListingDetailsApplicationDate } from "./ListingDetailsApplicationDate"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"
import { ListingDetailsLotteryInfo } from "../listingDetailsLottery/LotteryDetailsLotteryInfo"
import { ListingDetailsWaitlist } from "./ListingDetailsWaitlist"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"
import { ListingDetailsSeeTheUnit } from "./ListingDetailsSeeTheUnit"
import { localizedFormat } from "../../util/languageUtil"
import { fcfsNoLotteryRequired } from "../noLotteryRequired/fcfsNoLotteryRequired"
import { ListingState } from "../listings/ListingState"
import { NeedHelpBlock } from "./ListingDetailsNeedHelp"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsAside = ({ listing, imageSrc }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = isFcfsSalesListing(listing)
    ? getFcfsSalesListingState(listing) !== ListingState.Closed
    : isOpen(listing)
  const isSaleListing = isSale(listing)
  const isListingRental = isRental(listing)

  const expectedMoveInDateBlock = (
    <SidebarBlock title={t("listings.expectedMoveinDate")} priority={2}>
      {localizedFormat(listing.Expected_Move_in_Date, "MMMM YYYY")}
    </SidebarBlock>
  )

  return (
    <ul>
      <ListingDetailItem
        imageAlt={""}
        imageSrc={imageSrc}
        title={t("listings.process.header")}
        subtitle={t("listings.process.subheader")}
        hideHeader={true}
        desktopClass="header-hidden"
      >
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
          <div className="hidden md:block">
            <ListingDetailsApplicationDate listing={listing} />
            {
              // Only show the fcfsNoLotteryRequired component for FCFS Sales listings
              isFcfsSalesListing(listing) && fcfsNoLotteryRequired()
            }
            <ListingDetailsLotteryInfo listing={listing} />
            <ListingDetailsLotteryResults listing={listing} />
            {/* ListingDetailsWaitlist gets rendered in a different order due to info architecture
          importance in different states */}
            {!isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
            {
              // For sales listings, open house information appears in the See the Unit component
              // Rental listings do not have the See the Unit component
              // so we need to show open house information for rental listings here
              isListingRental && <ListingDetailsOpenHouses listing={listing} />
            }
            {isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            {listing.Accepting_Online_Applications && <ListingDetailsApply listing={listing} />}
            {isSaleListing && <ListingDetailsSeeTheUnit listing={listing} />}
            {isApplicationOpen && <NeedHelpBlock listing={listing} />}
            {isSaleListing && listing.Expected_Move_in_Date && expectedMoveInDateBlock}
            <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} />
          </div>
        </aside>
      </ListingDetailItem>
    </ul>
  )
}
