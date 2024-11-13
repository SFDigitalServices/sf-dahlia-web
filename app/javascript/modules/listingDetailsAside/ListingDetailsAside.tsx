import React from "react"
import { LinkButton, ListingDetailItem, SidebarBlock, t } from "@bloom-housing/ui-components"
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
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { getSfGovUrl, localizedFormat } from "../../util/languageUtil"
import { fcfsNoLotteryRequired } from "../noLotteryRequired/fcfsNoLotteryRequired"
import { ListingState } from "../listings/ListingState"
import { getHousingCounselorsPath } from "../../util/routeUtil"

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

  const { unleashFlag: isSalesFcfsEnabled } = useFeatureFlag("FCFS", false)

  const expectedMoveInDateBlock = (
    <SidebarBlock title={t("listings.expectedMoveinDate")}>
      {localizedFormat(listing.Expected_Move_in_Date, "MMMM YYYY")}
    </SidebarBlock>
  )

  const needHelpBlock = (
    <SidebarBlock title={t("listings.apply.needHelp")}>
      {isListingRental && (
        <div className={"mb-4"}>{t("listings.apply.visitAHousingCounselor")}</div>
      )}
      <LinkButton
        transition={true}
        newTab={true}
        href={
          !isListingRental
            ? getSfGovUrl(
                "https://www.sf.gov/resource/2022/homebuyer-program-counseling-agencies",
                7209
              )
            : getHousingCounselorsPath()
        }
        className={"w-full"}
      >
        {t("housingCounselor.findAHousingCounselor")}
      </LinkButton>
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
            {isFcfsSalesListing(listing) && isSalesFcfsEnabled && fcfsNoLotteryRequired()}
            <ListingDetailsLotteryInfo listing={listing} />
            <ListingDetailsLotteryResults listing={listing} />
            {/* ListingDetailsWaitlist gets rendered in a different order due to info architecture
          importance in different states */}
            {!isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
            {(isListingRental || !isSalesFcfsEnabled) && (
              <ListingDetailsOpenHouses listing={listing} />
            )}
            {isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            <ListingDetailsApply listing={listing} />
            {isSaleListing && isSalesFcfsEnabled && <ListingDetailsSeeTheUnit listing={listing} />}
            {isApplicationOpen && needHelpBlock}
            {isSaleListing && listing.Expected_Move_in_Date && expectedMoveInDateBlock}
            <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} />
          </div>
        </aside>
      </ListingDetailItem>
    </ul>
  )
}
