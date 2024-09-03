import React from "react"
import { SidebarBlock, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { getTranslatedString, localizedFormat, renderMarkup } from "../../util/languageUtil"
import { isLotteryCompleteDeprecated, isOpen } from "../../util/listingUtil"

export interface ListingDetailsLotteryInfoProps {
  listing: RailsListing
}

export const ListingDetailsLotteryInfo = ({ listing }: ListingDetailsLotteryInfoProps) => {
  if (isOpen(listing) || !listing.Lottery_Date || isLotteryCompleteDeprecated(listing)) {
    return null
  }

  return (
    <>
      <div className="border-b border-gray-400 md:border-b-0">
        <SidebarBlock title={t("label.lottery")}>
          <p className="flex justify-between mb-4">
            <span>{localizedFormat(listing.Lottery_Date, "LL")}</span>
            <span className="font-bold">{localizedFormat(listing.Lottery_Date, "h:mm a")}</span>
          </p>
          <div className="text-gray-700">
            {listing.Lottery_Venue &&
              renderMarkup(
                getTranslatedString(listing.Lottery_Venue, "Lottery_Venue__c", listing.translations)
              )}
          </div>
          {process.env.COVID_UPDATE !== "true" && (
            <p className="mt-4 text-gray-700">{t("label.preLotteryInfo")}</p>
          )}
        </SidebarBlock>
      </div>

      <div className="border-b border-gray-400 md:border-b-0">
        <SidebarBlock title={t("lottery.lotteryResults")}>
          <p className="mb-4">{localizedFormat(listing.Lottery_Results_Date, "LL")}</p>
          <p className="text-gray-700">{t("lottery.completeResultsWillBePosted")}</p>
        </SidebarBlock>
      </div>
    </>
  )
}
