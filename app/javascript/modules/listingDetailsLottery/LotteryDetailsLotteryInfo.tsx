import React from "react"
import { SidebarBlock, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { getTranslatedString, localizedFormat, renderMarkup } from "../../util/languageUtil"
import { isLotteryComplete, isOpen } from "../../util/listingUtil"

export interface ListingDetailsLotteryInfoProps {
  listing: RailsListing
}

// TODO: remove after hotfix for 55 Oak
const is55OakListingTemp = (listingID: string) => listingID === "a0W4U00000SW2XsUAL"

export const ListingDetailsLotteryInfo = ({ listing }: ListingDetailsLotteryInfoProps) => {
  if (isOpen(listing) || !listing.Lottery_Date || isLotteryComplete(listing)) {
    return null
  }

  return (
    <>
      <div className="border-b border-gray-400 md:border-b-0">
        <SidebarBlock title={t("label.lottery")} priority={2}>
          {!is55OakListingTemp(listing.listingID) && (
            <p className="flex justify-between mb-4">
              <span>{localizedFormat(listing.Lottery_Date, "LL")}</span>
              <span className="font-bold">{localizedFormat(listing.Lottery_Date, "h:mm a")}</span>
            </p>
          )}
          <div className="text-gray-700">
            {listing.Lottery_Venue &&
              renderMarkup(
                getTranslatedString(listing.Lottery_Venue, "Lottery_Venue__c", listing.translations)
              )}
          </div>
          {!is55OakListingTemp(listing.listingID) && (
            <p className="mt-4 text-gray-700">{t("label.preLotteryInfo")}</p>
          )}
        </SidebarBlock>
      </div>
      {!is55OakListingTemp(listing.listingID) && (
        <div className="border-b border-gray-400 md:border-b-0">
          <SidebarBlock title={t("lottery.lotteryResults")} priority={2}>
            <p className="mb-4">{localizedFormat(listing.Lottery_Results_Date, "LL")}</p>
            <p className="text-gray-700">{t("lottery.completeResultsWillBePosted")}</p>
          </SidebarBlock>
        </div>
      )}
    </>
  )
}
